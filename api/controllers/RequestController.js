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

function userHasVotedForTheseRequests(requests, user_id, next) {
  var vote_dict = {}; 
  for (var i = 0; i < requests.length; i++) {
    for (var j = 0; j < requests[i].voted_by.length; j++) {
      if (requests[i].voted_by[j].id == user_id) {
        vote_dict[requests[i].id] = {voted: true};
        break;
      }
    }
    if (i == requests.length - 1) return next(vote_dict);
  }
}

function userHasVotedForThisRequest(user_id, request, next) {
  if (request.voted_by.length == 0) return next(false);
  for (i = 0; i < request.voted_by.length; i++) {
    if (request.voted_by[i].id == user_id) return next(true);
    if (i == request.voted_by.length - 1) return next(false);
  }
}

function sortingMethod(sort_by) {
  var s = {};
  switch(sort_by) {
    case 'nuevas':
      s.sort_by_backend  = 'createdAt';
      s.sort_by_frontend = 'nuevas'
      break;
    case 'populares':
      s.sort_by_backend  = 'vote_count';
      s.sort_by_frontend = 'populares'
      break;
    case 'abiertas':
      s.sort_by_backend  = 'state';
      s.sort_by_frontend = 'abiertas'
      break;
    default:
      s.sort_by_backend  = 'createdAt';
      s.sort_by_frontend = 'nuevas'
  }
  return s;
}

module.exports = {

  index: function(req, res) {
    
    if (typeof req.param('sort_by') === 'undefined') {
      return res.redirect('/solicitudes/populares');
    }
    var s = sortingMethod(req.param('sort_by'));

    Request.find({sort: s.sort_by_backend + ' DESC'})
    .paginate({page: req.param('page') || 1, limit: 6})
    .populate('user')
    .populate('voted_by')
    .exec(function(err, requests) {
      if (err) return _error(err, req, res, false);
      if (!requests) return _error('Error getting requests', req, res, false);

      var response = {
        requests   : requests,
        page       : req.param('page') || 1,
        sort_by    : s.sort_by_frontend,
        more_pages : requests.length == 6
      };

      if (req.session.user) {
        userHasVotedForTheseRequests(requests, req.session.user.id, function(vote_dict) {
          response.vote_dict = vote_dict;
          return res.view(response);
        });
      } else {
        response.vote_dict = {};
        return res.view(response);
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
            user: req.session.user.id
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
      var s = sortingMethod(req.param('sort_by'));

      Request.find({sort: s.sort_by_backend + ' DESC'})
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

        var response = {
          requests    : requests,
          search_term : req.param('q'),
          page        : req.param('p') || 1,
          sort_by     : s.sort_by_frontend,
          more_pages : requests.length == 6
        };

        if (req.session.user) {
          userHasVotedForTheseRequests(requests, req.session.user.id, function(vote_dict) {
            response.vote_dict = vote_dict;
            return res.view('request/index', response);
          });
        } else {
          response.vote_dict = {};
          return res.view('request/index', response);
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
          userHasVotedForThisRequest(req.session.user.id, request, function(answer) {
            return res.view({
              request: request,
              voted_by_user: answer
            });
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
      Request.findOne({id: req.param('id')}).exec(function(err, request) {
        if (err) return _error(err, req, res, false);
        if (!request) return _error('Error getting request', req, res, false);
        if (request.state == 2) return _error('No se pueden editar solicitudes en proceso', req, res, true);
        if (request.user == req.session.user.id) {
          return res.view({request: request});
        } else {
          return _error('Trying to edit someone else\'s request', req, res, false);
        }
      });
    } else if (req.method == 'POST' || req.method == 'post') {
      Request.findOne({id: req.param('id')}).exec(function(err, request) {
        if (err) return _error(err, req, res, false);
        if (!request) return _error('Error getting request', req, res, false);
        if (request.state == 2) return _error('No se pueden editar solicitudes en proceso', req, res, true);
        Request.update({
          id: req.param('id'),
          user: req.session.user.id
        }, {
          title: req.param('title').trim(),
          url: req.param('url'),
          description: req.param('description').trim()
        }).exec(function(err, requests) {
          if (err) return _error(err, req, res, false);
          if (!requests[0]) return _error('Error al actualizar solicitud', req, res, true);
          return _success('Solicitud editada exitosamente', req, res, '/solicitud/' + requests[0].id)
        });
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
