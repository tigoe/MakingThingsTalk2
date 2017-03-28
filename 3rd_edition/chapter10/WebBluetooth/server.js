var express = require('express');           // include the express library
var server = express();                     // create a server using express
server.use('/',express.static('public'));   // set a static file directory

// start the server:
server.listen(8080);
