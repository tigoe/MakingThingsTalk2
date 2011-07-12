<?php
/*
   Parameter reader
   Context: PHP

   Prints any parameters sent in using an HTTP GET command.
*/

// print out all the variables:
foreach ($_REQUEST as $key => $value)
   {
       echo "$key: $value<br>\n";
   }
?>