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
   * to HTTP, so it ends up being "http://datamx.io".
   * @param url {string} A string representing a user-given URL
   */
  getFormattedUrl: function(url) {
    var url_protocol = sails.config.url.parse(url).protocol;
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
    params.url = Request.getFormattedUrl(params.url);
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
    } else if (typeof sails.config.valid_url.isWebUri(formatted_url) === 'undefined') {
      // Check for invalid web URLs.
      next('invalid');
    } else {
      next('valid');
    }
  }

};
