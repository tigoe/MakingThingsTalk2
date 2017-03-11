
var userField, challengeField, responseDiv;

function setup() {
  noCanvas();
  responseDiv = createDiv('Enter your username and challenge phrase to write to the tag.');
  responseDiv.position(10, 130);
  var userLabel = createSpan('Username');
  userLabel.position(10, 10);
  userField = createInput('','text');
  userField.position(100, 10);
  var challengeLabel = createSpan('Phrase');
  challengeLabel.position(10, 40);
  challengeField = createInput('','password');
  challengeField.position(100, 40);
  readButton = createButton('Verify tag')
  readButton.position(120, 70);
  readButton.id("readTag");
  readButton.mouseReleased(submit);
}
function submit(event) {
  var route = event.target.id;
  var data = {
    'user' : userField.value(),
    'challenge' : challengeField.value()
  };
  responseDiv.html('Touch a tag to the reader.<br>')
  httpPost(route, data, 'text', getResponse);
}

function showAdminControls() {
  var writeButton = createButton('Write to tag')
  writeButton.position(10, 70);
  writeButton.id("writeTag");
  writeButton.mouseReleased(submit);
  var formatButton = createButton('Format tag')
  formatButton.position(10, 100);
  formatButton.id("formatTag");
  formatButton.mouseReleased(submit);
}

function getResponse(data) {
  responseDiv.html(data);
  if (data.includes('correct response')) {
    showAdminControls();
  }
}
