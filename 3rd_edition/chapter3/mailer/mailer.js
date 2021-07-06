/*
mailer script
context: node.js
*/
// include the nodemailer library:
var nodemailer = require('nodemailer');

// define your account and mail server:
var account = {
  host: 'imap.dreamhost.com',
  port: 465,
  secure: true,
  auth: {
    user: 'your.mail@dreamhost.com',
    pass: 'your_password'
  }
}

// define the message:
var message = {
  from: account.auth.user,
  to: 'recipient@gmail.com',
  subject: 'Hello',
  text: 'Hello world',
};

// make a callback function to respond when the mail is sent:
function confirm(error, info){
  if(error){
    console.log(error);
  } else {
    console.log('Message sent: ' + info.response);
  }
}

// make a client and use it to send the message:
var client = nodemailer.createTransport(account);
client.sendMail(message, confirm);
