
/*
 HostIP geolocating Web Client
 Prints the location to an LCD display
 
 Context: Arduino
 */
#include <SPI.h>
#include <Ethernet.h>
#include <TextFinder.h>
#include <LiquidCrystal.h>

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x02 };
IPAddress ip(192,168,1,20);               // will only be used if DHCP fails
char serverName[] = "api.hostip.info";    // HostIP's API URL
EthernetClient client;                            // the client connection

float latitude = 0.0;                     // the latitude returned from HostIP
float longitude = 0.0;                    // the longitude returned from HostIP

long lastRequestTime = 0;       // last time you connected to the server, in milliseconds
int requestDelay = 10 * 1000;   // time between HTTP requests

// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(9,8, 5, 4, 3, 2);
const int screenWidth = 16;         // width of the LCD in characters


void setup() {
  // start the serial library:
  Serial.begin(9600);
  // attempt to connect by DHCP:
  if (!Ethernet.begin(mac)) {
    // start the Ethernet connection manually:
    Ethernet.begin(mac, ip);
  } 
  // if you get an address via DHCP, update the ip variable:
  else {
    ip = Ethernet.localIP(); 
  }

  // give the Ethernet module two seconds to initialize:
  delay(2000);
  // make an initial connection attempt:
  connectToServer();
  
   // set up the LCD's number of columns and rows: 
  lcd.begin(screenWidth,2);
  
}

void loop() {
      // if you're connected to the server:
  if (client.connected() ) {
    // if there are bytes available from the server:
    if (client.available()) {
      // make an instance of TextFinder to search the response:
      TextFinder response(client);
      // see if the response from the server contains <gml:coordinates>:
      if (response.find("<gml:coordinates>")) {
       // get the lat and long that follow:
        longitude = response.getFloat();
        latitude = response.getFloat();

        // print the latitude and longitude, 
       // precise to 4 decimal places:
        lcd.clear();              
        lcd.print("My location:");
        lcd.setCursor(0,1);
        lcd.print(latitude, 4);
        lcd.print(",");
        lcd.print(longitude,4);
        // stop the client, and close the connection:
        client.stop();
      }
    }
  } 
  else {
    if (millis() - lastRequestTime > requestDelay) {
      // if you're not connected, and two minutes have passed since
      // your last connection, then attempt to connect again:
      connectToServer();
    } 
  }
}

// this method connects to the server
// and makes a HTTP request:

void connectToServer() {
  // if you're still connected to the server,
  // disconnect for a new request:
  if (client.connected()) {
    client.stop();
  }
  // attempt to connect:
  Serial.println("connecting to server");
  if (client.connect(serverName, 80)) {
    Serial.println("making HTTP request");
    // make HTTP GET request:
    client.print("GET /?ip=");
    // send your IP address, properly formatted:
    for (int thisByte = 0; thisByte < 4; thisByte++){
      // print this octet of the IP address:
      client.print(ip[thisByte]);
      // if you're not on the last octet, print a dot:
      if (thisByte < 3) {
        client.print("."); 
      }
    }
    client.println(" HTTP/1.1");
    client.print("HOST:");
    client.println(serverName);
    client.println();
  }
  // note the time of this connect attempt:
  lastRequestTime = millis();
}
