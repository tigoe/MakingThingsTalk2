/*
serialInBinary.js

Tests the functtionality of the serial port library
To be used in conjunction with the Arduino sketch called AnalogReadWriteBinary.ino,
in this repository.

This script expects a steady stream of input
from the serial port in binary form. Interprets each byte as its
raw value, not as a character

To call this from the command line:

node serialTest.js portname

where portname is the path to the serial port.

refactored to get rid of anonymous functions, to make it clearer for
those new to JavaScript

created 21 Aug 2012
modified 10 Jun 2015
by Tom Igoe

*/

// serial port initialization:
var serialport = require('serialport'),		// include the serialport library
SerialPort  = serialport.SerialPort,			// make a local instance of serial
portName = process.argv[2],								// get the port name from the command line
portConfig = {
	baudRate: 9600,
	parser: SerialPort.parsers.byteDelimiter(0x7E)
};

// open the serial port:
var myPort = new SerialPort(portName, portConfig);

myPort.on('open', openPort);			// called when the serial port opens
myPort.on('close', closePort);		// called when the serial port closes
myPort.on('error', serialError);	// called when there's an error with the serial port
myPort.on('data', listen);				// called when there's new incoming serial data

function openPort() {
	console.log('port open');
	console.log('baud rate: ' + myPort.options.baudRate);
}

function closePort() {
	console.log('port closed');
}

function serialError(error) {
	console.log('there was an error with the serial port: ' + error);
	myPort.close();
}

function listen(data) {
	// data buffer will be variable length
	// depending on how fast the transmitting device is sending.
	// read each byte of the buffer:
	console.log("packet length: " + data.length);
	var value = parseData(data);
	console.log(value);

}

function parseData(data) {
	if (data.length === 22) {
		var adcStart = 10;                     // ADC reading starts at byte 12
		var numSamples = data[7];        // number of samples in packet
		var total = 0;                         // sum of all the ADC readings

		// read the address. It's a two-byte value, so you
		// add the two bytes as follows:
		var address = data[4] + data[3] * 256;
		// read <numSamples> 10-bit analog values, two at a time
		// because each reading is two bytes long:
		for (var thisByte = 0; thisByte < numSamples * 2;  thisByte=thisByte+2) {
			// 10-bit value = high byte * 256 + low byte:
			var thisSample = (data[thisByte + adcStart] * 256) +
			data[(thisByte + 1) + adcStart];
			// add the result to the total for averaging later:
			total = total + thisSample;
		}
		// average the result:
		var average = total / numSamples;
		return average;
	}
}
