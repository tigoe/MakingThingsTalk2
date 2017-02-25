/*
  NDEF message writer
  context: node.js
*/
var ndef = require('ndef');             // instance of ndef library
var mifare = require('mifare-classic'); // instance of mifare classic library
var ndefMsg = new Array();              // array for NDEF message

var textRecord = ndef.textRecord("Here's a string");
var uriRecord = ndef.uriRecord("http://www.example.com");

ndefMsg.push(textRecord);               // add a text record the NDEF message
ndefMsg.push(uriRecord);                // add  a URI record
var bytes = ndef.encodeMessage(ndefMsg);// encode the record as a byte stream

function writeResponse(error){          // write function
    if (error) {                        // if there's an error,
      console.log("Error: " + error);   // report it
    } else {                            // otherwise, report success
      console.log("Tag written successfully");
    }
}

// write to the tag:
mifare.write(bytes, writeResponse);
