/*
HTTP/HTTPS server
context: node.js
*/
// include libraries and declare global variables:
var express = require('express');	// include the express library
var https = require('https');     // require the HTTPS library
var http = require('http');       // require the HTTP library
var fs = require('fs');           // require the filesystem library
var server = express();					  // create a server using express

var options = {                             // options for the HTTPS server
  key: fs.readFileSync('./keys/key.pem'),   // the key
  cert: fs.readFileSync('./keys/cert.pem'), // the certificate
  passphrase: 'z00mz0rf'                    // the passphrase in the key
};

server.use('/',express.static('public'));   // set a static file directory

// start the server:
http.createServer(server).listen(8080);           // listen for HTTP
https.createServer(options, server).listen(443);  // listen for HTTPS
