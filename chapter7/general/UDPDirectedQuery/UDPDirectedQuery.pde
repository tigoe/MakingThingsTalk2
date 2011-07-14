/*
  UDP directed or broadcast query sender/receiver
 Context: Processing
 */

// import the UDP library:
import hypermedia.net.*;

UDP udp;      // initialize the UDP object

void setup() {
  udp = new UDP( this, 43770 );  // open a UDP port
  udp.listen( true );            //  listen for incoming messages
}

void draw()
{
}


void keyPressed() {
  int port = 43770;		             // the destination port
  String message = ", I'm talking to YOU!";  // the message to send
  String ip = "255.255.255.255";             // the remote IP address

  // send to different addresses depending on which key is pressed:
  switch (key) {
  case 'a':                      // broadcast query
    message = "Calling all ducks!\n";
    break;
  case 'b':                     // directed query
    ip = "192.168.1.20";        // the remote IP address
    message =  ip + message;    // the message to send
    break;
  case 'c':                     // directed query
    ip = "192.168.1.30";        // the remote IP address
    message =  ip + message;    // the message to send
    break;
  }

  // send the message to the chosen address:
  udp.send(message, ip, port );
}


void receive( byte[] data ) { 	
  // print the incoming data bytes as ASCII characters:
  for(int thisChar=0; thisChar < data.length; thisChar++) {
    print(char(data[thisChar]));
  }
  println();
}

