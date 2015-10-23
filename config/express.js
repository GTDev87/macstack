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

  //macattack security
  var certfile = config.container_volume + "/" + config.cert_filename;
  var secretKey = crypto.createHash('md5').digest('hex');

  var serializedMacaroon = macattack.createMac(config.host_ip, config.host_port, secretKey);

  try{
    var cert = fs.readFileSync(certfile, "utf-8");

    pem.getPublicKey(cert, function (err, data) {
      var caveatKey = crypto.createHash('md5').digest('hex');

      console.log("cert = %j", cert);

      function condenseCertificate(cert){
        return cert
          .replace("-----BEGIN CERTIFICATE-----", "")
          .replace("-----END CERTIFICATE-----", "")
          .replace(/\n/g, "");
      }

      var caveatMacaroon = publicKeyMacaroons.addPublicKey3rdPartyCaveat(serializedMacaroon, "Macattack", caveatKey, "cert = " + condenseCertificate(cert), data.publicKey);
    
      console.log("client_macaroon=" + JSON.stringify(caveatMacaroon));

      //macattack_express
      app.use(macattack_express({secret: secretKey}));

      //end of macattack security

      app.disable('x-powered-by');

      // Globbing routing files
      config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
        require(path.resolve(routePath))(app);
      });

      // Log SSL usage
      console.log('Securely using https protocol');

      // Create SSL key and certificate
      pem.createCertificate({days:1, selfSigned:true}, function(err, keys){
        var options = {
          key: keys.serviceKey, //do i need to save this off?
          cert: keys.certificate,
         
          // This is necessary only if using the client certificate authentication.
          // Without this some clients don't bother sending certificates at all, some do
          requestCert: true,
         
          // Do we reject anyone who certs who haven't been signed by our recognised certificate authorities
          rejectUnauthorized: false
         
          // This is necessary only if the client uses the self-signed certificate and you care about implicit authorization
          //ca: [ fs.readFileSync('client/client-certificate.pem') ]//TODO how do i get rid of this
         
        };

        // Return Express server instance vial callback
        callback(https.createServer(options, app));
      });
    });
  }catch (err){
    console.log("err.message = %j", err.message);
    console.log("app could not be started without cert");
  }
};