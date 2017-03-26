/*
  HTTPS client for Twilio SMS API
  context: node.js
  You also need to create twilioCreds.js, which looks like this:

  module.exports = {
    apiKey: 'Axxxxx', // Twilio API key
    auth: '1xxx'      // Twilio API auth
  }
*/

var https = require('https');             // include https library
var querystring = require('querystring'); // include querystring library
var creds = require('./twilioCreds.js');  // your Twilio credentials

var message = {         // the SMS message you plan to send
  To:'+19177532699',
  From:'+16467831513',
  Body:'Hi There!'
}
// convert message to HTTP-style query string:
var postData = querystring.stringify(message);

// the HTTPS request options:
var options = {
  host: 'api.twilio.com',
  auth: creds.apiKey + ':' + creds.auth,
  port: 443,
  path: '/2010-04-01/Accounts/' + creds.apiKey + '/Messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
};

// request callback function:
function confirm(response) {
  var result = '';		// string to hold the response

  function gather (data) {  // response 'data' callback function
    result += data;
  }

  function printResult () { // response 'end' callback function
    console.log(result);
  }

  response.on('data', gather);    // add each chunk to the result string
  response.on('end',printResult); // print result when done
}

// make the actual request:
var request = https.request(options, confirm);	// start it
request.write(postData);							          // send the data
request.end();												          // end it and send it
