var twitterAPI = require('node-twitter-api');
module.exports.oauth_stuff = {
  twitter: new twitterAPI({
    consumerKey: 'LEbvogvyw0dhHH3eudgtzUWqt',
    consumerSecret: 'M99MyJkmqqsTlMwiQIKTBNef0Lm4KqqF5oOAFbCeWh9ZpYEXsB',
    callback: 'http://apertura-de-datos.herokuapp.com/user/authCallback'
  })
}
