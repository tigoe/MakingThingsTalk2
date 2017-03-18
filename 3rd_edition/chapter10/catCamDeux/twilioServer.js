/*
HTTP server
context: node.js
*/
// include libraries and declare global variables:
var express = require('express');	// include the express library
var server = express();					  // create a server using express
var bodyParser = require('body-parser'); // include body parser middleware
var twilio = require('twilio');
var fs = require('fs');

var temperature = 21;
var setPoint = 18;
var on = false;

server.use('/',express.static('public'));   // set a static file directory
server.use(bodyParser.urlencoded({extended:false})); // enable body parsing

function answerCall(request, response) {
  var expected = {
    numDigits: 2,
    action: '/gather'
  };
  var twiml = new twilio.TwimlResponse();
  twiml.gather(expected, nextResponse);

  function nextResponse(gatherNode) {
   gatherNode.say('The current temperature is '
   + temperature
   + ' degrees Celsius. \
   The thermostat is set to ' + setPoint + ' degrees Celsius. \
   The air conditioner is set to ' + on
   +  '. If you would like to change the thermostat, please enter a new setting. \
   If you are satisfied, please hang up.'
   );
 }

  // If the user doesn't enter input, loop
  twiml.redirect('/voice');

  // Render the response as XML
  response.type('text/xml');
  response.send(twiml.toString());
}


// Create a route that will handle <Gather> input
function getButtons(request, response) {
  // Use the Twilio Node.js SDK to build an XML response
  var twiml = new twilio.TwimlResponse();

  // If the user entered digits, process their request
  if (request.body.Digits) {
    setPoint = Number(request.body.Digits);
    twiml.say('The thermostat will be set at ' + setPoint + ' degrees');
    twiml.pause();
    twiml.hangup();
  } else {
    // If no input was sent, redirect to the /voice route
    twiml.say('You didn\'t give a new setting, \
    so the thermostat will remain at '
    + thermostat
    + ' degrees. Goodbye!');
    twiml.pause();
    twiml.redirect('/voice');
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
}


// start the server:
server.listen(8080);           // listen for HTTP
server.post('/voice', answerCall);
server.post('/gather', getButtons);
