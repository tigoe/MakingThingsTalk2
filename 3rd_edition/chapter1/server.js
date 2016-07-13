/*
  Making Things Talk 3rd ed.

  a simple web server in node.js. Requires express.js as well.
  context: node.js
*/
// include libraries and declare global variables:
var express = require('express');  // include the express library
var server = express();            // create a server using express

// define the callback function that's called when
// a client makes a request:
function respondToClient(request, response) {
  console.log("got a request");  // print a message on the command line
  // write back to the client:
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write("Hello, client!");
  response.end();
}

// start the server:
server.listen(8080);
 // define what to do when the client requests something:
server.get('/*', respondToClient);
console.log("server is listening on port 8080");
