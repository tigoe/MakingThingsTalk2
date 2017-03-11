/*
NDEF signed message reader
Reads an NDEF tag for a message, then
Uses public-key cryptography to verify the records.
context: node.js

To generate keys:
$ openssl genrsa -out private.key 2048
$ openssl rsa -pubout -in private.key -out public.key
*/
var ndef = require('ndef');             // include ndef library
var mifare = require('mifare-classic'); // include mifare classic library
var crypto = require('crypto');         // include the crypto library
var fs = require('fs');                 // include filesystem library

var pubKey = fs.readFileSync('keys/public.key');  // read the public key
var publicKey = pubKey.toString();                // convert it to a string
var secret = null;                                // set the secret message

// function to set the secret:
function setSecret(data) {
  secret = data;
}
// callback function for when you successfully read a tag:
function getMessage(error, buffer) {
  if (error) {                              // if there's an error
    console.log('error ' + error);          // print it
  } else {                                  // otherwise
    console.log(parseMessage(buffer));      // check the message
  }
}

function parseMessage(buffer) {
  var result = null;                        // result to return
  var bytes = buffer.toJSON();              // convert the tag data to JSON
  if (bytes.hasOwnProperty('data')) {       // if it's got a data property
    bytes = bytes.data;                     // then get the data
    var message = ndef.decodeMessage(bytes);// decode the message
    for (r in message) {                    // loop over the message array
      var record  = message[r].value;       // get each record's value
      result = verifyRecord(record, secret);// verify it
    }
  } else {
    result = false;                 // nothing to verify, so return false
  }
  return result;
}

function verifyRecord(signature, secret) {
  var verifier = crypto.createVerify('RSA-SHA256');// make a verifier
  verifier.update(secret);                         // update with the secret
  // verify the incoming encrypted signature:
  var result = verifier.verify(publicKey, signature, 'hex');
  return result;
}

// If there are command line arguments, process them:
if (process.argv[2] != null) {
 setSecret(process.argv[2]);  // get the secret from the command line
 mifare.read(getMessage);     // attempt to read the tag
}

 // this section exports some functions for use by other scripts:
module.exports = {
  setSecret: setSecret,
  read: mifare.read,
  parseMessage: parseMessage
}
