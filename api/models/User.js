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

  // TODO: wait for new sails.js release and do this via waterline.
  hasVotedForRequest: function(user_id, request_id, next) {
    User.query({
      text: 'SELECT * FROM request_voted__user_votes WHERE request_voted = $1 AND user_votes = $2',
      values: [request_id, user_id],
    }, function(err, result) {
      if (err) console.log(err);
      if (typeof result === 'undefined' || typeof result.rowCount === 'undefined') {
        next(0);
      } else {
        next(result.rowCount);
      }
    });
  },

  getCreatedRequests: function(user_id, next) {
    Request.query({
      text: 'SELECT * FROM request WHERE creator = $1',
      values: [user_id],
    }, function(err, result) {
      if (err) console.log(err);
      if (typeof result === 'undefined' || typeof result.rows === 'undefined') {
        next([]);
      } else {
        next(result.rows);
      }
    });
  },

};
