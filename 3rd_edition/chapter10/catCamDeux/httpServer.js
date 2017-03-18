/*
HTTP server
context: node.js
*/
// include libraries and declare global variables:
var express = require('express');	// include the express library
var server = express();					  // create a server using express
var bodyParser = require('body-parser'); // include body parser middleware
var fs = require('fs');


server.use('/',express.static('public'));   // set a static file directory
server.use(bodyParser.urlencoded({extended: true})); // enable body parsing

function postFile(request, response) {
  console.log(request.body.digits);
  var fileName = __dirname + '/public/' + request.path;
  var data = fs.readFileSync(fileName);
  data = String(data);
  output = data.replace(/<temperature>/g, '25');
  output = output.replace(/<setpoint>/g, '18');
  output = output.replace(/<on>/g, 'on');
 response.writeHead(200, {'Content-Type': 'text/xml'});
  response.end(output);
}

// start the server:
server.listen(8080);           // listen for HTTP
server.post('/*', postFile);
