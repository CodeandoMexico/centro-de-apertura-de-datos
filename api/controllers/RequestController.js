/**
 * RequestController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

/*
 * Computes pagination data.
 * @param req_param_page {user given, must be int} Contains the requested page number.
 * @param requests {array of Request objects} All requests in the databse.
 */
function getPaginationData(req_param_page, requests) {
    var pd = {};

    pd.show_prev_page_btn = true;
    pd.show_next_page_btn = true;

    // Get the amount of possible pages.
    var pages_float = requests.length / sails.config.globals.cmx.requests_per_page;
    var pages_int = (pages_float === parseInt(pages_float)) ? pages_float : Math.floor(pages_float) + 1;

    // Always default to page 1.
    pd.requested_page = 1;
    if (typeof req_param_page  === 'undefined') { // No page parameter given.
      // Keep default.
    } else {
      if (isNaN(req_param_page)) { // Given page parameter is not a number.
        // Keep default.
      } else {  // Given page parameter is a number. Cast to int.
        pd.requested_page = parseInt(req_param_page);
      }
    }

    // Max to the left.
    if (pd.requested_page <= 1) {
      pd.requested_page = 1;
      pd.show_prev_page_btn = false;
    }

    // Max to the right.
    if (pd.requested_page >= pages_int) {
      pd.requested_page = pages_int;
      pd.show_next_page_btn = false;
    }

    // Tells the views which pages are back/forward.
    pd.previous_page = pd.requested_page - 1;
    pd.next_page = pd.requested_page + 1;

    // Get which requests should be shown in this page.
    var start = (pd.requested_page - 1) * sails.config.globals.cmx.requests_per_page;
    pd.paged_requests = requests.slice(start, start + sails.config.globals.cmx.requests_per_page);

    return pd;
}

module.exports = {

  index: function(req, res) {
    // Default sorting method is set to 'newest first'.
    // Send information to the view, so it knows what
    // nav-bar pill to show as active.
    var sorting_method = 'newest';
    var newest_li_class = "active";
    var most_votes_li_class = "";
    switch(req.param('sort_by')) {
      case 'most_votes':
        sorting_method = 'most_votes';
        newest_li_class = "";
        most_votes_li_class = "active";
        break;
    }

    Request.find({sort: 'createdAt DESC'})
    .populate('voted')
    .exec(function(err, requests) {
      if (err) return console.log(err);

      if (sorting_method == 'most_votes') {
      // Override the default sorting method.
        requests.sort(Request.compareVotes);
      }

      data = {
        newest_li_class: newest_li_class,
        most_votes_li_class: most_votes_li_class,
        sorting_method: sorting_method,
        pd: getPaginationData(req.param('page'), requests)
      };

      if (req.session.user && req.session.user.id) {
        User.getVotes(req.session.user.id, function(user_votes) {
          data.user_votes = user_votes
          return res.view(data);
        });
      } else {
          data.user_votes = []
          return res.view(data);
      }
    });
  },

  create: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      Request.create({
        title: req.param('title'),
        url: req.param('url'),
        description: req.param('description')
      }, function(err, request) {
        if (err) return res.send(500, err);
        req.flash('message', 'Solicitud creada');
        return res.redirect('/');
      });
    } else {
      return res.redirect('/');
    }
  },

  search: function(req, res) {
    if (req.method == 'GET' || req.method == 'get') {
      var sorting_method = 'newest';
      var newest_li_class = "active";
      var most_votes_li_class = "";
      switch(req.param('sort_by')) {
        case 'most_votes':
          sorting_method = 'most_votes';
          newest_li_class = "";
          most_votes_li_class = "active";
          break;
      }
      Request.find()
      .where({
        or: [{
          url: {contains: req.param('q')}
        }, {
          description: {contains: req.param('q')}
        }, {
          title: {contains: req.param('q')}
        }]
      })
      .populate('voted')
      .exec(function(err, requests) {
        if (sorting_method == 'most_votes') {
          // Override the default sorting method.
          requests.sort(Request.compareVotes);
        }
        return res.view('request/index', {
            user_votes: [],
            newest_li_class: newest_li_class,
            most_votes_li_class: most_votes_li_class,
            sorting_method: sorting_method,
            pd: getPaginationData(req.param('page'), requests),
            search_term: req.param('q')
        });
      });
    } else {
      return res.redirect('/');
    }
  }
};
