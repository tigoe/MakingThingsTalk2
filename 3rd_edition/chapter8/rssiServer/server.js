
/*
  RSSI server
  context: node.js
*/
var express = require('express');	// include the express library
var server = express();					  // create a server using express
var rssi = -100;                  // the latest received signal strength

// server response to GET /rssi
function getRssi(request, response) {
  // make a string to send to the client:
  var message = "RSSI: " + rssi + " dBm<br>";
  message += "The receiver is ";
  if (rssi <= -60 ) {         // weakest signal strength
    message += "far away ";
  }
  if (rssi > -60 ) {          // a little stronger
    message += "within a few meters ";
  }
  if (rssi > -40 ) {
    message += "a few steps away ";
  }
  if (rssi > -30 ) {
    message += "arm's reach";
  }
  if (rssi > -20 ) {          // really strong signal
    message += "hand's reach";
  }
  message += " from the sender."  // add an end to the message
  response.send(message);         // send message to the client
  response.end();                 // close the connection
}

function setRssi(request, response) {
  rssi = request.params.rssi;   // get the signal strength from the request
  response.send("rssi received: " + rssi);  // respond to the client
  response.end();                 // close the connection
}
// start the server:
server.listen(8080);

// define what to do when the client requests something:
server.get('/rssi', getRssi);         // GET /rssi
server.post('/rssi/:rssi', setRssi);  // POST /rssi/value
