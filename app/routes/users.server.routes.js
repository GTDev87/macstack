'use strict';

/**
 * Module dependencies.
 */
 
module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');

	// Setting up the users profile api
	app.route('/users').get(users.show);
};