/*
  NDEF signed message writer
  Uses public-key cryptography to sign a record,
  then writes it to an NDEF message and then to a tag
  context: node.js
*/
var ndef = require('ndef');             // instance of ndef library
var mifare = require('mifare-classic'); // instance of mifare classic library
var crypto = require('crypto');         // instance of the crypto library
var fs = require('fs');                 // instance of the filesystem library

var privKey = fs.readFileSync('keys/domain.key'); // read the private key
var privateKey = privKey.toString();              // convert to a string
var secret = "Hello";                                  // secret to be encrypted
var ndefMsg = new Array();                        // array for the NDEF message

// this function makes an NDEF message, signed or unsigned:
function makeMessage(record, signed) {
  var ndefRecord;           // string for the NDEF record

  // if the record is to be signed, then sign it:
  if (signed === true) {
    var signer = crypto.createSign('RSA-SHA256');   // make a signer
    signer.update(record);                          // add the record
    var signature = signer.sign(privateKey, 'hex'); // make the signature
    ndefRecord = ndef.textRecord(signature);        // make it an NDEF record
  } else {  // if the record shouldn't be signed:
    ndefRecord = ndef.textRecord(record);           // make unsigned NDEF rec.
  }
  // add the record to the message:
  ndefMsg.push(ndefRecord);

  var bytes = ndef.encodeMessage(ndefMsg); // encode the record as a byte stream
  return bytes;
}

// callback function for the write() function:
function writeResponse(error){
    if (error) {
      console.log(error);
    } else {
      console.log('success');
    }
}

var response = makeMessage(secret, true);               // Add the secret, encrypted
mifare.write(response, writeResponse);

module.exports = {
  makeMessage: makeMessage,
  writeTag: mifare.write
};
