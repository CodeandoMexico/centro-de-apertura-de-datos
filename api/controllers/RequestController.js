/**
 * RequestController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  index: function(req, res) {
    function compareVotes(a, b) {
      if (a.voted.length < b.voted.length)
        return 1;
      if (a.voted.length > b.voted.length)
        return -1;
      return 0;
    }

    // Used to tell the view which tab must be
    // shown as selected.
    var newest_li_active = "active";
    var most_votes_li_active = "";
    var search_li_active = "";

    // Used to tell the view whether previous (left) and
    // next (right) paginating buttons should be shown.
    var reached_left_page_limit = false;
    var reached_right_page_limit = false;

    // Tells the views how to make the prev/next buttons act.
    // The default sorting method is 'newest' first.
    var allowed_sorting_method = ['newest', 'most_votes'];
    var sorting_method = 'newest';
    if (typeof req.param('sort_by') === 'undefined') {
      // No sorting method given by user.
      // Default to 'newest';
    } else {
      if (allowed_sorting_method.indexOf(req.param('sort_by')) <= -1) {
        // Strange sorting method given by user.
        // Default to 'newest'.
      } else {
        sorting_method = req.param('sort_by');
      }
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
            requests.sort(compareVotes);
            newest_li_active = "";
            most_votes_li_active = "active";
          }
          return res.view({
            requests: requests,
            user_votes: user_votes,
            newest_li_active: newest_li_active,
            most_votes_li_active: most_votes_li_active,
            search_li_active: search_li_active,
          });
        });
      } else {
        // Current user is not logged-in.
        if (sorting_method == 'most_votes') {
          requests.sort(compareVotes);
          newest_li_active = "";
          most_votes_li_active = "active";
        }

        var pages_float = requests.length / sails.config.globals.cmx.requests_per_page;
        var pages_int = (pages_float === parseInt(pages_float)) ? pages_float : Math.floor(pages_float) + 1;
        var requested_page = 1;
        if (typeof req.param('page') === 'undefined') { // No page parameter.
          // Leave default as 1.
        } else {
          if (isNaN(req.param('page'))) { // Given page parameter is not a number.
            // Leave default as 1.
          } else {  // Given page parameter is a number. Cast to int.
            requested_page = parseInt(req.param('page'));
          }
        }

        // Tells the views which pages are back/forward the
        // current one according to the 'page' parameter.
        var previous_page = requested_page - 1;
        var next_page = requested_page + 1;

        var base = (requested_page - 1) * sails.config.globals.cmx.requests_per_page;
        var paged_requests = requests.slice(base, base + sails.config.globals.cmx.requests_per_page);


        if (requested_page <= 1) {
          reached_left_page_limit = true;
        }

        if (requested_page >= pages_int) {
          reached_right_page_limit = true;
        }

        // Very big or very negative page number given.
        if (paged_requests.length == 0) {
          return res.redirect('/');
        }

        return res.view({
          requests: paged_requests,
          user_votes: [],
          newest_li_active: newest_li_active,
          most_votes_li_active: most_votes_li_active,
          search_li_active: search_li_active,
          reached_left_page_limit: reached_left_page_limit,
          reached_right_page_limit: reached_right_page_limit,
          previous_page: previous_page,
          next_page: next_page,
          sorting_method: sorting_method,
          requested_page: requested_page
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
