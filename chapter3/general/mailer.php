<?
/*
   mailer
   Language: PHP

   sends an email.
*/

// set up your variables for mailing. Change to and from
// to your mail address:
$to = “you@example.com”;
$subject = “Hello world!”;
$from = “From: you@example.com”;
$message = “Hi there, how are you?”;

// send the mail:
mail($to, $subject, $message, $from);

// give notification in the browser:
echo “I mailed “ . $to . “<br>”;
echo $from . “<br>”;
echo $subject. “<br><br>”;
echo $message;
?>