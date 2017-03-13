/*
server, showing client headers
context: node.js
*/

var http = require('http');
var express = require('express');    // include express
var server = new express();          // make an instance of it

// GET response listener callback function:
function respond(request, response) {
  console.log("client IP address: " + request.ip);
  var options = {
    host: 'freegeoip.net',
    port: 80,
    path: '/json/' + request.ip
  };

  function getIPAddress(geoResponse) {
    var result = '';		// string to hold the response

    function collectData (data) {
      result += data;
    }

    function showResponse() {
      console.log(result.latitude + "," + result.longitude);

    }
    geoResponse.on('data', collectData);  // add chunks to result as they arrive
    geoResponse.on('end', showResponse);  // when the server finishes, show result
  }

  var geoRequest = http.request(options, getIPAddress);	// start it
  geoRequest.end();												// end it

  geoRequest.end("hello client!");

response.end();
}

server.listen(8080);        // start the server on port 8080
server.get('/', respond);   // listener for GET requests
