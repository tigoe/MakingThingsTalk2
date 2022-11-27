/*
decryption script
context: node.js
to run this script add the filename and key at the end of your command like so:
$ node decrypt.js message key

Updated 2 Nov 2020 because createDecipher had been deprecated.

*/
// include the crypto and filesystem libraries:
var crypto = require('crypto');
var fs = require('fs');
// make a hash for the password:
const hash = crypto.createHash('sha256');

// take input from the command line:
var key = process.argv[3];      // fourth element from the command line
// set the location of the file that you'll output:
var fileName = __dirname + "/" + process.argv[2];

// hash the password from the command line input:
hash.update(key);

// callback function for the readFile function:
function success(error, data) {
  if (data) {
    // get the data from the file:
    data = data.toString();
    // split it on the -:
    var results = data.split('-');
    // create a decipherer:
    var iv = Buffer.from(results[1], 'hex');
    var decipher = crypto.createDecipheriv('aes-256-cbc', hash.digest(), iv);
// decrypt the first part of the data:
    var decryptedMsg = decipher.update(results[0], 'hex', 'utf8');
    decryptedMsg += decipher.final('utf8');
    console.log('I read this from the file: ' + decryptedMsg);
  } else if (error) {
    console.log(error);
  }
}

fs.readFile(fileName, success);
