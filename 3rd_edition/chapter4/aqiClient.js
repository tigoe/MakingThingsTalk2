/*
  HTTP request
  context: node.js
*/

var http = require('http');  // include HTTP library
// set options for the request in a JSON object:
var options = {
  host: 'www.airnowapi.org',
  port: 80,
  path: '/aq/observation/latLong/current/?format=application/json&latitude=40.8338&longitude=-73.9475&distance=5&API_KEY=SOME_LONG_NUMBER'
};

/*
	the callback function to be run when the response comes in.
	this callback assumes a chunked response, with several 'data'
	events and one final 'end' response.
*/
function handleResponse(response) {
  var result = '';		// string to hold the response

  response.on('data', function (data) {  // when you get a response,
    result += data;                      // add it to the overall result
  });

  response.on('end', function () {       // when the response finally ends,
    var response = JSON.parse(result);   // parse the whole result
    console.log(response);               // and print it
  });
}

var request = http.request(options, handleResponse);	// start the request
request.end();												          // end it
