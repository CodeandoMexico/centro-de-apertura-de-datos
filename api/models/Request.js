/**
 * Request.js
 */

module.exports = {

	attributes: {
    title: {
      type: 'STRING',
      required: true
    },
    url: {
      type: 'STRING', // Disregard Sails' URL type (using valid-uri).
    },
    description: {
      type: 'STRING',
      required: true
    },
    state: {
      type: 'INTEGER',
      defaultsTo: 1
    },
    open_url: {
      type: 'STRING'
    },
    vote_count: {
      type: 'INTEGER', // Only this calculated attribute to filter requests by popularity.
      defaultsTo: 0    // Do not use for vital actions. Could be prone to race conditions.
    },
    slug: {
      type: 'STRING'
    },
    user: {
      model: 'user'
    },
    voted_by: {
      collection: 'user',
      via: 'voted_for',
      dominant: true
    }
	},

  /*
   * If no URL protocol is specified, like in "datamx.io", default it
   * to HTTP, so it ends up being "http://datamx.io".
   * @param url {string} A string representing a user-given URL
   */
  getFormattedUrl: function(url) {
    var url_protocol = sails.config.globals.url.parse(url).protocol;
    return url_protocol == null ? 'http://' + url : url;
  },

  /*
   * Let users be lazy and don't require them to write (http://|https://) when
   * submitting a request. Do that work for them if they haven't already, then, 
   * save the request.
   * @param params {Object} Sails.js/Express.js request object's parameters.
   * @param next {Sails.js internal function} Called to actually insert into the DB.
   */
  beforeCreate: function(params, next) {
    var slug = require('slug');
    params.slug = slug(params.title).toLowerCase();
    params.url = Request.getFormattedUrl(params.url);
    next();
  },

  beforeUpdate: function(params, next) {
    if (typeof params.title !== 'undefined') {
      // An update can be an upvote/downvote, which don't carry a title.
      var slug = require('slug');
      params.slug = slug(params.title).toLowerCase();
    }
    next();
  },

  /*
   * Checks if the user-given data when submitting a request is valid.
   * @param req {Object} Sails.js/Express.js request object.
   * @param next {function} Called after checking this data's validity.
   */
  checkData: function(req, next) {
    var formatted_url = Request.getFormattedUrl(req.param('url'));

    if (req.param('title') == '' || req.param('description') == '' || req.param('url') == '') {
      // Check for empty data.
      next('invalid');
    } else if (typeof sails.config.globals.valid_url.isWebUri(formatted_url) === 'undefined') {
      // Check for invalid web URLs.
      next('invalid');
    } else {
      next('valid');
    }
  }

};
