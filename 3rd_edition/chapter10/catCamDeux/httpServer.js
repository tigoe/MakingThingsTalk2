/*
HTTP server
context: node.js
*/
// include libraries and declare global variables:
var express = require('express');	// include the express library
var server = express();					  // create a server using express

server.use('/',express.static('public'));   // set a static file directory

// start the server:
http.createServer(server).listen(8080);           // listen for HTTP
