/*
decryption script
context: node.js
to run this script add the filename and key at the end of your command like so:
$ node encrypt.js message key
*/
// include the crypto and filesystem libraries:
var crypto = require('crypto');
var fs = require('fs');
// take input from the command line:
var key = process.argv[3];      // fourth element from the command line
// set the location of the file that you'll output:
var fileName = __dirname +"/"+ process.argv[2];

// create a decipherer:
var decipher = crypto.createDecipher('aes-256-cbc', key);

// callback function for the readFile function:
function success(error, data) {
  if (data){
    data = data.toString();
    var decryptedMsg = decipher.update(data, 'hex', 'utf8');
    decryptedMsg += decipher.final('utf8');
    console.log('I read this from the file: ' + decryptedMsg);
  } else if (error) {
    console.log(error);
  }
}

fs.readFile(fileName, success);
