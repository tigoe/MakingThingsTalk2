/*
  TwiML and  static File server and MQTT client
  context: node.js
*/
var express = require('express');           // include the express library
var server = express();					            // create a server using express
var multer  = require('multer');            // middleware for file uploads
var fs = require('fs');                     // local file access library
var mqtt = require('mqtt');                 // mqtt client library

var clientOptions = {     // mqtt client options
  port: 1883,
  host: 'localhost',
  username: 'xmlClient',
  password: 'something',
  keepalive: 10000
};
var device = {            // device properties
  on: false,
  temperature: 24,
  setPoint: 18,
  mode: 1,
  connected: false,
  name: 'airConditioner'
};

// set up options for storing uploaded files:
var imgStore = multer.diskStorage({
  destination: __dirname + '/public/', // where you'll save files
  filename: saveUpload       // function to rename and save files
});

// initialize multer bodyparser using storage options from above:
var upload = multer({storage: imgStore});
// set file type: single file, with the type "image"
// (the client must have the same file type for the uploaded file):
var type = upload.single('image');

// callback function to handle route for uploads:
function getUpload(request, response) {
  // print the file info from the request:
  var fileInfo = JSON.stringify(request.file);
  console.log(fileInfo);
  response.end( fileInfo + '\n');
}

// callback function for file upload requests:
function saveUpload(request, file, save) {
  // this calls a function in the multer library that saves the file:
  save(null,file.originalname);
}

function postFile(request, response) {
  var fileName = __dirname + '/public/' + request.path;
  var data = fs.readFileSync(fileName);
  output = String(data);

  for (property in device) {
    var searchTerm = new RegExp('#'+ property, 'g');
    var value = String(device[property]);
    output = output.replace(searchTerm, value);
  }
  response.writeHead(200, {'Content-Type': 'text/xml'});
  response.end(output);
}

function announce() {
  for (property in device) {
    client.subscribe(device.name + '/' + property);  // subscribe to them
  }
}

function readMessages(topic, message) {
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
    device[property] = (String(message) == 'true');
  }
}

server.listen(8080);                        // listen for HTTP
server.use('/',express.static('public'));   // set a static file directory
server.post('/upload', type, getUpload);  // upload a file
server.post('/*.xml', postFile);

client = mqtt.connect(clientOptions); // connect
client.on('connect', announce);       // listener for connection
client.on('message', readMessages);   // listener for incoming messages
