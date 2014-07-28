var twitterAPI = require('node-twitter-api');
module.exports.oauth_stuff = {
  twitter: new twitterAPI({
    consumerKey: process.env.OAUTH_TWITTER_KEY,
    consumerSecret: process.env.OAUTH_TWITTER_SECRET,
    callback: process.env.OAUTH_TWITTER_CALLBACK_HOSTNAME + '/authCallback'
  })
}
