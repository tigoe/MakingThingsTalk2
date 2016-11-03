
/*
  Noble Bluetooth LE server
  context: node.js
*/

// include libraries:
var noble = require('noble');
var express = require('express');
var server = express();					  // create a server using express

var cameraUuid = 'f01a';          // uuid for the the camera service
var shutterUuid = 'f01b';         // uuid for the shutter characteristic
var shutter = null;               // the shutter characteristic
var clickCount = 0;               // count of camera clicks from the client
var device;                       // the peripheral to which you're connecting

// serve static files from /public:
server.use('/',express.static('public'));

//  callback function for noble stateChange event:
function scanForPeripherals(state){
  if (state === 'poweredOn') {                // if the Bluetooth radio's on,
    noble.startScanning([cameraUuid], false); // scan for the camera service
    console.log("Started scanning");
  } else {                                    // if the radio's off,
    noble.stopScanning();                     // stop scanning
    console.log("Bluetooth radio not responding. Ending program.");
    process.exit(0);                          // end the program
  }
}

// callback function for noble discover event:
function readPeripheral (peripheral) {
  console.log('discovered ' + peripheral.advertisement.localName);
  console.log('signal strength: ' + peripheral.rssi);
  // the readServices function. This is local to the discovery function
  // because it needs the peripheral’s identity to discover services:
  function readServices() {
    device = peripheral;    // save the peripheral to a global variable
    console.log('Checking services: ' + peripheral.advertisement.localName);
    // Look for services and characteristics.
    // Call the explore function when you find them:
    peripheral.discoverAllServicesAndCharacteristics(explore);
  }

  noble.stopScanning();                 // stop scanning
  peripheral.connect();                 // attempt to connect to peripheral
  peripheral.on('connect', readServices);  // read services when you connect
}

// the service/characteristic explore function.
// depends on the of services & characteristics, not the peripheral,
// so it doesn't have to be local to readPeripheral():
function explore(error, services, characteristics) {
  // list the services and characteristics found:
  console.log('services: ' + services);
  console.log('characteristics: ' + characteristics);

  // check if each characteristic's UUID matches the shutter UUID:
  for (c in characteristics) {
    if (characteristics[c].uuid === shutterUuid) {
      // this is the characteristic you want to control:
      shutter = characteristics[c];
    }
  }
}

// the function for the HTTP response to GET /click:
function click(request, response) {
  var result = "no peripheral present";  // what you'll send to the client
  // if you're connected and have a valid characteristic:
  if (device.state === 'connected' && shutter != null ) {
    // write to the characteristic:
    var output =  new Buffer([0x01]);
    shutter.write(output, true);
    clickCount++;                           // increment click counter
    result = "Click count: " + clickCount;  // change the response
  }
  response.end(result);   // respond to the HTTP client
}

// Scan for peripherals with the camera service UUID:
noble.on('stateChange', scanForPeripherals);
noble.on('discover', readPeripheral);

server.listen(8080);        // start the HTTP server
server.get('/click', click); // GEt request listener
