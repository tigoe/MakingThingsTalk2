/*
  NDEF signed message reader
  Reads an NDEF tag for a message, then
  Uses public-key cryptography to verify the records.
  context: node.js
*/
var ndef = require('ndef');             // instance of ndef library
var mifare = require('mifare-classic'); // instance of mifare classic library
var crypto = require('crypto');         // instance of the crypto library
var fs = require('fs');                 // instance of the filesystem library

var pubKey = fs.readFileSync('keys/domain.crt');  // read the public key
var publicKey = pubKey.toString();                // conver it to a string
var secret = "tom.igoe@gmail.com";                // set the secret message
var ndefMsg = new Array();                        // array for the NDEF message

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
      var record  = message[r].value;       // get each record's value
      console.log("record: " + record);     // print it
      verifyRecord(record);                 // verify it
    }
  }
}

function verifyRecord(signature) {
  var verifier = crypto.createVerify('RSA-SHA256');// make a verifier
  verifier.update(secret);                         // update it with the secret
  // verify the incoming encrypted signature:
  var result = verifier.verify(publicKey, signature, 'hex');
  // if the signature's good, report that:
  console.log("record matches secret: " + result);
}

pollReader();                     // read for tags
//setInterval(pollReader, 1000);  // use this instead to read once per second
