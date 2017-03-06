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
var bodyParser = require('body-parser'); // include body parser middleware
var https = require('https');     // require the HTTPS library
var http = require('http');       // require the HTTP library
var fs = require('fs');           // require the filesystem library
var server = express();					  // create a server using express
var tagWriter = require('./writeNdefSignature.js');
var tagReader = require('./readNdefSignature.js');


var options = {                              // options for the HTTPS server
  key: fs.readFileSync('./keys/domain.key'), // the key
  cert: fs.readFileSync('./keys/domain.crt') // the certificate
};

// add the fs back in for the keys
server.use('*', httpRedirect);              // set a redirect function for http
server.use('/',express.static('public'));   // set a static file directory
server.use(bodyParser.urlencoded({extended: true})); // enable body parsing

function httpRedirect(request,response, next) {
  if (!request.secure) {
    console.log('redirecting http request to https');
    response.redirect('https://' + request.hostname + request.url);
  } else {
    next();     // pass the request on to the express.static middleware
  }
}

function writeToTag(request, response) {
  var message = tagWriter.makeMessage(request.body, false);
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write('attempting to write to tag...<br>');

  function finishResponse(error) {
    if (error) {
      response.end('Tag writing failed: ' + error + '<br>');
      console.log("Error: " + error);
    } else {
      response.end('Tag successfully written.<br>');
    }
  }

  tagWriter.writeTag(message, finishResponse);
}

function readFromTag(request, response) {
  tagReader.setSecret(request.body.challenge)

  response.writeHead(200, {"Content-Type": "text/html"});
  response.write('attempting to read tag...<br>');

  function finishResponse(error) {
    if (error) {
      response.write('Tag reading failed: ' + error + '<br>');
      console.log("Error: " + error);
    } else {
      response.write('Tag read. Verifying....<br>');
      // here is where you need to send a password field if verified
    }
    response.end("That's all folks.");
  }
  tagReader.read(tagReader.verify);
}



// start the server:
http.createServer(server).listen(8080);           // listen for HTTP
https.createServer(options, server).listen(443);  // listen for HTTPS
server.post('/writeTag', writeToTag);
server.post('/readTag', readFromTag);
