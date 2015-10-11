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
var app = require('./config/express')();

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
app.listen(config.port, '0.0.0.0');

//TODO Generate Secret key here

// makes "Root macaroon here."


// Expose app
exports = module.exports = app;

//can just log the host macaroon right here
console.log("HOST_MACAROON = ");

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);