/**
 * UserController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  signin: function(req, res) {
    sails.config.oauth.twitter.getRequestToken(
      function(error, request_token, request_token_secret, results) {
      if (error) {
         console.log('Error getting OAuth request token', error);
      } else {
         req.session.oauth = {
           request_token: request_token,
           request_token_secret: request_token_secret
         }
         var return_url = 'https://twitter.com/oauth/authenticate?oauth_token=' + request_token;
         return res.redirect(return_url);
      }
    });
  },

  authCallback: function(req, res) {
    var has_request_tokens = req.session.oauth &&
                             req.session.oauth.request_token &&
                             req.session.oauth.request_token_secret;

    if (has_request_tokens) {
      sails.config.oauth.twitter.getAccessToken(
        req.session.oauth.request_token,
        req.session.oauth.request_token_secret,
        req.param('oauth_verifier'),
        function(error, access_token, access_token_secret, results) {
        if (error) {
          console.log('Error getting access token:', error);
        } else {
          sails.config.oauth.twitter.verifyCredentials(
            access_token, 
            access_token_secret, 
            function(error, data, response) {
            if (error) {
              console.log('Error verifying credentials:', error);
            } else {
              req.session.oauth = {
                access_token: access_token,
                access_token_secret: access_token_secret,
              }
              req.session.user = {
                screen_name: data.screen_name,
                name: data.name,
                profile_image_url: data.profile_image_url,
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
                    return res.redirect('/');
                  });
                } else {
                  return res.redirect('/');
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
    req.session.oauth = null;
    req.session.user = null;
    req.session.flash = {
      type: 'success',
      text: 'Has finalizado tu sesi&oacute;n',
    };
    return res.redirect('/');
  },

  giveVote: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      User.findOne({id: req.session.user.id})
      .exec(function(err, user) {
        if (err) console.log('Error looking for the current user:', err);
        Request.findOne({id: req.param('id')})
        .populate('voted')
        .exec(function(err, request) {
          if (err) console.log('Error looking for the request:', err);
          user.votes.add(request.id);
          user.save(function(err, user) {
            if (err) {
              console.log('Error giving the vote:', err);
              req.session.flash = {
                type: 'danger',
                text: 'Error al votar',
              };
            }
            req.session.flash = {
              type: 'success',
              text: 'Has votado exitosamente',
            };
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
      User.findOne({id: req.session.user.id})
      .exec(function(err, user) {
        if (err) console.log('Error looking for the current user:', err);
        Request.findOne({id: req.param('id')})
        .populate('voted')
        .exec(function(err, request) {
          if (err) console.log('Error looking for the request:', err);
          user.votes.remove(request.id);
          user.save(function(err, user) {
            if (err) {
              console.log('Error removing the vote:', err);
              req.session.flash = {
                type: 'danger',
                text: 'No se pudo quitar el voto',
              };
            }
            req.session.flash = {
              type: 'success',
              text: 'Has quitado tu voto exitosamente',
            };
            return res.redirect('/');
          });
        });
      });
    } else {
      return res.redirect('/');
    }
  },

  profile: function(req, res) {
    if (req.method == 'GET' || req.method == 'get') {
      User.findOne({id: req.session.user.id})
      .populate('votes')
      .exec(function(err, user) {
        User.getCreatedRequests(user.id, function(requests) {
          return res.view({
            user: user,
            requests: requests
          });
        });
      });
    }
  }

};
