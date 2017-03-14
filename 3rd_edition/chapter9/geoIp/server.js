/*
server, showing client headers
context: node.js
*/

var http = require('http');          // include http library
var express = require('express');    // include express
var server = new express();          // make an instance of it
// address for Google Maps server:
var mapsAddress = 'https://www.google.com/maps/place/';
var geoAddress = 'freegeoip.net/json/';
// freegeoip server options:
var geoOptions = {
  host: 'freegeoip.net',
  port: 80,
  path: '/json/' + request.ip
};

// GET response listener callback function:
function respond(request, response) {
  console.log("client IP address: " + request.ip);
  var location;

  function getIPAddress(geoResponse) {
    var result = '';		// string to hold the response

    function collectData(data) {
      result += data;
    }

    function showResponse() {
      location = JSON.parse(result);
      var latLong =  location.latitude + "," + location.longitude;
      console.log(latLong);
      // if the user-agent is a browser (most modern browsers
      // identify as Mozilla/5.0), then redirect to Google Maps.
      // if not, supply the location as a JSON string:
      if (request.headers['user-agent'].includes('Mozilla/5.0')) {
        response.redirect(mapsAddress + latLong);
      } else {
        response.end(JSON.stringify(location));
      }
    }

    geoResponse.on('data', collectData);  // add chunks to result as they arrive
    geoResponse.on('end', showResponse);  // when geoIP server closes, show result
  }
  // start the geoIp request:
  var geoRequest = http.request(geoAddress + request.ip, getIPAddress);
  geoRequest.end();												// end it
}

server.listen(8080);        // start the server on port 8080
server.get('/', respond);   // listener for GET requests
