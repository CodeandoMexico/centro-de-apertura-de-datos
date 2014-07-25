/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
    // Twitter user IDs are too long to be of the
    // 'INTEGER' type in Sails.
    id: {
      type: 'STRING',
      primaryKey: true,
      required: true
    },
    votes: {
      collection: 'request',
      via: 'voted'
    }
	},

};
