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

    var newest_li_active = "active";
    var most_popular_li_active = "";
    var search_li_active = "";

    Request.find({sort: 'createdAt DESC'})
    .populate('voted')
    .exec(function(err, requests) {
      if (err) return res.send(500, err);
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
          if (req.param('sort_by') == 'most_popular') {
            requests.sort(compareVotes);
            newest_li_active = "";
            most_popular_li_active = "active";
          }
          return res.view({
            requests: requests,
            user_votes: user_votes,
            newest_li_active: newest_li_active,
            most_popular_li_active: most_popular_li_active,
            search_li_active: search_li_active
          });
        });
      } else {
        // Current user is not logged-in.
        // Return an empty array for voted requests.
        if (req.param('sort_by') == 'most_popular') {
          requests.sort(compareVotes);
          newest_li_active = "";
          most_popular_li_active = "active";
        }
        return res.view({
          requests: requests,
          user_votes: [],
          newest_li_active: newest_li_active,
          most_popular_li_active: most_popular_li_active,
          search_li_active: search_li_active
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
