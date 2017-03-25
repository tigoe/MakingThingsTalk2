/*
  A static file server in node.js.
  Put your static content in a directory next to this called public.
  context: node.js
*/
var express = require('express');           // include the express library
var server = express();					            // create a server using express
var multer  = require('multer');        // middleware for file uploads

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

server.listen(8080);                        // listen for HTTP
server.use('/',express.static('public'));   // set a static file directory
server.post('/upload', type, getUpload);  // upload a file
