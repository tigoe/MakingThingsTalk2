<?php
/*
   Mail sender
   Context: PHP

   Sends an email if sensorValue is above a threshold value.
*/
   // form the message:
   $to = "you@example.com";
   $subject = "the cat";
   $message = "The cat is on the mat at http://www.example.com/catcam.";
   $from = "cat@example.com";
      
   // send the mail:
   mail($to, $subject, $message, "From: $from");
   // reply to processing:
   echo "TO: " .$to;
   echo "\nFROM: " .$from;
   echo "\nSUBJECT:" .$subject;
   echo "\n\n" .$message . "\n\n";   
?>