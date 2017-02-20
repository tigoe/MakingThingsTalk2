var mifare = require('mifare-classic');    // require mifare-classic

mifare.format(function(error) {           // format tag
    if (error) {                          // if there's an error,
        console.log("Format failed ");    // report the error
        console.log(error);
    } else {                              // if the format works out OK
        console.log("Tag formatted OK");  // report that
    }
});
