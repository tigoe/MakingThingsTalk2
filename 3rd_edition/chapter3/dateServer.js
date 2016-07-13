/*
    date server
    context: node.js
*/
var express = require('express');      // include the express library
var server = express();                // create a server using express

// define the callback function that's called when
// a client makes a request:
function respondToClient(request, response) {
  // convert the parameters to a string using JSON.stringify:
  var request = "request: " + JSON.stringify(request.query);
  // write back to the client:
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(request);
  response.end();
}

// start the server:
server.listen(8080);
 // define what to do when the client requests something:
server.get('/', respondToClient);
