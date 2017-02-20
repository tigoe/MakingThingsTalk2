/*
  NDEF message reader
  context: node.js
*/
var ndef = require('ndef');             // instance of ndef library
var mifare = require('mifare-classic'); // instance of mifare classic library
var ndefMsg = new Array();              // array for NDEF message

function pollReader() {
  mifare.read(listTag);   // read for tag
}

// callback function for when you successfully read a tag:
function listTag(error, buffer) {
  if (error) {                              // if there's an error
    console.log("Read failed:  " + error);  // report it
  } else {                                  // otherwise
    var bytes = buffer.toJSON();            // convert the tag data to JSON
    if (bytes.hasOwnProperty('data')) {     // if it's got a data property
      bytes = bytes.data;                   // then get the data
    }
    var message = ndef.decodeMessage(bytes);// decode the message
    for (r in message) {                    // loop over the message array
      console.log(message[r].value);        // get each record's value
    }
  }
}

pollReader();                     // read for tags
//setInterval(pollReader, 1000);  // use this instead to read once per second
