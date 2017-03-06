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
var secret = "Hello";                // set the secret message
var ndefMsg = new Array();                        // array for the NDEF message

function setSecret(input) {
  secret = input;
}
// callback function for when you successfully read a tag:
function listTag(error, buffer) {
  var result = false;
  if (error) {                              // if there's an error
    result = error;
  } else {                                  // otherwise
    var bytes = buffer.toJSON();            // convert the tag data to JSON
    if (bytes.hasOwnProperty('data')) {     // if it's got a data property
      bytes = bytes.data;                   // then get the data
    }
    var message = ndef.decodeMessage(bytes);// decode the message
    for (r in message) {                    // loop over the message array
      var record  = message[r].value;       // get each record's value
      console.log("record: " + record);     // print it
      var verified = verifyRecord(record, secret);     // verify it
      result = verified;
    }
  }
  return result;
}

function verifyRecord(signature, secret) {
  var verifier = crypto.createVerify('RSA-SHA256');// make a verifier
  verifier.update(secret);                         // update it with the secret
  // verify the incoming encrypted signature:
  var result = verifier.verify(publicKey, signature, 'hex');
  return result;
}

module.exports = {
  setSecret: setSecret,
  read: mifare.read,
  verify: listTag
}
