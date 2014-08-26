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
var moment = require('moment');
moment.locale('es-MX');
module.exports.moment = moment;

/*
  Handles URL formatting.
*/
module.exports.url = require('url');

/*
  Handles URL validation.
*/
module.exports.valid_url = require('valid-url');
