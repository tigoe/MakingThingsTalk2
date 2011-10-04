<?php
/*
   RESTful reader
   Context: PHP
*/

// split the URI string into tokens:
$tokens = explode("/", $_SERVER['REQUEST_URI']);


 foreach($tokens as $item) {
 	echo "Item: ";
 	echo $item."<br>";
 }

?>