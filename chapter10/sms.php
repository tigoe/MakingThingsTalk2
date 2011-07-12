<?php
/*
    SMS messenger
    Context: PHP
*/
   $phoneNumber = $_REQUEST["phoneNumber"];    // get the phone number 
   $carrier   = $_REQUEST["carrier"];          // get the carrier 
   $message   = $_REQUEST["message"];          // get the message 
   $recipient = $phoneNumber."@".$carrier;     // compose the recipient
   $subject = "Message for you";
   
    // if all the fields are filled in, send a message:
    if (isset($phoneNumber)&& isset($carrier) && isset($message)) {                
       mail($recipient, $subject, $message);
    }
?>

<html>
<head></head> 
<body>
   <h2>SMS Messenger</h2>
   <form name="txter" action="sms.php" method="post">
      
      Phone number: <input type="text" name="phoneNumber"
      size="15" maxlength="15"><br>
      Message:<br> 
      <textarea name="message" rows="5" cols="30" maxlength="140">
Put your sms message here (140 characters max.)
      </textarea>
      </br>
      Carrier:
      <select name="carrier">         
         <option value="txt.att.net">AT&T US</option>
         <option value="txt.bellmobility.ca">Bell Canada</option>
         <option value="messaging.nextel.com">Nextel US</option>
         <option value="messaging.sprintpcs.com US">Sprint</option>
         <option value="bluewin.ch">Swisscom</option>
         <option value="sms.t-mobile.at">T-Mobile Austria</option>
         <option value="t-d1-sms.de">T-Mobile Germany</option>
         <option value="t-mobile.uk.net">T-Mobile UK</option>
         <option value="tmomail.net">T-Mobile US</option>
         <option value="gsm1800.telia.dk">Telia Denmark</option>
         <option value="mobilpost.no">Telenor Norway</option>
         <option value="vtext.com">Verizon</option>
         <option value="vmobl.com">Virgin Mobile US</option>            
      </select>
      
      <input type="submit" value="send message">     
   </form>
</body>
</html>