/*
Express-based webSocket Server
context: node.js
*/

// Include libraries:
var express = require('express');           // the express library
var http = require('http');                 // the http library
var WebSocketServer = require('ws').Server; // the ws library's Server class

var server = express();                     // the express server
var httpServer = http.createServer(server); // an http server
var wss = new WebSocketServer({ server: httpServer}); // a websocket server


// define the webSocket connection callback function:
function connectClient(newClient, request) {
  // print the client's address:
  console.log(request.connection.remoteAddress);
  // when a webSocket message comes in from this client:
  function readMessage(data) {
    console.log(data);               // print the message
  }

  // if there's a webSocket error:
  function readError(error){
    console.log(error);
  }

  // when a client disconnects from a webSocket:
  function disconnect() {
    console.log('Client disconnected');
  }

  // set up event listeners:
  newClient.on('message', readMessage);
  newClient.on('error', readError);
  newClient.on('close', disconnect);

  // when a new client connects, send the greeting message:
  var greeting = {"client": wss.clients.size};
  newClient.send(JSON.stringify(greeting));
}

// broadcast data to connected webSocket clients:
function broadcast(thisClient, data) {
  function sendToAll(client) {
    if (client !== thisClient) {
      console.log('broadcasting from:' + client.clientName);
      client.send(JSON.stringify(data));
    }
  }
  // run the sendToAll function on each element of wss.clients:
  wss.clients.forEach(sendToAll);
}

// start the servers:
httpServer.listen(8080);                // listen for http connections
wss.on('connection', connectClient);    // listen for webSocket messages
