'use strict';

module.exports = {
	app: {
		title: 'macshack',
		description: 'node express endpoint',
		keywords: 'express node.js'
	},
  host_ip: process.env.HOST_IP || "127.0.0.1",
  host_port: process.env.HOST_PORT || 3000,
  container_volume: process.env.CONTAINER_VOLUME || "/.tmp",
  cert_filename: process.env.CERT_FILENAME || "cert.pem",
  data_filename: process.env.DATA_FILENAME || "data.json",
	port: process.env.PORT || 443
};