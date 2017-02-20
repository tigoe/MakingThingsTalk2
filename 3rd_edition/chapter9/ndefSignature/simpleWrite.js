var ndef = require('ndef'),               // require ndef package
    mifare = require('mifare-classic'),   // require this package
    message,                              // an NDEF message
    bytes;                                // the bytes stream to write

message = [
    ndef.uriRecord("http://nfc-tools.org"),  // make a URI record
    ndef.textRecord("Hello from nodejs"), // make a text record
    ndef.emptyRecord()                    // make an empty record
];

bytes = ndef.encodeMessage(message);      // encode the record as a byte stream

mifare.write(bytes, function(error) {     // write function
    if (error) {                          // if there's an error,
        console.log("Write failed ");     // report the error
        console.log(error);
    } else {
        console.log("Tag written successfully");// report that tag was written
    }
});
