/**
 * RequestedDataController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  index: function(req, res) {
    RequestedData.find({sort: 'createdAt DESC'}).populate('voted').exec(function(err, requestedDatas) {
      if (err) return res.send(500, err);
      return res.view('requestedData/index', {requestedDatas: requestedDatas});
    });
  },

  find: function(req, res) {
    RequestedData.findOne({id: req.param('id')}).populate('voted').exec(function(err, requestedData) {
      if (err) return res.send(500, err);
      return res.view('requestedData/find', {requestedData: requestedData});
    });
  },

  voteUp: function(req, res) {
    var userId = req.session.user,
        requestedDataId = req.param('id');
    User.findOne({id: userId}).exec(function(err, user) {
      if (err) return res.send(500, err);
      RequestedData.findOne({id: requestedDataId}).populate('voted').exec(function(err, requestedData) {
        if (err) return res.send(500, err);
        user.votes.add(requestedData.id);
        user.save(function(err, user) {
          if (err) return res.send(500, err);
          res.send(200, {votes: requestedData.voted});
        });
      });
    });
  }
};
