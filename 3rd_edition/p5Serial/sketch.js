var serial; // variable to hold an instance of the serialport library
var locH, locV;   // ball position
var sensorValues;

function setup() {
  createCanvas(windowWidth, windowHeight);
  serial = new p5.SerialPort();
  serial.on('list', printList);          // serial listeners
  serial.on('data', serialEvent);
	serial.list();                         // list the serial ports
	serial.open("/dev/cu.usbmodem1421");  // open a port
}

function draw() {
  background("#2307AF");
	fill(255);
	ellipse(locH, locV, 50, 50);
  text(locH + "," + locV, 20, 20);
}

// get the list of ports:
function printList(portList) {
 for (var i = 0; i < portList.length; i++) {
	// Display the list the console:
 	println(i + " " + portList[i]);
 }
}

function serialEvent() {
	var inString = serial.readLine();          // read serial input until \r\n
	if (inString.length > 0) {                 // if there's a line there
		sensorValues = split(inString, ",");     // split on the commas
    var x = Number(sensorValues[0]);         // convert to number
    var y = Number(sensorValues[1]);
    locH = round(map(x, -2, 2, 0, width));   // map and round to integer
    locV = round(map(y, -2, 2, 0, height));
  }
}
