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
module.exports.moment = {
  moment: moment
}

/*
  Handles URL formatting.
*/
var url = require('url');
module.exports.url = {
  url: url
}
