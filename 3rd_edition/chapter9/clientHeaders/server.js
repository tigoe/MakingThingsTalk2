/*
server, showing client headers
context: node.js
*/

var express = require('express');    // include express
var server = new express();          // make an instance of it

// GET response listener callback function:
function respond(request, response) {
  console.log(request.headers);
  console.log("server hostname: " + request.hostname);
  console.log("client IP address: " + request.ip);
  response.end("hello client!");
}

server.listen(8080);        // start the server on port 8080
server.get('/', respond);   // listener for GET requests

//curl 'freegeoip.net/json'
//
//
// { host: '104.236.102.241:8080',
// connection: 'keep-alive',
// 'cache-control': 'max-age=0',
// 'upgrade-insecure-requests': '1',
// 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
// accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
// 'accept-encoding': 'gzip, deflate, sdch',
// 'accept-language': 'en-US,en;q=0.8' }
// server hostname: 104.236.102.241
// client IP address: ::ffff:216.165.95.78
