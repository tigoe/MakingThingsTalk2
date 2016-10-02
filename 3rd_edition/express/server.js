/*
Making Things Talk 3rd ed.
context: node.js
*/

var express = require('express');	          // include the express library
var server = express();					            // create a server using express
server.use('/',express.static('public'));   // serve static files from /public
var lastInput;                              // last input from client

function respondToClient(request, response) { // respond to GET /position
  response.end(JSON.stringify(lastInput));    // send the last client input
}

function updatePosition(request, response) {  // respond to /GET update?x=0&y=0
  response.end(JSON.stringify(lastInput));    // send it back to client
  lastInput = request.query;                  // get the query from the client
  console.log(lastInput);                     // print it
}

// start the server:
server.listen(8080);
server.get("/position", respondToClient);     // GET request listeners
server.get("/update", updatePosition);
