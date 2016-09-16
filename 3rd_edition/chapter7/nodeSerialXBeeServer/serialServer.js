/*
serialServer.js
context: node.js
*/

var express = require('express');  // include the express library
var server = express();            // create a server using express
server.use('/',express.static('public'));


// serial port initialization:
var SerialPort = require('serialport');    // include the serialport library
var portName = '/dev/tty.usbserial-00001414';// your port name
var incoming = [];                          // an array to hold the serial data
var message = {         // the XBee packet as a JSON object:
  packetLength: -1,     // packet length
  apiId: 0,              // message API identifier
  address: -1,          // sender's address
  rssi: 0,              // signal strength
  sampleCount:-1,       // number of I/O samples
  channels: 0,          // which I/O channels are in use
  samples: [],          // the array of samples
  average:-1,           // the average of the samples
  avgVoltage: -1        // the average in volts
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
  var samplesStart = 10;    // first byte of the actual samples
  var samplesEnd;           // last byte of the samples
  var sum = 0;              // sum of all the samples, for averaging
  var sample = 0;           // the current sample
  message.samples = [];      // clear the samples array

  if (thisPacket.length >= 20) {   // if the packet is 20 bytes long
    // read the address. It's a two-byte value, so
    // packetLength = firstByte * 256 + secondByte:
    message.packetLength = (thisPacket[0] * 256) + thisPacket[1];
    // message type is shown in hex in the docs, so convert to a hex string:
    message.apiId = '0x' + (thisPacket[2]).toString(16);
    // same two-byte formula with address:
    message.address = (thisPacket[3] * 256) + thisPacket[4];
    // read the received signal strength:
    message.rssi = -thisPacket[5];
    message.sampleCount = thisPacket[7]; // number of samples in packet
    // channels is also a two-byte value.
    // It's best read in binary, so convert to a binary string:
    message.channels = ((thisPacket[8] * 256) + thisPacket[9]).toString(2);
    samplesStart = 10;         // ADC reading starts at byte 10
    // each sample is two bytes, so calculate the end position:
    samplesEnd = samplesStart + (message.sampleCount * 2);
    sum = 0;                   // sum of all samples, for averaging

    // read the ADC inputs. Each is 10 bits, in two bytes, so
    // use the two-byte formula: sample = firstByte * 256 + secondByte:
    for (var i = samplesStart; i < samplesEnd;  i=i+2) {
      sample = (thisPacket[i]* 256) + thisPacket[i+1];
      // add the sample to the array of samples:
      message.samples.push(sample);
      // add the result to the sum for averaging later:
      sum = sum + sample;
    }
    // average all the samples and convert to a voltage:
    message.average = sum / message.sampleCount;
    message.avgVoltage = message.average *3.3 / 1024;
  }
  console.log(message);    // print it all out
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
