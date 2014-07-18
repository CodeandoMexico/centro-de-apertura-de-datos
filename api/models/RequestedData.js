/**
 * RequestedData.js
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
      type: 'URL',
    },
    description: {
      type: 'STRING',
      required: true
    },
    voted: {
      collection: 'user',
      via: 'votes',
      dominant: true
    }
	}

};
