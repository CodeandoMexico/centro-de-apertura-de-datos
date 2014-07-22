/**
 * RequestController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  index: function(req, res) {
    Request.find({sort: 'createdAt DESC'}).populate('voted').exec(function(err, requests) {
      if (err) return res.send(500, err);
      return res.view({requests: requests});
    });
  },

  find: function(req, res) {
    Request.findOne({id: req.param('id')}).populate('voted').exec(function(err, request) {
      if (err) return res.send(500, err);
      return res.view({request: request});
    });
  },

  voteUp: function(req, res) {
    var userId = req.session.user,
        requestId = req.param('id');
    User.findOne({id: userId}).exec(function(err, user) {
      if (err) return res.send(500, err);
      Request.findOne({id: requestId}).populate('voted').exec(function(err, request) {
        if (err) return res.send(500, err);
        user.votes.add(request.id);
        user.save(function(err, user) {
          if (err) return res.send(500, err);
          res.send(200, {votes: request.voted});
        });
      });
    });
  },

  makeRequest: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      // pass
    } else if (req.method == 'GET' || req.method == 'get') {
      return res.view();
    }
  },
};
