/*
  Handles OAuth authentication with Twitter's API.
*/
var twitterAPI = require('node-twitter-api');
module.exports.oauth = {
  twitter: new twitterAPI({
    consumerKey: process.env.OAUTH_TWITTER_KEY,
    consumerSecret: process.env.OAUTH_TWITTER_SECRET,
    callback: process.env.OAUTH_TWITTER_CALLBACK_HOSTNAME + '/user/authCallback'
  })
}

/*
  Handles date formatting.
*/
module.exports.moment = require('moment').locale('es-MX');

/*
  Handles URL formatting.
*/
module.exports.url = require('url');

module.exports.valid_url = require('valid-url');
