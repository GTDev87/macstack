'use strict';
/**
 * Module dependencies.
 */

var init = require('./config/init')(),
  config = require('./config/config'),
  chalk = require('chalk');

module.exports = function(callback, run) {
  require('./config/express')(callback, run);
};