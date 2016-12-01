/*
HTTP/HTTPS server
context: node.js

/ to create keys for self-signing: https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs

to properly sign:
https://certbot.eff.org

*/
// include libraries and declare global variables:
var express = require('express');	// include the express library
var https = require('https');     // require the HTTPS library
var http = require('http');       // require the HTTP library
var fs = require('fs');           // require the filesystem library
var server = express();					  // create a server using express

var options = {                             // options for the HTTPS server
  key: fs.readFileSync('./keys/domain.key'),   // the key
  cert: fs.readFileSync('./keys/domain.crt') // the certificate
};

server.use('/',express.static('public'));   // set a static file directory

function redirect(request,response){
    response.redirect('https://' + request.hostname + request.url)
}

// start the server:
https.createServer(options, server).listen(443);  // listen for HTTPS
http.createServer(server).listen(8080);           // listen for HTTP
http.get('*', redirect);
