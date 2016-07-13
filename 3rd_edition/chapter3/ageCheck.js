/*
   Age checker
   Context: node.js

   Expects two parameters from the HTTP request:
      name (a text string)
      age (an integer)
   Prints a personalized greeting based on the name and age.
*/

var express = require('express');	// include the express library
var server = express();			// create a server using express

// define the request callback functions:
function respondToClient(request, response) {
  // convert the parameters to a string using JSON.stringify:
  var request = "request: " + JSON.stringify(request.query);
  // write back to the client:
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(request);
  response.end();
}

function checkAge(request, response) {
  var name = request.query.name;
  var age = request.query.age;
  var responseString = "";
  if (age < 21) {
    responseString = "<p>" + name + ", You're not old enough to drink.</p>\n";
} else {
    responseString =  "<p> Hi " +  name + ". You're old enough to have a drink, ";
    responseString += "but do so responsibly.</p>\n";
}
  // write back to the client:
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(responseString);
  response.end();
}

// start the server:
server.listen(8080);
// define what to do when the client requests something:
server.get('/', respondToClient);    // if the client sends /?parameters
server.get('/check', checkAge);      // if the client sends /check?parameters
