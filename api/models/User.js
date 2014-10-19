/**
* User.js
*/

module.exports = {

  attributes: {
    twitter_id: {
      type: 'STRING',
      unique: true,
      required: true
    },
    voted_for: {
      collection: 'request',
      via: 'voted_by'
    },
    requests: {
      collection: 'request',
      via: 'user'
    }
	},

};
