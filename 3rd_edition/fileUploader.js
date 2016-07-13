/*
  Making Things Talk 3rd ed test for file upload

  note: upload fieldname must be the same as this, e.g 'image'.
  Use this curl example:
  curl  -F image=@path/to/yourImage.jpg 'http://localhost:8080'
*/
var express = require('express');   // include express.js
var multer  = require('multer');    // include multer.js as body parser

// set up file upload desintation and renaming callback:
var storage = multer.diskStorage({
  destination: 'uploads/',
  filename: renameFile
});

// initialize the server app:
var app = express();
app.use('/',express.static('public'));

// initialize multer bodyparser using storage options from above:
var upload = multer({storage: storage});
// set file type: single file, with the type "image"
// (the client must have the same file handle for the uploaded file):
var type = upload.single('image');

// route handler for uploads:
function getUpload (request, response) {
  // print the file info from the request:
  var fileInfo = JSON.stringify(request.file);
  console.log(fileInfo);
  response.end( fileInfo + '\n');
}

function renameFile(request, file, callback) {
  var newName = file.fieldname + '-' + new Date().getTime();
  // this calls a callback function in the multer library that renames the file:
  callback(null,newName);
}

// start the server:
var server = app.listen(8080);
app.post('/upload', type, getUpload);
