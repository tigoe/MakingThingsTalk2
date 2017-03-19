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
var mqtt = require('mqtt');         // include mqtt library

var clientOptions = {     // mqtt client options
  port: 1883,
  host: 'localhost',
  keepalive: 10000
};

var device = {            // device properties
  on: false,
  temperature: 24,
  setPoint: 18,
  mode: 1,
  connected: false
};
var deviceName = 'airConditioner';  // name of the device
var client;                         // mqtt client

server.use('/',express.static('public'));   // set a static file directory
server.use(bodyParser.urlencoded({extended:false})); // enable body parsing


function answerCall(request, response) {
  var expected = {
    numDigits: 2,
    action: '/gather'
  };
  var twiml = new twilio.TwimlResponse();
  twiml.gather(expected, makeResponse);

  function makeResponse(gatherNode) {
   gatherNode.say('The current temperature is '
   + String(temperature)
   + ' degrees Celsius. \
   The thermostat is set to ' + String(setPoint) + ' degrees Celsius. \
   The air conditioner is set to on. \
   If you would like to change the thermostat, please enter a new setting. \
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
    device.setPoint = Number(request.body.Digits);
    twiml.say('The thermostat will be set at ' + String(device.setPoint)
    + ' degrees.');
    twiml.pause();
    twiml.say('Thank you and goodbye!');
    twiml.hangup();
  } else {
    // If no input was sent, redirect to the /voice route
    twiml.say('You didn\'t give a new setting, \
    so the thermostat will remain at '
    + String(device.setPoint)
    + ' degrees. Goodbye!');
    twiml.pause();
    twiml.redirect('/voice');
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
}

function announce() {
  for (property in device) {
    client.subscribe(deviceName + '/' + property);  // subscribe to them
  }
}

function readMessages() {
  topic = topic.toString();               // convert topic to String
  var strings = topic.split('/');         // split at the slash
  var origin = strings[0];                // origin comes before the slash
  var property = strings[1];              // property comes after the slash

  if (property === 'temperature' ||       // these properties need to
    property ==='mode' ||                 // be converted to numbers
    property === 'setPoint') {
    device[property] = Number(message);
  } else {                                // the other properties are Boolean
    // tricky way of getting the boolean value:
    device[property] = (String(message) == '1');
  }
}

// start the server:
server.listen(8080);           // listen for HTTP
server.post('/voice', answerCall);
server.post('/gather', getButtons);

client = mqtt.connect(clientOptions); // connect
client.on('connect', announce);       // listener for connection
client.on('message', readMessages);   // listener for incoming messages
