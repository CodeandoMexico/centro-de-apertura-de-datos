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

  getVotes: function(id, next) {
    User.findOne({id: id})
    .populate('votes')
    .exec(function(err, user) {
      var user_votes = [];
      if (user) {
        for (i in user.votes) {
          // Only grab actual request IDs and not Sails.js
          // add() and remove() functions.
          if (user.votes[i].id) {
            user_votes.push(user.votes[i].id);
          }
        }
      }
      next(user_votes);
    });
  },

};
