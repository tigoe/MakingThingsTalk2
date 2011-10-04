<?php
/*
   RESTful reader 2
   Context: PHP
*/

// split the URI string into a list:
$parameters = explode("/", $_SERVER['REQUEST_URI']);

$position = array_search('distance', $parameters); 
if ($position) {
   $distance = $parameters[$position+1];
   echo "Your distance: ".$distance."<br />";
}


$position = array_search('time', $parameters); 
if ($position) {
   $time = $parameters[$position+1];
   echo "Your time: ".$time."<br />";
}

?>