
/*
Noble characteristic notifcation  example

This example uses Sandeep Mistry's noble library for node.js to
subscribe to a characteristic that has its notify property set.
The startScanning function call filters for the specific service
you want, in order to ignore other devices and services.

For a peripheral example that works with this see the
Arduino BLEAnalogNotify example in this repository

created 2 Mar 2015
modified 5 Mar 2015
by Tom Igoe
with much advice from Sandeep Mistry and Don Coleman
*/

var noble = require('noble');   //noble library
var targetService = '19b10010e8f2537e4f6cd104768a1214';     // the service you want
var accelerometer = {
    'x':null,
    'y':null,
    'z':null
};

// The scanning function
function scan(state){
  if (state === 'poweredOn') {    // if the radio's on, scan for this service
    noble.startScanning([targetService], false);
    //  noble.startScanning();
    console.log("Started scanning");
  } else {                        // if the radio's off, let the user know:
    noble.stopScanning();
    console.log("Is Bluetooth on?");
  }
}

// the main discovery function
function findMe (peripheral) {
  console.log('discovered ' + peripheral.advertisement.localName);
  peripheral.connect();     // start connection attempts

  // called only when the peripheral has the service you're looking for:
  peripheral.on('connect', connectMe);

  // the connect function. This is local to the discovery function
  // because it needs the peripheral to discover services:
  function connectMe() {
    noble.stopScanning();
    console.log('Checking for services on ' + peripheral.advertisement.localName);
    // start discovering services:
      peripheral.discoverAllServicesAndCharacteristics(exploreMe);
  }

  // when a peripheral disconnects, run disconnectMe:
  peripheral.on('disconnect', disconnectMe);
}

// the service/characteristic exploration function:
function exploreMe(error, services, characteristics) {
  console.log('services: ' + services);
  console.log('characteristics: ' + characteristics);
  for (c in characteristics) {
      var myUuid = characteristics[c].uuid;

    characteristics[c].notify(true);    // turn on notifications
    if (myUuid === '19b10011e8f2537e4f6cd104768a1214') {
      characteristics[c].on('data', getX);
    }
    if (myUuid === '19b10012e8f2537e4f6cd104768a1214') {
      characteristics[c].on('data', getY);
    }
    if (myUuid === '19b10013e8f2537e4f6cd104768a1214') {
      characteristics[c].on('data', getZ);
    }
  }
}

// the notification read function:
function getX (data, notification) {
//  if (notification) {   // if you got a notification
 // read the incoming buffer as a float:
        accelerometer.x = data.readFloatLE(0);
//  }
}

// the notification read function:
function getY (data, notification) {
//  if (notification) {   // if you got a notification
 // read the incoming buffer as a float:
    accelerometer.y = data.readFloatLE(0);
//  }
}


// the notification read function:
function getZ (data, notification) {
//  if (notification) {   // if you got a notification
 // read the incoming buffer as a float:
    accelerometer.z= data.readFloatLE(0);
    console.log(accelerometer);
//  }
}



function report() {
  console.log("report");
}


function disconnectMe() {
  console.log('peripheral disconnected');
  // exit the script:
  process.exit(0);
}

/* ----------------------------------------------------
The actual commands that start the program are below:
*/

noble.on('stateChange', scan);  // when the BT radio turns on, start scanning
noble.on('discover', findMe);   // when you discover a peripheral, run findMe()
