/**
 * RequestController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  index: function(req, res) {

    function getPaginationData(req_param_page, requests) {
        var pd = {};

        // Get the total amount of possible pages.
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
          pd.reached_left_page_limit = true;
        }

        // Max to the right.
        if (pd.requested_page >= pages_int) {
          pd.requested_page = pages_int;
          pd.reached_right_page_limit = true;
        }

        // Tells the views which pages are back/forward.
        pd.previous_page = pd.requested_page - 1;
        pd.next_page = pd.requested_page + 1;

        // Get which requests should be shown in this page.
        var start = (pd.requested_page - 1) * sails.config.globals.cmx.requests_per_page;
        pd.paged_requests = requests.slice(start, start + sails.config.globals.cmx.requests_per_page);

        return pd;
    }

    // Used to tell the view whether previous (left) and
    // next (right) paginating buttons should be shown.
    var reached_left_page_limit = false;
    var reached_right_page_limit = false;

    // Default sorting method is set to 'newest first'.
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
      // If the user is logged in, get his/her votes directly.
      // This is done to avoid looping through all the 'voted'
      // arrays of each request in this view.
      if (req.session.user) {
        User.findOne({id: req.session.user.id})
        .populate('votes')
        .exec(function(err, user) {
          var user_votes = [];
          if (user) {
            for (i in user.votes) {
              // Only grab actual request IDs and not Sails.js
              // add() and remove() functions.
              if (user.votes[i].id) {
                user_votes.push(user.votes[i].id);
              }
            }
          }
          if (sorting_method  == 'most_votes') {
            requests.sort(Request.compareVotes);
          }

          var pd = getPaginationData(req.param('page'), requests);

          return res.view({
            requests: pd.paged_requests,
            user_votes: user_votes,
            newest_li_class: newest_li_class,
            most_votes_li_class: most_votes_li_class,
            reached_left_page_limit: pd.reached_left_page_limit,
            reached_right_page_limit: pd.reached_right_page_limit,
            previous_page: pd.previous_page,
            next_page: pd.next_page,
            sorting_method: sorting_method,
            requested_page: pd.requested_page
          });
        });
      } else {
        // Current user is not logged-in.
        if (sorting_method == 'most_votes') {
          requests.sort(Request.compareVotes);
        }

        var pd = getPaginationData(req.param('page'), requests);

        return res.view({
          requests: pd.paged_requests,
          user_votes: [],
          newest_li_class: newest_li_class,
          most_votes_li_class: most_votes_li_class,
          reached_left_page_limit: pd.reached_left_page_limit,
          reached_right_page_limit: pd.reached_right_page_limit,
          previous_page: pd.previous_page,
          next_page: pd.next_page,
          sorting_method: sorting_method,
          requested_page: pd.requested_page
        });
      }
    });
  },

  find: function(req, res) {
    Request.findOne({id: req.param('id')}).populate('voted').exec(function(err, request) {
      if (err) return res.send(500, err);
      return res.view({request: request});
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
    if (req.method == 'POST' || req.method == 'post') {
      // query db
    } else if (req.method == 'GET' || req.method == 'get') {
      res.view();
    }
  }
};
