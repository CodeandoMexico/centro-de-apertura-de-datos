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
    if (req.method == 'POST' || req.method == 'post') {
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
            return res.redirect('/');
          });
        });
      });
    } else {
      return res.redirect('/');
    }
  },

  create: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      Request.create({
        title: req.param('title'),
        url: req.param('url'),
        description: req.param('description')
      }, function(err, request) {
        if (err) return res.send(500, err);
        req.flash('message', 'Solicitud creada');
        return res.redirect('/');
      });
    } else {
      return res.redirect('/');
    }
  },
};
