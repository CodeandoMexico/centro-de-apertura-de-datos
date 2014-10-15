/**
 * RequestController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

/*
 * Computes pagination data.
 * @param req_param_page {user given, must be int} Contains the requested page number.
 * @param requests {array of Request objects} All requests in the databse.
 */
function getPaginationData(req_param_page, requests) {
    var pd = {};

    pd.show_prev_page_btn = true;
    pd.show_next_page_btn = true;

    // Get the amount of possible pages.
    var pages_float = requests.length / sails.config.globals.cmx.requests_per_page;
    var pages_int = (pages_float === parseInt(pages_float)) ? pages_float : Math.floor(pages_float) + 1;

    // Always default to page 1.
    pd.requested_page = 1;
    if (typeof req_param_page  === 'undefined') { // No page parameter given.
      // Keep default.
    } else {
      if (isNaN(req_param_page)) { // Given page parameter is not a number.
        // Keep default.
      } else {  // Given page parameter is a number. Cast to int.
        pd.requested_page = parseInt(req_param_page);
      }
    }

    // Max to the left.
    if (pd.requested_page <= 1) {
      pd.requested_page = 1;
      pd.show_prev_page_btn = false;
    }

    // Max to the right.
    if (pd.requested_page >= pages_int) {
      pd.requested_page = pages_int;
      pd.show_next_page_btn = false;
    }

    // Tells the views which pages are back/forward.
    pd.previous_page = pd.requested_page - 1;
    pd.next_page = pd.requested_page + 1;

    // Get which requests should be shown in this page.
    var start = (pd.requested_page - 1) * sails.config.globals.cmx.requests_per_page;
    pd.paged_requests = requests.slice(start, start + sails.config.globals.cmx.requests_per_page);

    return pd;
}

module.exports = {

  index: function(req, res) {
    // Default sorting method is set to 'newest first'.
    var sorting_method = 'newest';
    var newest_filter_class = "active-filter";
    var most_votes_filter_class = "";
    switch(req.param('sort_by')) {
      case 'most_votes':
        sorting_method = 'most_votes';
        newest_filter_class = "";
        most_votes_filter_class = "active-filter";
        break;
    }

    Request.find({sort: 'createdAt DESC'})
    .populate('voted')
    .exec(function(err, requests) {
      if (err) return console.log(err);

      if (sorting_method == 'most_votes') {
        // Override the default sorting method.
        requests.sort(Request.compareVotes);
      }

      data = {
        newest_filter_class: newest_filter_class,
        most_votes_filter_class: most_votes_filter_class,
        sorting_method: sorting_method,
        pd: getPaginationData(req.param('page'), requests)
      };

      if (req.session.user) {
        User.getVotes(req.session.user.id, function(user_votes) {
          data.user_votes = user_votes
          return res.view(data);
        });
      } else {
          data.user_votes = []
          return res.view(data);
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
            if (err) console.log(err);
            req.session.flash = {
              'type': 'success',
              'text': 'Tu solicitud ha sido creada',
            };
            return res.redirect('/');
          });
        } else if (check == 'invalid') {
          req.session.flash = {
            type: 'danger',
            text: 'Imposible crear solicitud: datos incompletos o inv&aacute;lidos'
          };
          return res.redirect('/');
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

      // Default search filter is 'newest'.
      var sorting_method          = 'newest';
      var newest_filter_class     = 'active-filter';
      var most_votes_filter_class = '';

      if (req.param('sort_by') == 'newest' || req.param('sort_by') == '' || typeof req.param('sort_by') === 'undefined') {
        // Even if it's redundat, keep this here in case
        // the user gives some weird sorting method.
        sorting_method = 'newest';
        newest_filter_class = "active-filter";
      } else if (req.param('sort_by') == 'most_votes') {
        sorting_method = 'most_votes';
        most_votes_filter_class = "active-filter";
      } else {
        // Not recognized sorting method.
        return res.redirect('/');
      }

      // Always grab the request sorted by date.
      // If the 'most_votes' (or other) filter was 
      // chosen, the array of requests will be
      // sorted again accordingly.
      Request.find({sort: 'createdAt DESC'})
      .where({
        or: [{
          url: {contains: req.param('q')}
        }, {
          description: {contains: req.param('q')}
        }, {
          title: {contains: req.param('q')}
        }]
      })
      .populate('voted')
      .exec(function(err, requests) {
        if (sorting_method == 'most_votes') {
          // Override the default sorting method.
          requests.sort(Request.compareVotes);
        }

        var data = {
          newest_filter_class: newest_filter_class,
          most_votes_filter_class: most_votes_filter_class,
          sorting_method: sorting_method,
          pd: getPaginationData(req.param('page'), requests),
          search_term: req.param('q')
        };

        if (req.session.user) {
          User.getVotes(req.session.user.id, function(user_votes) {
            data.user_votes = user_votes;
            return res.view('request/index', data);
          });
        } else {
          data.user_votes = [];
          return res.view('request/index', data);
        }
      });
    } else {
      return res.redirect('/');
    }
  },

  view: function(req, res) {
    if (req.method == 'GET' || req.method == 'get') {
      Request.findOne({id: req.param('id')})
      .populate('voted')
      .exec(function(err, request) {
        if (err) console.log(err)
        if (typeof request === 'undefined') {
          req.session.flash = {
            type: 'danger',
            text: 'Solicitud no encontrada'
          };
          return res.redirect('/');
        } else {
          if (req.session.user) {
            User.hasVotedForRequest(req.session.user.id, req.param('id'), function(voted_by_user) {
              return res.view({
               request: request,
               voted_by_user: voted_by_user
             });
            });
          } else {
            return res.view({
              request: request,
              voted_by_user: false
            });
          }
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
        if (err || typeof request === 'undefined') {
          console.log('Error looking for the request', err);
          req.session.flash = {
            type: 'danger',
            text: 'Error al buscar solicitud'
          };
          return res.redirect('/');
        } else {
          if (request.creator == req.session.user.id) {
            return res.view({request: request});
          } else {
            req.session.flash = {
              type: 'danger',
              text: 'No puedes editar solicitudes ajenas'
            };
            return res.redirect('/');
          }
        }
      });
    } else if (req.method == 'POST' || req.method == 'post') {
      // IMPORTANT: update() will return an array of objects.
      // Even though only 1 record can have this unique combination
      // of request ID and user ID, the method will return an array.
      Request.update({
        id: req.param('id'),
        creator: req.session.user.id
      }, {
        title: req.param('title').trim(),
        url: req.param('url'),
        description: req.param('description').trim()
      }).exec(function(err, requests) {
        if (err || typeof requests[0] === 'undefined' ) {
          console.log('Error updating the request', err);
          req.session.flash = {
            type: 'danger',
            text: 'Error al actualizar solicitud'
          };
          return res.redirect('/');
        } else {
          req.session.flash = {
            type: 'success',
            text: 'Solicitud editada exitosamente'
          };
          return res.redirect('/solicitud/' + requests[0].id);
        }
      });
    } else {
      return res.redirect('/');
    }
  },

};
