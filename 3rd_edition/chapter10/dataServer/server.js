/*
Datalogger
context: node.js

expects HTTP GET request with /data/?readings=xxx;yyyy;zzzz;
where xxxz, yyyy, zzzz are different readings
*/
var express = require('express');           // include the express library
var fs = require('fs');
var server = express();                     // create a server using express
server.use('/',express.static('public'));   // set a static file directory


function log(request, response) {
  var newData = request.query.readings.replace(/;/g, '\n');

  fs.appendFile('data.csv', newData, confirmSave);
  response.end('logged your data, thanks');
}

function confirmSave(error) {
  if (error) throw error;
  console.log('Saved to file');
}

server.listen(8080);                                 // listen for HTTP
server.get('/data', log);
