/**
 * Routes
 *
 * Your routes map URLs to views and controllers.
 * 
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.) 
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg` 
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or 
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.routes = {


  // Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, etc. depending on your
  // default view engine) your home page.
  // 
  // (Alternatively, remove this and add an `index.html` file in your `assets` directory)
  '/': {
    controller: 'request',
    action: 'index'
  },

  '/solicitud/:id/voteup': {
    controller: 'request',
    action: 'voteup'
  },

  '/solicitud/:id/votedown': {
    controller: 'request',
    action: 'votedown'
  },

  '/solicitud/:id/editar': {
    controller: 'request',
    action: 'edit'
  },

  '/solicitud/:id/:slug': {
    controller: 'request',
    action: 'view'
  },

  '/preguntas-frecuentes': {
    controller: 'static',
    action: 'faq'
  },

  '/solicitudes/:sort_by/busca': {
    controller: 'request',
    action: 'search'
  },

  '/solicitudes/:sort_by/:page': {
    controller: 'request',
    action: 'index'
  },

  '/solicitudes/:sort_by': {
    controller: 'request',
    action: 'index'
  },

  '/perfil': {
    controller: 'user',
    action: 'profile'
  }

};
