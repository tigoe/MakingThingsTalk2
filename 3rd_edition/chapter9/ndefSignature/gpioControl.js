/*
 GPIO control
 context: node.js
*/

var Gpio = require('onoff').Gpio; // include onoff library
var lock = new Gpio(18, 'out');   // set solenoid I/O pin as output

function close() {
  lock.writeSync(0);        // turn the lock pin off
}

function open() {
  lock.writeSync(1);        // turn the lock pin on
  setTimeout(close, 2000);  // set a 2 second timeout
}

// If there are command line arguments, process them:
if (process.argv[2] === '-o') {
  open();
}

// this section exports some functions for use by other scripts:
module.exports = {
  close: close,
  open: open
};
