/*
serialServer.js
context: node.js
*/

var express = require('express');  // include the express library
var server = express();            // create a server using express
server.use('/',express.static('public'));


// serial port initialization:
var SerialPort = require('serialport');  // include the serialport library
var portName = '/dev/tty.usbserial-00002014';// your port name
var incoming = [];                       // an array to hold the serial data

var message = {          // the XBee packet as a JSON object:
  packetLength: -1,      // packet length
  apiId: 0,              // message API identifier
  address: -1,           // sender's address
  rssi: 0,               // signal strength
  channels: 0,           // which I/O channels are in use
  sampleData: 0,         // sample data from all pins
  pinStates: []         // array with the state of the digital pins
};

// open the serial port:
var myPort = new SerialPort(portName);

function portOpen(portName) {
  console.log('port ' + myPort.path + ' open');
  console.log('baud rate: ' + myPort.options.baudRate);
}

function portError(error) {
  console.log('there was an error with the serial port: ' + error);
  myPort.close();
}

function readData(data) {
  for (c=0; c < data.length; c++) {   // loop over all the bytes
    var value = Number(data[c]);      // get the byte value
    if (value === 0x7E) {             // 0x7E starts a new message
      parseData(incoming);
      incoming = [];                    // clear existing message
    } else {                          // if the byte's not 0x7E,
    incoming.push(value);               // add it to the incoming array
  }
}
}

function parseData(thisPacket) {
  if (thisPacket.length >= 12) {   // if the packet is 12 bytes long
    // read the address. It's a two-byte value, so
    // packetLength = firstByte * 256 + secondByte:
    message.packetLength = (thisPacket[0] * 256) + thisPacket[1];
    // message type is shown in hex in the docs, so convert to a hex string:
    message.apiId = '0x' + (thisPacket[2]).toString(16);
    // same two-byte formula with address:
    message.address = (thisPacket[3] * 256) + thisPacket[4];
    // read the received signal strength:
    message.rssi = -thisPacket[5];
    // channels is also a two-byte value.
    // It's best read in binary, so convert to a binary string:
    message.channels = ((thisPacket[8] * 256) + thisPacket[9]).toString(2);
    // pin states:
    message.sampleData = (thisPacket[10] * 256) + thisPacket[11];
    message.pinStates = [];
    // convert the sample data into an array of pin states:
    for (var pin = 0; pin < 9; pin++) {
      // isolate each bit of the sample data:
      var thisPinState = message.sampleData & (1 << pin);
      // push each pin's state to the pin states array:
      message.pinStates.push(thisPinState);
    }
    console.log(message);    // print it all out
  }
}

// define the callback function that's called when
// a client makes a request:
function respondToClient(request, response) {
  // write back to the client:
  response.end(JSON.stringify(message));
}

// called when the serial port opens:
myPort.on('open', portOpen);
// called when there's new incoming serial data:
myPort.on('data', readData);
// called when there's an error with the serial port:
myPort.on('error', portError);

server.listen(8080);              // start the server
server.get('/json', respondToClient); // respond to GET requests
