var ndef = require('ndef');
var mifare = require('mifare-classic');
var ndefMsg;
var record = {
  "name": "Tom",
  "light": 1,
  "brightness": 50
};

var recordString = JSON.stringify(record)
var ndefRecord = ndef.textRecord("Hello world");
ndefMsg = [ndefRecord]; // make a text record;
console.log(ndefMsg);
var bytes = ndef.encodeMessage(ndefMsg);      // encode the record as a byte stream

function writeResponse(error){     // write function
    if (error) {                          // if there's an error,
    nfcResponse = "Write failed ";  // report it
    nfcResponse += error;
  } else {
    nfcResponse = "Tag written successfully" + JSON.stringify(record);
  }
  console.log(nfcResponse);// report that the tag was written
}

mifare.write(bytes, writeResponse);         // end of mifare.write()
