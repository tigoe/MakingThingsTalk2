/*
HTTP/HTTPS 2-Factor Authentication server
context: node.js

 to create keys for self-signing: https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs

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
// include the external modules:
var tagWriter = require('./writeNdefSignature.js');
var tagReader = require('./readNdefSignature.js');
var lockControl = require('./gpioControl.js');

var server = express();					  // create a server using express
var options = {                              // options for the HTTPS server
  key: fs.readFileSync('./keys/domain.key'), // the key
  cert: fs.readFileSync('./keys/domain.crt') // the certificate
};

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

function processTag(request, response) {
  var command = request.path;             // get the command
  command = command.slice(1);             // slice off the leading /
  var data = JSON.stringify(request.body);  // convert the body to a string

  // write the beginning of the response:
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write('accessing tag...<br>');

  // function to finish the response:
  function finishResponse(error, buffer) {
    if (error) {
      response.write('Failure: ' + error + '<br>');
    } else {
      response.write(command + ' success.<br>');
      if (command === 'readTag') {
        var verified = tagReader.parseMessage(buffer);
        if (verified) {
          response.write('You entered the correct response.<br>');
          lockControl.open();
        } else {
          response.write('However, your response does not match this tag.<br>');
        }
      }
    }
    response.end();
  }

  // take action depending on the command:
  if (command === 'formatTag') {
    tagWriter.format(finishResponse);   // attempt tag formatting
  }
  if (command === 'writeTag') {
    var message = tagWriter.setMessage(data, true);
    tagWriter.write(message, finishResponse); // attempt tag writing
  }
  if (command === 'readTag') {
    tagReader.setSecret(data);
    tagReader.read(finishResponse);   // attempt tag reading
  }
}

// start the server:
http.createServer(server).listen(8080);           // listen for HTTP
https.createServer(options, server).listen(443);  // listen for HTTPS
server.post('/writeTag', processTag);             // listener for writeTag
server.post('/readTag', processTag);              // listener for readTag
server.post('/formatTag', processTag);            // listener for formatTag
