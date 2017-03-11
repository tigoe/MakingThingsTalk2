/*
  Reader page script
  context: p5.js
*/
var userField, challengeField;  // fields for username and challenge phrase
var responseDiv;                // div for responses from the server

function setup() {
  noCanvas();    // no drawing, so no canvas needed
  // create the response div:
  responseDiv = createDiv('Enter your username and challenge phrase \
   to write to the tag.');
  responseDiv.position(10, 130);

  var userLabel = createSpan('Username');     // create user field label
  userLabel.position(10, 10);
  userField = createInput('','text');         // create user field
  userField.position(100, 10);
  var challengeLabel = createSpan('Phrase');  // create challenge field label
  challengeLabel.position(10, 40);
  challengeField = createInput('','password');// create challenge field
  challengeField.position(100, 40);
	var readButton = createButton('Verify tag');// create read button
	readButton.position(120, 70);
	readButton.id("readTag");
	readButton.touchEnded(submit);
}

function submit(event) {
  var route = '/' + event.target.id;    // get the ID of the button pressed
  var data = {                    // create the body of the POST request
    'user' : userField.value(),
    'challenge' : challengeField.value()
  };
  // change the response div in case the user hasn't touched a tag:
  responseDiv.html('Touch a tag to the reader.<br>')
  httpPost(route, data, 'text', getResponse);  // make the POST request
}

function getResponse(data) {      // callback from the POST request
  responseDiv.html(data);          // put the response in the div
}
