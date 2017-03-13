var express = require('express');
var server = new express();

function respond(request, response) {
 // console.log(request.headers);
 console.log("client address: " + request.remoteIp);
 console.log("server hostname: " + request.hostname);
 console.log("server IP address: " + request.ip);
  response.end("hello client!");
}

server.listen(8080);
server.get('/', respond);

//curl 'freegeoip.net/json'
