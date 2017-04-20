var express = require('express');	// include the express library
var server = express();			// create a server using express
var bodyParser = require('body-parser');	// include body-parser
// use the parser for data that's URL-encoded:
server.use(bodyParser.urlencoded({ extended: true }));



// no other changes before checkAge function

function checkAge(request, response) {
  var name, age;
  if (request.method === "GET") {
   name = request.query.name;
   age = request.query.age;
  } else if (request.method === "POST") {
   name = request.body.name;
   age = request.body.age;
  }
  var responseString = "";

// no other changes until the end of the script:

server.get('/check', checkAge);     // if the client sends /check?parameters
server.post('/check', checkAge);    // same for for a POST request
