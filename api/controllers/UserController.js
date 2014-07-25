/**
 * UserController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

	signin: function(req, res) {
    sails.config.oauth_stuff.twitter.getRequestToken(
      function(error, request_token, request_token_secret, results) {
      if (error) {
         console.log('Error getting OAuth request token', error);
      } else {
         req.session.user = {
           request_token: request_token,
           request_token_secret: request_token_secret
         }
         var return_url = 'https://twitter.com/oauth/authenticate?oauth_token=' + request_token;
         return res.redirect(return_url);
      }
    });
  },

  authCallback: function(req, res) {
    var has_request_tokens = req.session.user &&
                             req.session.user.request_token &&
                             req.session.user.request_token_secret;

    if (has_request_tokens) {
      sails.config.oauth_stuff.twitter.getAccessToken(
        req.session.user.request_token,
        req.session.user.request_token_secret,
        req.param('oauth_verifier'),
        function(error, access_token, access_token_secret, results) {
        if (error) {
          console.log('Error getting access token:', error);
        } else {
          sails.config.oauth_stuff.twitter.verifyCredentials(
            access_token, 
            access_token_secret, 
            function(error, data, response) {
            if (error) {
              console.log('Error verifying credentials:', error);
            } else {
              req.session.user = {
                access_token: access_token,
                access_token_secret: access_token_secret,
                screen_name: data.screen_name,
                name: data.name,
                id: data.id
              }

              User.findOne({id: data.id}).exec(function(err, user) {
                if (!user) {
                  // First time I see this twitter user.
                  // Create an entry in the DB to store this
                  // new user's votes in the future.
                  User.create({
                    id: data.id
                  }).exec(function(err, user) {
                    if (err) console.log('Error creating user:', err);
                    res.redirect('/');
                  });
                } else {
                  res.redirect('/');
                }
              });
            }
          });
       }
      });
    } else {
      // The user got here by accessing an invalid or
      // incomplete twitter oauth URL.
      req.session = null;
      return res.redirect('/');
    }
  },

  signout: function(req, res) {
    req.session.user = null;
    req.flash('success', 'Has finalizado tu sesi&oacute;n');
    return res.redirect('/');
  },

  giveVote: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      User.findOne({id: req.session.user.id}).exec(function(err, user) {
        if (err) console.log('Error looking for the current user:', err);
        Request.findOne({id: req.param('id')})
        .populate('voted')
        .exec(function(err, request) {
          if (err) console.log('Error looking for the request:', err);
          user.votes.add(request.id);
          user.save(function(err, user) {
            if (err) console.log('Error giving the vote:', err);
            return res.redirect('/');
          });
        });
      });
    } else {
      return res.redirect('/');
    }
  },

  removeVote: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      User.findOne({id: req.session.user.id}).exec(function(err, user) {
        if (err) console.log('Error looking for the current user:', err);
        Request.findOne({id: req.param('id')})
        .populate('voted')
        .exec(function(err, request) {
          if (err) console.log('Error looking for the request:', err);
          user.votes.remove(request.id);
          user.save(function(err, user) {
            if (err) console.log('Error removing the vote:', err);
            return res.redirect('/');
          });
        });
      });
    } else {
      return res.redirect('/');
    }
  },

};
