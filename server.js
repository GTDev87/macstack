'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	chalk = require('chalk'),
  fs = require("fs"),
  crypto = require('crypto');;

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Init the express application
require('./config/express')(function (app){
  // Bootstrap passport config
  require('./config/passport')();

  // Start the app by listening on <port>
  app.listen(config.port, '0.0.0.0');

  // Expose app
  exports = module.exports = app;

  // Logging initialization
  console.log('MEAN.JS application started on port ' + config.port);
});

