/*
  CatCam uploader
 context: Processing
 */

// import libraries

void setup() {
  // initialize serial communications
  // take control of the camera
}

void draw() {
  // draw the camera image to the window
  // if there's any response from the server, print it
}

void serialEvent(Serial myPort) {
  //read serial data
  //if "cat on mat" event occurs:
  //  upload picture
  //  send mail

  //if cat remains on mat, upload picture
}

void sendMail() {
  // if enough time has passed since last email request:
  //   make an HTTP GET request to send an email
  //   note the time
}

void uploadPicture() {
  // if enough time has passed since last upload :
  //   take a picture
  //   make an HTTP POST request to upload the picture
  //   note the time
}