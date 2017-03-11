/*
  NDEF signed message writer
  Uses public-key cryptography to sign a record,
  then writes it to an NDEF message and then to a tag
  context: node.js

  To generate keys:
  $ openssl genrsa -out private.key 2048
  $ openssl rsa -pubout -in private.key -out public.key
*/
var ndef = require('ndef');             // include ndef library
var mifare = require('mifare-classic'); // include mifare classic library
var crypto = require('crypto');         // include crypto library
var fs = require('fs');                 // include filesystem library

var privKey = fs.readFileSync('keys/private.key'); // read the private key
var privateKey = privKey.toString();               // convert to a string
var secret = null;                                 // secret to be encrypted

// function to set the secret:
function setSecret(data) {
  secret = data;
}

// this function makes an NDEF message, signed or unsigned:
function setMessage(record, signed) {
  var ndefRecord;                   // string for the NDEF record
  var ndefMsg = new Array();        // array for the NDEF message

  if (signed === true) {  // if the record is to be signed, then sign it
    var signer = crypto.createSign('RSA-SHA256');   // make a signer
    signer.update(record);                          // add the record
    var signature = signer.sign(privateKey, 'hex'); // make the signature
    ndefRecord = ndef.textRecord(signature);        // make NDEF record
  } else {  // if the record shouldn't be signed:
    ndefRecord = ndef.textRecord(record);           // make unsigned record
  }

  ndefMsg.push(ndefRecord);                // add the record to the message
  var bytes = ndef.encodeMessage(ndefMsg); // encode record as byte array
  return bytes;                            // return the byte array
}

// callback function for the write() and format() functions:
function showResponse(error){
    if (error) {
      console.log('error ' + error);
    } else {
      console.log('success');
    }
}

// If there are command line arguments, process them:
if (process.argv[2] != null) {
  if (process.argv[2] === '-f') {             // if the -f flag is included,
    mifare.format(showResponse);              // format the tag
  } else {                                    // otherwise,
    setSecret(process.argv[2]);               // get secret from command line
    var response = setMessage(secret, true);  // Add the secret, encrypted
    mifare.write(response, showResponse);     // attempt to write the tag
  }
}

// this section exports some functions for use by other scripts:
module.exports = {
  format: mifare.format,
  setMessage: setMessage,
  write: mifare.write
};
