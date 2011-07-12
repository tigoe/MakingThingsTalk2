/*
  UDP broadcast query sender/receiver
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
  String ip = "255.255.255.255";   // the remote IP address
  int port = 43770;		   // the destination port
  udp.send("Hello!\n", ip, port ); // the message to send
}

void receive( byte[] data ) { 	
  // print the incoming data bytes as ASCII characters:
  for(int thisChar=0; thisChar < data.length; thisChar++) {
    print(char(data[thisChar]));
  }
  println();
}

