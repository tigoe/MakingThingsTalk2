/*
  NDEF message writer
  context: node.js
*/
var ndef = require('ndef');             // instance of ndef library
var mifare = require('mifare-classic'); // instance of mifare classic library
var ndefMsg = new Array();              // array for NDEF message

var record = {                          // NDEF record
  "name": "Clay",
  "light": 1,
  "brightness": 50
};

var recordString = JSON.stringify(record);      // convert record to a string
var ndefRecord = ndef.textRecord(recordString); // make it an NDEF record
ndefMsg.push(ndefRecord);                       // add it to the NDEF message
var bytes = ndef.encodeMessage(ndefMsg); // encode the record as a byte stream

function writeResponse(error){          // write function
    if (error) {                        // if there's an error,
      console.log("Error: " + error);
    } else {
      console.log("Tag written successfully");
    }
}

// write to the tag:
mifare.write(bytes, writeResponse);
