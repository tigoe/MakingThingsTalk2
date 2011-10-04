<?php
/*  Simple file reader/writer
	Context: PHP
	
	Created 30 Sep 2011
	by Tom Igoe and Gabriella Levine
	
	This script takes a HTTP request and either reads from
	or writes to a file on the server.
	If the HTTP request contains a parameter called data,
	then the value of that parameter is appended to
	the end of the file on the server.
	If there's no data parameter, then the file is
	printed out to the client as is.
	
	You must make a file called datalog.txt in the same directory
	as this script beforehand in order for it to work.
*/


// put the name and path of the text file in a variable.
// this is the text file where we'll store the data:
$filename = 'datalog.txt';

//make sure the file is not empty:
if (file_exists($filename)) {
	// get the contents of the file
	// and put them in a variable called $fileContents:
	$fileContents = file_get_contents($filename);
	
	// if there is new data from the client, it'll 
	// be in a request parameter called "data".
	if (isset($_REQUEST['data'])) {
		// append what the client sent as 'data' to
		// the variable holding the file contents:
		$fileContents = $fileContents . "\n". $_REQUEST['data'];
		// put the file contents back into the file
		// you're overwriting the whole file when you do this:
		file_put_contents($filename, $fileContents);
	} else {
		// there was no data sent in the request
		// so show the old stuff:
		echo $fileContents;
	}
}
?>

