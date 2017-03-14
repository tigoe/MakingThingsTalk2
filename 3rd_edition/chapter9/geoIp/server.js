/*
server that looks up client's location by IP address
context: node.js
*/
var http = require('http');          // include http library
var express = require('express');    // include express
var server = new express();          // make an instance of it
// address for Google Maps server:
var mapsAddress = 'https://www.google.com/maps/place/';
// freegeoip server options:
var geoOptions = {
  host: 'freegeoip.net',
  path: '/json/'
};

// GET response listener callback function:
function respond(request, response) {
  console.log("client IP address: " + request.ip);

  function getIPAddress(geoResponse) {
    var result = '';               // string to hold the response
    // listen for events from  the freegeoip server:
    geoResponse.on('data', collectData);  // response data listener
    geoResponse.on('end', finishResponse);  // response close listener

    function collectData(data) {   // response data may arrive in chunks;
      result += data;              // add chunks together as they arrive.
    }

    // when response closes, process it:
    function finishResponse() {
      var location = JSON.parse(result);
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
  }

  // start the geoIp request:
  geoOptions.path = '/json/' + request.ip;   // add client IP to geoIP path
  var geoRequest = http.request(geoOptions, getIPAddress);  // start request
  geoRequest.end();                 // end it
}

server.listen(8080);        // start the server on port 8080
server.get('/', respond);   // listener for GET requests
