/*
  RGB Web  Server
 Context: Arduino
 
 */

#include <SPI.h>
#include <Ethernet.h>

EthernetServer server(80);

byte mac[] = {  
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);
IPAddress ip(192,168,1,20);


// Initialize the Ethernet server library
// with the IP address and port you want to use 
// (port 80 is default for HTTP):


void setup()
{
  // start the Ethernet connection and the server:
  Ethernet.begin(mac, ip, gateway, subnet);
  server.begin();
  Serial.begin(9600);
}

void loop()
{
  // listen for incoming clients
  EthernetClient client = server.available();
  if (client) {
    Serial.println("Got a client");
    int lineLength = 0;    // length of the incoming text line

    while (client.connected()) {
      if (client.available()) {
        // read in a byte and send it serially:
        char thisChar = client.read();
        Serial.write(thisChar);
        // if you get a linefeed and the request line is blank,
        // then the request is over:
        if (thisChar == '\n' && lineLength < 1) {
          // send a standard http response header
          makeResponse(client);
          break;
        }
        //if you get a newline or carriage return,
        // you're at the end of a line:
        if (thisChar == '\n' || thisChar == '\r') {
          lineLength = 0;
        } 
        else {
          // for any other character, increment the line length:
          lineLength++;
        }
      }    
    }
    Serial.println("Breaking");
    // give the web browser time to receive the data
    delay(1);
    // close the connection:
    client.stop();
  }
}


void makeResponse(EthernetClient thisClient) {
  thisClient.print("HTTP/1.1 200 OK\n");
  thisClient.print("Content-Type: text/html\n\n");
  thisClient.print("<html><head><meta http-equiv=\"refresh\" content=\"3\">");
  thisClient.print("<title>Hello from Arduino</title></head>");
  // set up the body background color tag:
  thisClient.print("<body bgcolor=#");
  // read and the three analog sensors:
  int red = analogRead(A0)/4;
  int green = analogRead(A1)/4;
  int blue = analogRead(A2)/4;
  // print them as one hexadecimal string:
  thisClient.print(red, HEX);
  thisClient.print(green, HEX);
  thisClient.print(blue, HEX);
  // close the tag:
  thisClient.print(">");
  // now print the color in the body of the HTML page:
  thisClient.print("The color of the light on the Arduino is #");
  thisClient.print(red, HEX);
  thisClient.print(green, HEX);
  thisClient.println(blue, HEX);
  // close the page:
  thisClient.println("</body></html>\n");
}





















