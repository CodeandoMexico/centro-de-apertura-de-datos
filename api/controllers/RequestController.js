/**
 * RequestController.js 
 */

function _error(msg, req, res, flash) {
  console.log('(!!) ERROR @ ' + req.options.controller + '/' + req.options.action);
  console.log(msg);
  if (flash) {
    req.session.flash = {
      type: 'danger',
      text: msg
    };
  }
  return res.redirect('/');
}

function _success(msg, req, res, url) {
  req.session.flash = {
    'type': 'success',
    'text': msg
  };
  if (typeof url === 'undefined') {
    return res.redirect('/');
  } else {
    return res.redirect(url);
  }
}

module.exports = {

  index: function(req, res) {
    var sort_by;
    switch(req.param('sort_by')) {
      case 'nuevas':
        sort_by = 'createdAt';
        break;
      case 'populares':
        sort_by = 'vote_count';
        break;
      case 'abiertas':
        sort_by = 'state';
        break;
      default:
        sort_by = 'createdAt';
    }

    Request.find({sort: sort_by + ' DESC'})
    .paginate({page: 1, limit: 6})
    .populate('voted_by')
    .exec(function(err, requests) {
      if (err) return _error(err, req, res, false);
      if (!requests) return _error('Error getting requests', req, res, false);

      if (req.session.user) {
        var vote_dict = {}; 
        for (i in requests) {
          for (j in requests[i].voted_by) {
            if (requests[i].voted_by[j].id == req.session.user.id) {
              vote_dict[requests[i].id] = {voted: true};
              break;
            }
          }
          if (i == requests.length - 1) {
            return res.view({
              vote_dict : vote_dict,
              requests  : requests
            });
          }
        }
      } else {
        return res.view({
          vote_dict : {},
          requests  : requests
        });
      }
    });
  },

  create: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      Request.checkData(req, function(check) {
        if (check == 'valid') {
          Request.create({
            title: req.param('title').trim(),
            url: req.param('url'),
            description: req.param('description').trim(),
            creator: req.session.user.id
          }, function(err, request) {
            if (err) return _error(err, req, res, false);
            return _success('Tu solicitud ha sido creada', req, res);
          });
        } else if (check == 'invalid') {
          return _error('Imposible crear solicitud: datos incompletos o inv&aacute;lidos', req, res, true);
        }
      });
    } else {
      return res.redirect('/');
    }
  },

  search: function(req, res) {
    if (req.method == 'GET' || req.method == 'get') {

      if (typeof req.param('q') === 'undefined' || req.param('q') == '') {
        return res.redirect('/');
      }

      var sort_by;
      switch(req.param('sort_by')) {
        case 'nuevas':
          sort_by = 'createdAt';
          break;
        case 'populares':
          sort_by = 'vote_count';
          break;
        case 'abiertas':
          sort_by = 'state';
          break;
        default:
          sort_by = 'createdAt';
      }

      Request.find({sort: sort_by + ' DESC'})
      .where({
        or: [{
          url: {contains: req.param('q')}
        }, {
          description: {contains: req.param('q')}
        }, {
          title: {contains: req.param('q')}
        }]
      })
      .paginate({page: req.param('p') || 1, limit: 6})
      .populate('voted_by')
      .exec(function(err, requests) {
        if (err) return _error(err, req, res, false);
        if (!requests) return _error('Error getting requests', req, res);

        var data = {
          requests: requests,
          search_term: req.param('q'),
          page: req.param('p') || 1
        };

        if (req.session.user) {
          User.getVotes(req.session.user.id, function(user_votes) {
            data.user_votes = user_votes;
            return res.view('request/index', {data: data});
          });
        } else {
          data.user_votes = [];
          return res.view('request/index', {data: data});
        }
      });
    } else {
      return res.redirect('/');
    }
  },

  view: function(req, res) {
    if (req.method == 'GET' || req.method == 'get') {
      Request.findOne({id: req.param('id')})
      .populate('voted_by')
      .exec(function(err, request) {
        if (err) return _error(err, req, res, false)
        if (!request) return _error('Error getting request', req, res, false);
        if (req.session.user) {
          return res.view({
            request: request,
            voted_by_user: true
          });
        } else {
          return res.view({
            request: request,
            voted_by_user: false
          });
        }
      });
    } else {
      return res.redirect('/');
    }
  },

  edit: function(req, res) {
    if (req.method == 'GET' || req.method == 'get') {
      Request.findOne({
        id: req.param('id')
      }).exec(function(err, request) {
        if (err) return _error(err, req, res, false);
        if (!request) return _error('Error getting request', req, res, false);
        if (request.user == req.session.user.id) {
          return res.view({request: request});
        } else {
          return _error('Trying to edit someone else\'s request', req, res, false);
        }
      });
    } else if (req.method == 'POST' || req.method == 'post') {
      Request.update({
        id: req.param('id'),
        creator: req.session.user.id
      }, {
        title: req.param('title').trim(),
        url: req.param('url'),
        description: req.param('description').trim()
      }).exec(function(err, requests) {
        if (err) return _error(err, req, res, false);
        if (!requests[0]) return _error('Error al actualizar solicitud', req, res, true);
        return _success('Solicitud editada exitosamente', req, res, '/solicitud/' + requests[0].id)
      });
    } else {
      return res.redirect('/');
    }
  },

  voteup: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      User.findOne({id: req.session.user.id})
      .exec(function(err, user) {
        if (err) return _error(err, req, res, false);
        if (!user) return _error('Error getting user', req, res, false);
        Request.findOne({id: req.param('request_id')})
        .populate('voted_by')
        .exec(function(err, request) {
          if (err) return _error(err, req, res, false);
          if (!request) return _error('Error al buscar solicitud', req, res, true);
          user.voted_for.add(request.id);
          user.save(function(err, user) {
            if (err) return _error('Error al votar', req, res, true);
            if (!user) return _error('Error getting the user', req, res, false);
            Request.update({
              id: request.id
            }, {
              vote_count: request.vote_count + 1
            }).exec(function(err, requests) {
              if (err || !requests[0]) return _error('Error al sumar voto', req, res, true);
              return _success('Has votado exitosamente', req, res);
            });
          });
        });
      });
    } else {
      return res.redirect('/');
    }
  },

  votedown: function(req, res) {
    if (req.method == 'POST' || req.method == 'post') {
      User.findOne({id: req.session.user.id})
      .exec(function(err, user) {
        if (err) return _error(err, req, res, false);
        if (!user) return _error('Error getting user', req, res, false);
        Request.findOne({id: req.param('request_id')})
        .populate('voted_by')
        .exec(function(err, request) {
          if (err) return _error(err, req, res, false);
          if (!request) return _error('Error al buscar solicitud', req, res, true);
          user.voted_for.remove(request.id);
          user.save(function(err, user) {
            if (err) return _error('Error al votar', req, res, true);
            if (!user) return _error('Error getting the user', req, res, false);
            Request.update({
              id: request.id
            }, {
              vote_count: request.vote_count - 1
            }).exec(function(err, requests) {
              if (err || !requests[0]) return _error('Error al restar voto', req, res, true);
              return _success('Has quitado tu voto exitosamente', req, res);
            });
          });
        });
      });
    } else {
      return res.redirect('/');
    }
  },

};
