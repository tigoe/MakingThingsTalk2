var mifare = require('mifare-classic');    // require mifare-classic

function formatReport(error) {           // format tag
    if (error) {                          // if there's an error,
        console.log('Format failed: ' + error);    // report the error
    } else {                              // if the format works out OK
        console.log('Tag formatted OK');  // report that
    }
}
mifare.format(formatReport);
