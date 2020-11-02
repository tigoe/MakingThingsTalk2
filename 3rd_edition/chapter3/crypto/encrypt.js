/*
encryption script
context: node.js
to run this script add the message and key at the end of your command like so:
$ node encrypt.js message key

Updated 2 Nov 2020 because createCipher had been deprecated.

*/
// include the crypto and filesystem libraries:
var crypto = require('crypto');
var fs = require('fs');
// make a hash for the password:
const hash = crypto.createHash('sha256');

// take input from the command line:
var key = process.argv[3];      // fourth argument from the command line
var message =  process.argv[2];  // third argument from the command line

// hash the password from the command line input:
hash.update(key);

// set the location of the file that you'll output
// (whatever directory you call this script from ):
var fileName = 'info.txt';

// create a cipher:
const iv = crypto.randomBytes(16);
var cipher = crypto.createCipheriv('aes-256-cbc', hash.digest(), iv);
console.log(iv.toString('hex'));

// add the message to the cipher and finalize it:
var encryptedMsg =  cipher.update(message, 'utf8', 'hex');
encryptedMsg += cipher.final('hex');
// add a - and then the initialization vector for the cipher, hex-encoded:
encryptedMsg += '-';
encryptedMsg += iv.toString('hex');

// callback function for the writeFile function:
function success(data) {
  console.log('I wrote to the file: ' + fileName);
}

// write the encrypted message to the file:
fs.writeFile(fileName, encryptedMsg, success);
