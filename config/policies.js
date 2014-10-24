module.exports.policies = {

  '*': true,

  RequestController: {
    '*'       : false,
    'index'   : true,
    'search'  : true,
    'view'    : true,
    'create'  : 'sessionAuth',
    'edit'    : 'sessionAuth',
    'voteup'  : 'sessionAuth',
    'votedown': 'sessionAuth'
  },

  UserController: {
    '*'           : false,
    'signin'      : true,
    'authCallback': true,
    'signout'     : 'sessionAuth',
    'profile'     : 'sessionAuth'
  },
};
