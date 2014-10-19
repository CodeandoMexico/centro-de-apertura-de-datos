/*
  Handles OAuth authentication with Twitter's API.
*/
var node_twitter_api = require('node-twitter-api');
var oauth = {
  twitter: new node_twitter_api({
    consumerKey: process.env.OAUTH_TWITTER_KEY,
    consumerSecret: process.env.OAUTH_TWITTER_SECRET,
    callback: process.env.OAUTH_TWITTER_CALLBACK_HOSTNAME + '/user/authCallback'
  })
}


var moment = require('moment');
moment.locale('es-MX');

module.exports.globals = {
	_: true,
	async: true,
	sails: true,
	services: true,
	models: true,
  oauth: oauth,
  url: require('url'),
  valid_url: require('valid-url'),
  moment: moment
};

