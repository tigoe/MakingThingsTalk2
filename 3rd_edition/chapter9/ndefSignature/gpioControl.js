var Gpio = require('onoff').Gpio;
var lock = new Gpio(18, 'out'); // set solenoid I/O pin as output

function close() {
  lock.writeSync(0);
}

function open() {
  lock.writeSync(1);
  setTimeout(close, 2000);
}

//open();
module.exports = {
  close: close,
  open: open
};
