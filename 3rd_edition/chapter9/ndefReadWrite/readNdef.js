/*
  NDEF message reader
  context: node.js
*/
var ndef = require('ndef');             // import ndef library
var mifare = require('mifare-classic'); // import mifare classic library

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
    for (record in message) {               // loop over the message array
      console.log(message[record].value);   // get each record's value
    }
  }
}

mifare.read(listTag);   // read for tag
