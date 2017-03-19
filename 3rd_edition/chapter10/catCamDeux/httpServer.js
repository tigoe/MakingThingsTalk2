/*
HTTP server
context: node.js
*/
// include libraries and declare global variables:
var express = require('express');	// include the express library
var server = express();					  // create a server using express
var bodyParser = require('body-parser'); // include body parser middleware
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

function postFile(request, response) {
  console.log(request.body);
  var fileName = __dirname + '/public/' + request.path;
  var data = fs.readFileSync(fileName);
  output = String(data);
  for (property in device) {
    var searchTerm = '/#' + property + '/g';
    var value = String(device[property]);
    output = output.replace(searchTerm, value);
  }
  response.writeHead(200, {'Content-Type': 'text/xml'});
  response.end(output);
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
server.post('/*', postFile);

client = mqtt.connect(clientOptions); // connect
client.on('connect', announce);       // listener for connection
client.on('message', readMessages);   // listener for incoming messages
