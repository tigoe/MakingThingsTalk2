/*
  Video server
*/

// include necessary libraries
// set global variables
//    establish an array to keep track of incoming clients

// listen for clients
// if a client connects via webSocket
//    add it to the client list
//    save its identifying characteristics

// if a client makes a request for HTML assets, send them

// if a client sends a message
//    if it's a play/pause message, play/pause
//    if it's a numeric value,
//        constrain it to a range from 0 -100
//        use it as a percentage of video length
//        set the video position to the calculated position
//    display the name of the client that sent this message

// if a client disconnects
//    delete it from the client Array
