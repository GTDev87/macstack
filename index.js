'use strict';
/**
 * Module dependencies.
 */

var init = require('./config/init')(),
  config = require('./config/config'),
  chalk = require('chalk');


module.exports = function () { return require('./config/express')(); };