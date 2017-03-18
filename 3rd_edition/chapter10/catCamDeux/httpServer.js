/*
HTTP server
context: node.js
*/
// include libraries and declare global variables:
var express = require('express');	// include the express library
var server = express();					  // create a server using express
var fs = require('fs');


server.use('/',express.static('public'));   // set a static file directory

function postFile(request, response) {

  var fileName = __dirname + '/public/' + request.path;
  var data = fs.readFileSync(fileName);
  data = String(data);
  output = data.replace(/<temperature>/g, '25');
  output = output.replace(/<setpoint>/g, '18');
  output = output.replace(/<on>/g, 'on');
 res.writeHead(200, {'Content-Type': 'text/xml'});
  response.end(output);
}

// start the server:
server.listen(8080);           // listen for HTTP
server.post('/*', postFile);
