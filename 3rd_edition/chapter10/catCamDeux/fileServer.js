/*
HTTP server
context: node.js
*/
// include libraries and declare global variables:
var express = require('express');	// include the express library
var server = express();					  // create a server using express
var bodyParser = require('body-parser'); // include body parser middleware
var fs = require('fs');


server.use('/',express.static('public'));   // set a static file directory
server.use(bodyParser.urlencoded({extended:false})); // enable body parsing

// start the server:
server.listen(8080);           // listen for HTTP
