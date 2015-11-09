'use strict';
/**
 * Module dependencies.
 */

var init = require('./config/init')(),
  config = require('./config/config'),
  chalk = require('chalk');

module.exports = function(callback) {
  

  /**
   * Main application entry file.
   * Please note that the order of loading is important.
   */

  // Init the express application
  require('./config/express')(callback);
};



