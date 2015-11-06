module.exports = function(macattack, pem, crypto, publicKeyMacaroons, JSON, macattack_express, https, hostIp, hostPort, secretKey, cert, app, callback) {
  var serializedMacaroon = macattack.createMac(hostIp, hostPort, secretKey);

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
};