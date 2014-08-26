/**
 * Request.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
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
    creator: {
      type: 'STRING',
      required: true
    },
    voted: {
      collection: 'user',
      via: 'votes',
      dominant: true
    }
	},

  /*
   * Function used to sort requests by number ov votes.
   * @param a {Request} A request object to compare against b
   * @param b {Request} A request object to compare against a
   */
  compareVotes: function(a, b) {
    if (a.voted.length < b.voted.length)
      return 1;
    if (a.voted.length > b.voted.length)
      return -1;
    return 0;
  },

  /*
   * If no URL protocol is specified, like in "datamx.io", default it
   * to HTTP, so that the result looks like "http://datamx.io".
   */
  getFormattedUrl: function(url) {
    var url_protocol = sails.config.url.parse(url).protocol;
    return url_protocol == null ? 'http://' + url.toLowerCase() : url.toLowerCase();
  },

  beforeCreate: function(params, next) {
    params.url = Request.getFormattedUrl(params.url);
    next();
  },

  checkData: function(req, next) {
    if (req.param('title') == '' || req.param('description') == '' || req.param('url') == '') {
      // Check for empty data.
      next('invalid');
    } else if (typeof sails.config.valid_url.isUri(Request.getFormattedUrl(req.param('url'))) === 'undefined') {
      // Check for invalid URLs.
      next('invalid');
    } else {
      next('valid');
    }
  }

};
