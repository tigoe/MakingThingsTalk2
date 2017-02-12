var ndef = require('ndef'),           // require ndef package
mifare = require('mifare-classic');   // require mifare-classic package
mifare.read(function(error, buffer) { // read tag
  if (error) {                        // if there's an error result
    console.log("Read failed ");      // let user know about the error
    console.log(error);
  } else {                            // you got an NDEF message
    // decode the message into a JSON object:
    var message = ndef.decodeMessage(buffer.toJSON());
    // print the message's records:
    console.log("Found NDEF message with " + message.length +
    // add "record" if there's only one, "records" if there's more:
    (message.length === 1 ? " record" : " records" ));
    // print the message:
    console.log(ndef.stringify(message));
  }
});
