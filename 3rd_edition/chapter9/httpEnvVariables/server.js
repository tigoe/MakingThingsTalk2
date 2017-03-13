var express = require('express');
var server = new express();

function respond(request, response) {
 // console.log(request.headers);
 console.log(request.rempoteIp); 
 console.log(request.hostname);
 console.log(request.ip);
 console.log(request.xhr);
  response.end("hello client!");
}

server.listen(8080);
server.get('/', respond);

//curl 'freegeoip.net/json'
