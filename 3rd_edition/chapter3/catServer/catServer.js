/*
  cat server
  context: node.js
*/
// include required libraries:
var crypto = require('crypto');         // encryption/decryption tool
var fs = require('fs');                 // filesystem manager
var express = require('express');       // web server
var nodemailer = require('nodemailer'); // emailer
var multer  = require('multer');        // middleware for file uploads

// get the key for the password file from the command line argument:
var key = process.argv[3];
// the file itself is in the script's directory:
var fileName = __dirname + "/info.txt";
// create a decipherer:
var decipher = crypto.createDecipher('aes-256-cbc', key);

// create a server using express and set up a directory for static files:
var server = express();
server.use('/',express.static('public'));

// set up options for storing uploaded files:
var imgStore = multer.diskStorage({
  destination: __dirname + '/public/', // where you'll save files
  filename: saveUpload       // function to rename and save files
});

// initialize multer bodyparser using storage options from above:
var upload = multer({storage: imgStore});
// set file type: single file, with the type "image"
// (the client must have the same file type for the uploaded file):
var type = upload.single('image');

// set up mail account:
var account = {
  host: 'smtp.gmail.com',   // mail server
  port: 465,                // SSL mail port
  secure: true,             // using secure sockets for mail
  auth: {
    user: process.argv[2],  // username from the commnand line
    pass: ''                // password will come from decryption later
  }
};

// set up the mail message content:
var message = {
  from: account.auth.user,
  to: 'tom.igoe@gmail.com', //''cat.owner@example.com',
  subject: 'Hello from the cat',
  text: 'The cat is sitting on his mat! http://www.example.com/catcam.html'
};


// callback function to handle route for mail requests:
function sendMail(request, response) {
  // callback function to confirm mail was sent and inform web client:
  function confirmMail(error, info) {
    if(error){
      console.log(error);
      response.end("Something went wrong. Check the server for details.");
    } else {
      response.send("I sent a mail to " + message.to);
    }
  }

  // create a mail client and send the mail:
  var mailClient = nodemailer.createTransport(account);
  var responseString = mailClient.sendMail(message, confirmMail);
}

// callback function to handle route for uploads:
function getUpload(request, response) {
  // print the file info from the request:
  var fileInfo = JSON.stringify(request.file);
  console.log(fileInfo);
  response.end( fileInfo + '\n');
}

// callback function for file upload requests:
function saveUpload(request, file, save) {
  // this calls a function in the multer library that saves the file:
  save(null,file.originalname);
}


// callback function to decipher data from file:
function decryptFile(error, data) {
  // if there's valid data from the file, decrypt it:
  if (data){
    var content = data.toString();
    var decryptedPassword = decipher.update(content, 'hex', 'utf8');
    decryptedPassword += decipher.final('utf8');
    account.auth.pass = decryptedPassword;
  // if the file produces an error, report it:
  } else if (error) {
    console.log(error);
  }
}

// read from the password file:
fs.readFile(fileName, decryptFile);
console.log("credentials for " + account.auth.user + " obtained.");

// start the server:
server.listen(8080);
server.get('/mail', sendMail);            // send a mail
server.post('/upload', type, getUpload);  // upload a file
console.log("waiting for web clients now.");
