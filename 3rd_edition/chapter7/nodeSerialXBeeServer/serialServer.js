/*
serialServer.js
context: node.js

To call this from the command line:
$ node serialTest.js portname
*/

// include libraries and declare global variables:
var express = require('express');  // include the express library
var server = express();            // create a server using express


// serial port initialization:
var SerialPort = require('serialport');    // include the serialport library
var portName = process.argv[2];            // get the port name from the command line
var output = [];                          // an array to hold the raw serial output
var message = {         // the XBee packet as a JSON object:
  address: -1,          // sender's address
  packetLength: -1,     // packet length
  type: 0,              // message API type
  rssi: 0,              // signal strength
  channels: 0,          // which I/O channels are in use
  sampleCount:-1,       // number of I/O samples
  samples: [],          // the array of samples
  average:-1,           // the average of the samples
  avgVoltage: -1        // the average in volts
};

// open the serial port:
var myPort = new SerialPort(portName);

function readData(data) {
    for (c=0; c < data.length; c++) {   // loop over all the bytes
      var value = Number(data[c]);      // get the byte value
      if (value === 0x7E) {             // 0x7E starts a new message
        parseData(output);              // run existing message through the parser
        output = [];                    // clear existing message
      } else {                          // if the byte's not 0x7E,
      output.push(value);               // add it to the output array
    }
  }
}

function portOpen(portName) {
  console.log('port ' + myPort.path + ' open');
  console.log('baud rate: ' + myPort.options.baudRate);
}

function portClose() {
  console.log('port closed');
}

function portError(error) {
  console.log('there was an error with the serial port: ' + error);
  myPort.close();
}

function parseData(thisPacket) {
  if (thisPacket.length >= 20) {        // if the packet is 20 bytes long
    message.samples = [];               // clear the samples array
    var samplesStart = 10;              // ADC reading starts at byte 10
    message.sampleCount = thisPacket[7];// number of samples in packet

    // each sample is two bytes large, so calculate the end position:
    var samplesEnd = samplesStart + (message.sampleCount * 2);
    var total = 0;                      // sum of all samples, for averaging

    // read the address. It's a two-byte value, so
    // packetLength = firstByte * 256 + secondByte:
    message.packetLength = (thisPacket[0] * 256) + thisPacket[1];
    // same formula with address:
    message.address = (thisPacket[3] * 256) + thisPacket[4];
    // read the received signal strength:
    message.rssi = -thisPacket[5];
    // message type is shown in hex in the docs, so convert to a hex string:
    message.type = (thisPacket[2]).toString(16);
    // channels is best read in binary, so convert to a binary string:
    message.channels = ((thisPacket[8] * 256) + thisPacket[9]).toString(2);

    // read the ADC inputs. Each is 10 bits, in two bytes, so
    // sample = firstByte * 256 + secondByte:
    for (var i = samplesStart; i < samplesEnd;  i=i+2) {
      // 10-bit value = firstByte * 256 + secondByte:
      var thisSample = (thisPacket[i]* 256) + thisPacket[i+1];
      // add the sample to the array of samples:
      message.samples.push(thisSample);
      // add the result to the total for averaging later:
      total = total + thisSample;
    }
    // average all the samples and convert to a voltage:
    message.average = total / message.sampleCount;
    message.avgVoltage = message.average *3.3 / 1024;
  }
  console.log(message);    // print it all out
}

// define the callback function that's called when
// a client makes a request:
function respondToClient(request, response) {
  // write back to the client:
  response.end("latest: " + JSON.stringify(message));
}

// called when the serial port opens:
myPort.on('open', portOpen);
// called when there's new incoming serial data:
myPort.on('data', readData);
// called when the serial port closes:
myPort.on('close', portClose);
// called when there's an error with the serial port:
myPort.on('error', portError);

// start the server:
server.listen(8080);
// define what to do when the client requests something:
server.get('/', respondToClient);
