/**
 * RequestedDataController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  index: function(req, res) {
    RequestedData.find({sort: 'createdAt DESC'}).exec(function(err, requestedDatas) {
      if (err) return res.send(500, err);
      return res.view('requestedData/index', {requestedDatas: requestedDatas});
    });
  },

  find: function(req, res) {
    RequestedData.findOne({id: req.param('id')} ).exec(function(err, requestedData) {
      if (err) return res.send(500, err);
      return res.view('requestedData/find', {requestedData: requestedData});
    });
  }
	
};
