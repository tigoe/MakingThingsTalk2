/*
  TwiML server and text parser
  context: node.js
*/
var express = require('express');           // include the express library
var server = express();                     // create a server using express
var bodyParser = require('body-parser');    // include body parser middleware

function getText(request, response) {
  console.log('From: ' + request.body.From);
  console.log('Message: ' + request.body.Body);
  var twiml = '<?xml version="1.0" encoding="UTF-8"?> \
    <Response>  \
        <Message to="+15555555555">Hello Tom</Message> \
    </Response>';
  response.writeHead(200, {'Content-Type': 'text/xml'});
  response.end(twiml);
}

server.listen(8080);                                 // listen for HTTP
server.use(bodyParser.urlencoded({extended: true})); // enable body parsing
server.post('/sms', getText);                        // listen for /sms
