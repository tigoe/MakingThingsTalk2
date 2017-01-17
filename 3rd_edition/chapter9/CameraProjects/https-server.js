/*
HTTP/HTTPS server
context: node.js

/ to create keys for self-signing: https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs

openssl req -newkey rsa:2048 -nodes -keyout domain.key -x509 -days 365 -out domain.crt

to properly sign:
https://certbot.eff.org

*/
// include libraries and declare global variables:
var express = require('express');	// include the express library
var https = require('https');     // require the HTTPS library
var http = require('http');       // require the HTTP library
var fs = require('fs');           // require the filesystem library
var server = express();					  // create a server using express

var options = {                              // options for the HTTPS server
  key: fs.readFileSync('./keys/domain.key'), // the key
  cert: fs.readFileSync('./keys/domain.crt') // the certificate
};

server.use('*', httpRedirect);              // set a redirect function for http
server.use('/',express.static('public'));   // set a static file directory

function httpRedirect(request,response, next) {
  if (!request.secure) {
    console.log("redirecting http request to https");
    response.redirect('https://' + request.hostname + request.url);
  } else {
    next();     // pass the request on to the express.static middleware
  }
}

// start the server:
http.createServer(server).listen(8080);           // listen for HTTP
https.createServer(options, server).listen(443);  // listen for HTTPS
