/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.user = (an ID, such as a number);`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  // Check if the req.session.user variable holds a number.
  if (typeof req.session.user !== 'undefined' && req.session.user != null) {
    return next();
  }

  /* User is not allowed, create a flash message. */
  req.session.flash = {
    text: 'No autorizado',
    type: 'danger',
  };
  return res.redirect('/request/index');
};
