/*
  UDP Server
  context: node.js
*/

var express = require('express');           // include express
var server = express();					            // create a server using express
var dgram = require('dgram');               // include datagram library
var UDP_PORT = 8888;                        // the port on which to listen
var udpServer = dgram.createSocket('udp4'); // create UDP socket
var broadcastAddress = '192.168.0.255';     // broadcast address for this computer's subnet

serve static files from /public:
server.use('/',express.static('public'));

function udpBegin() {
  udpServer.setBroadcast(true);
  console.log('UDP Server started');
}

function readMessage(message, sender) {
  console.log(sender.address + ':' + sender.port +' sent: ' + message);
}

function serverResponse(request, response) {
  var message = request.params.message;
  var receiver = request.params.destination;
  udpServer.send(message, 0, data.length, UDP_PORT, receiver);
  response.end('Sent ' + message + ' to ' + receiver);
}

udpServer.bind(UDP_PORT);             // bset the UDP port number
udpServer.on('listening', udpBegin);  // start the UDP server
udpServer.on('message', readMessage); // runs when a UDP packet arrives
var data = "Hello";
// send a broadcast message:
udpServer.send(data, 0, data.length, UDP_PORT, broadcastAddress);

server.listen(8080);                    // start the HTTP server
server.get("/destination/:destination/msg/:message", serverResponse);
