'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
  https = require('https'),
  express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
  helmet = require('helmet'),
  passport = require('passport'),
  config = require('./config'),
  tuber = require('./tuber'),
  path = require('path'),
  crypto = require('crypto'),
  macattack_express = require('macattack-express'),
  macattack = require('macattack'),
  pem = require('pem'),
  publicKeyMacaroons = require('public-key-macaroons');

module.exports = function(callback) {
  // Initialize express app
  var app = express();

  // Globbing model files
  config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) { require(path.resolve(modelPath)); });

  // Setting application local variables
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  app.locals.keywords = config.app.keywords;

  // Passing the request url to environment locals
  app.use(function(req, res, next) {
    res.locals.url = req.protocol + '://' + req.headers.host + req.url;
    next();
  });

  // Showing stack errors
  app.set('showStackError', true);

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan)
    app.use(morgan('dev'));

    // Disable views cache
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  // CookieParser should be above session
  app.use(cookieParser());

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // Use helmet to secure Express headers
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());

  app.disable('x-powered-by');

  // Globbing routing files
  config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
    require(path.resolve(routePath))(app);
  });

  //macattack security
  var certfile = config.container_volume + "/" + config.cert_filename;
  var secretKey = crypto.createHash('md5').digest('hex');

  

  try{
    var cert = fs.readFileSync(certfile, "utf-8");
    tuber(macattack, pem, crypto, publicKeyMacaroons, JSON, macattack_express, https, config.host_ip, config.host_port, secretKey, cert, app, callback);
  }catch (err){
    console.log("err.message = %j", err.message);
    console.log("app could not be started without cert");
  }
};