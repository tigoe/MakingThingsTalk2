/*
encryption script
context: node.js
to run this script add the message and key at the end of your command like so:
$ node encrypt.js message key
*/
// include the crypto and filesystem libraries:
var crypto = require('crypto');
var fs = require('fs');
// take input from the command line:
var key = process.argv[3];      // fourth argument from the command line
var message = process.argv[2];  // third argument from the command line

// set the location of the file that you'll output
// (whatever directory you call this script from ):
var fileName = 'info.txt';

// create a cipher:
var cipher = crypto.createCipher('aes-256-cbc', key);
// add the message to the cipher and finalize it:
var encryptedMsg =  cipher.update(message, 'utf8', 'hex');
encryptedMsg += cipher.final('hex')

// callback function for the writeFile function:
function success(data) {
  console.log('I wrote to the file: ' + fileName);
}

// write the encrypted message to the file:
fs.writeFile(fileName, encryptedMsg, success);
