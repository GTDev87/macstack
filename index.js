'use strict';
/**
 * Module dependencies.
 */

var init = require('./config/init')(),
  chalk = require('chalk');

module.exports = function () { return require('./config/express')(); };