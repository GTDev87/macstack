'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	chalk = require('chalk'),
  fs = require("fs");

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

console.log("process.env.CLIENT_IP = %j", process.env.CLIENT_IP);
console.log("process.env.HOST_PORT = %j", process.env.HOST_PORT);
console.log("process.env.CONTAINER_VOLUME = %j", process.env.CONTAINER_VOLUME);
console.log("process.env.CERT_FILENAME = %j", process.env.CERT_FILENAME);

var certfile = process.env.CONTAINER_VOLUME + "/" + process.env.CERT_FILENAME;


console.log("certfile = %j", certfile);
try{
  var cert = fs.readFileSync(certfile, "utf-8");
  console.log("cert = %j", cert);

}catch (err){
  console.log("err.message = %j", err.message);
}



// makes "Root macaroon here."


// Expose app
exports = module.exports = app;

//can just log the host macaroon right here
console.log("HOST_MACAROON = ");

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);