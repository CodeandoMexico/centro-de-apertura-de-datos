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
  if (req.session.user === parseInt(req.session.user)) {
    return next();
  }

  // User is not allowed, ask for credentials.
  return res.redirect('/user/login');
};
