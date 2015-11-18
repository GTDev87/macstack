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
  config = require('./config'),
  path = require('path'),
  crypto = require('crypto'),
  prompt = require('prompt'),
  macattack_express = require('macattack-express'),
  pem = require('pem');

module.exports = function(callback) {
  // Initialize express app
  var app = express();

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

  // Use helmet to secure Express headers
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());

  app.disable('x-powered-by');

  function getDataFromVolumeFile(filename) {
    try{
      return fs.readFileSync(config.container_volume + "/" + filename, "utf-8");
    }catch(err){
      return "";
    }
  }

  var clientCert = getDataFromVolumeFile(config.cert_filename) || "";
  var dataString = getDataFromVolumeFile(config.data_filename) || "{}";

  console.log("dataString = %j", dataString);
  console.log(dataString);
  console.log(JSON.parse(dataString));

  var secretKey = crypto.createHash('md5').digest('hex');

  //need to tell macstack to wait for data when necessary
  //npm install prompt

  var jsonData = dataString ? JSON.parse(dataString) : undefined;  

  function getCallbackWithData(data, keys){
    return callback({
      cert: keys.certificate,
      addRoute: function (route, controller) { return app.route(route).get(function (req, res) { return controller(req, res, data)}); },
      run: function () {
        try{
          //macattack security
          macattack_express({secret: secretKey, hostPort: config.host_port, hostIp: config.host_ip, cert: clientCert}, function (err, middlewareFnObj) {
            if(err) {return console.log("fail macattack_express err.message = %j", err.message);}
            app.use(middlewareFnObj);

            var options = {
              key: keys.serviceKey, //do i need to save this off?
              cert: keys.certificate, //TODO... maybe pass this back to deployer
             
              // This is necessary only if using the client certificate authentication.
              // Without this some clients don't bother sending certificates at all, some do
              requestCert: true,
             
              // Do we reject anyone who certs who haven't been signed by our recognised certificate authorities
              rejectUnauthorized: false
             
              // This is necessary only if the client uses the self-signed certificate and you care about implicit authorization
              //ca: [ fs.readFileSync('client/client-certificate.pem') ]//TODO how do i get rid of this
            };

            console.log("end_tuber_protocol");

            https.createServer(options, app).listen(config.port, '0.0.0.0');
          });
        }catch (err){
          console.log("err.message = %j", err.message);
          console.log("app could not be started without cert");
        }
      }
    }); 
  }

  return pem.createCertificate({days:1, selfSigned:true}, function(err, keys){
    if(err) {return console.log("fail pem.createCertificate err.message = %j", err.message);}

    console.log("cert=" + keys.certificate);

    if(!jsonData.prompt){return getCallbackWithData(jsonData.data, keys); }
    console.log("prompt");

    return prompt.get(['data'], function (err, result) {
      console.log('prompt data: ' + result.data);
      return getCallbackWithData(result.data, keys)
    });
  });
};