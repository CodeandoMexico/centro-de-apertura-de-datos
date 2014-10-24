/**
 * UserController.js 
 */

function _error(msg, req, res, flash) {
  console.log('(!!) ERROR @ ' + req.options.controller + '/' + req.options.action);
  console.log(msg);
  if (flash) {
    req.session.flash = {
      type: 'danger',
      text: msg
    };
  }
  return res.redirect('/');
}

function _success(msg, req, res, url) {
  req.session.flash = {
    'type': 'success',
    'text': msg
  };
  if (typeof url === 'undefined') {
    return res.redirect('/');
  } else {
    return res.redirect(url);
  }
}

module.exports = {

  signin: function(req, res) {
    sails.config.globals.oauth.twitter.getRequestToken(function(error, request_token, request_token_secret, results) {
      if (error) return _error(error, req, res, false);
      req.session.oauth = {
        request_token        : request_token,
        request_token_secret : request_token_secret
      }
      var return_url = 'https://twitter.com/oauth/authenticate?oauth_token=' + request_token;
      return res.redirect(return_url);
    });
  },

  authCallback: function(req, res) {
    var has_request_tokens = req.session.oauth &&
                             req.session.oauth.request_token &&
                             req.session.oauth.request_token_secret;

    if (has_request_tokens) {
      sails.config.globals.oauth.twitter.getAccessToken(
        req.session.oauth.request_token,
        req.session.oauth.request_token_secret,
        req.param('oauth_verifier'),
        function(error, access_token, access_token_secret, results) {
        if (error) return _error(error, req, res, false);
        sails.config.globals.oauth.twitter.verifyCredentials(access_token, access_token_secret, function(error, data, response) {
          if (error) return _error(error, req, res, false);
          req.session.oauth = {
            access_token        : access_token,
            access_token_secret : access_token_secret,
          }
          req.session.user = {
            screen_name       : data.screen_name,
            name              : data.name,
            profile_image_url : data.profile_image_url,
            twitter_id        : data.id
          }
          User.findOne({twitter_id: data.id}).exec(function(err, user) {
            if (err) return _error(err, req, res, false);
            if (!user) {
              // First time I see this twitter user.
              User.create({
                twitter_id: data.id
              }).exec(function(err, user) {
                if (err) return _error(err, req, res, false);
                req.session.user.id = user.id;
                return _success('¡Bienvenido ' + data.name + '!', req, res);
              });
            } else {
              req.session.user.id = user.id;
              return _success('¡Bienvenido ' + data.name + '!', req, res);
            }
          });
        });
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
    return _success('Has finalizado tu sesi&oacute;n', req, res)
  },

  profile: function(req, res) {
    if (req.method == 'GET' || req.method == 'get') {
      User.findOne({id: req.session.user.id})
      .populate('requests')
      .populate('voted_for')
      .exec(function(err, user) {
        return res.view({user: user});
      });
    }
  }

};
