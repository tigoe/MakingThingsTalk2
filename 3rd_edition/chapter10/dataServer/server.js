/*
Datalogger
context: node.js

expects HTTP GET request with /data/timestamp/reading
*/
var express = require('express');      // include the express library
var fs = require('fs');                // include the filesystem library
var server = express();                // create a server using express

function log(request, response) {
  // format the params into a comma-separated string:
  var newData = request.params.timestamp + ','
  + request.params.reading + '\n';

  // add the data to the data file and send the client a response:
  fs.appendFile('data.csv', newData, confirmSave);
  response.end('Last upload at ' + new Date());
}

function confirmSave(error) {
  var now = new Date();               // make a date string
  if (error) {                        // if there's an error,
    console.log(now + ': ' + error);  // log it
  } else {                            // if not, log the successful save
    console.log(now + ': ' + 'Saved to file');
  }
}

server.listen(8080);                            // listen for HTTP
server.get('/data/:timestamp/:reading', log);   // wait for GET request
