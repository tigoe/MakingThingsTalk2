
/*
Noble characteristic writer  example

created 12 July 2016
by Tom Igoe
with much advice from Sandeep Mistry
*/

var noble = require('noble');   //noble library
var targetService = 'f01a';     // the service you want
var shutter = null;

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
  // peripheral.on('disconnect', disconnectMe);
}

// the service/characteristic exploration function:
function exploreMe(error, services, characteristics) {
  console.log('services: ' + services);
  console.log('characteristics: ' + characteristics);
  for (c in characteristics) {
    var myUuid = characteristics[c].uuid;
    characteristics[c].notify(true);    // turn on notifications
    if (myUuid === 'f01b') {
      // this is the service we want to control
      shutter = characteristics[c];
      setInterval(click, 2000);
    }
  }
}

function click() {
  if (shutter != null) {
    console.log("click");
    var output =  new Buffer([0x01]);
    shutter.write(output, true);
  }
}

// function disconnectMe() {
//   console.log('peripheral disconnected');
//   // exit the script:
//   process.exit(0);
// }

/* ----------------------------------------------------
The actual commands that start the program are below:
*/

noble.on('stateChange', scan);  // when the BT radio turns on, start scanning
noble.on('discover', findMe);   // when you discover a peripheral, run findMe()
