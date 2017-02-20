var ndef = require('ndef');
var mifare = require('mifare-classic');
var ndefMsg = new Array();

function pollReader() {
  mifare.read(listTag);   // read for tag
}

function listTag(error, buffer) {
  if (error) {
    console.log("Read failed:  " + error);
  } else {
    var bytes = buffer.toJSON();
    console.log(bytes);
    if (bytes.hasOwnProperty('data')) {
      bytes = bytes.data;
    }

    var message = ndef.decodeMessage(bytes);
    if (message.length > 0) {
      ndefMsg = message;
      console.log(ndef.stringify(ndefMsg));
    }
  }
}

setInterval(pollReader, 1000);
