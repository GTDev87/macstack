'use strict';

module.exports = {
	app: {
		title: 'macshack',
		description: 'node express endpoint',
		keywords: 'express node.js'
	},
  client: process.env.CLIENT_IP || "127.0.0.1",
  host_port: process.env.HOST_PORT || 3000,
  container_volume: process.env.CONTAINER_VOLUME || "/.tmp",
  cert_filename: process.env.CERT_FILENAME || "cert.pem",
	port: process.env.PORT || 80
};