
var userField, challengeField, responseDiv, writeButton;

function setup() {
  noCanvas();
  responseDiv = createDiv('Enter your username and challenge phrase to write to the tag.');
  responseDiv.position(10, 10);
  var userLabel = createSpan('Username');
  userLabel.position(10, 140);
  userField = createInput('','text');
  userField.position(100, 140);
  var challengeLabel = createSpan('Phrase');
  challengeLabel.position(10, 170);
  challengeField = createInput('','password');
  challengeField.position(100, 170);
  writeButton = createButton('Write to tag')
  writeButton.position(10, 210);
  writeButton.mouseReleased(submitWrite);
  readButton = createButton('Verify tag')
  readButton.position(120, 210);
  readButton.mouseReleased(submitRead);
}

function submitWrite() {
  responseDiv.html('Now touch a tag to the reader.<br>')
  httpPost('writeTag', getResponse);
}

function submitRead() {
  var data = {
    'user' : userField.value(),
    'challenge' : challengeField.value()
  };
  responseDiv.html('Now touch a tag to the reader.<br>')
  httpPost('readTag', data, 'text', getResponse);
}

function getResponse(data) {
  responseDiv.html(data);
}
