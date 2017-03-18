/*
server, showing client headers
context: node.js
*/

var express = require('express');    // include express
var server = new express();          // make an instance of it

// GET response listener callback function:
function respond(request, response) {
  console.log(request.headers);
  console.log("server hostname: " + request.hostname);
  console.log("client IP address: " + request.ip);
  response.end("hello client!");
}

server.listen(8080);        // start the server on port 8080
server.get('/', respond);   // listener for GET requests
