<?php
/*
    AIRNow Web Page Scraper
    Context: PHP
*/
    // Define variables:
    // url of the page with the air quality index data for New York City:
    $url = 
      'http://airnow.gov/index.cfm?action=airnow.showlocal&cityid=164'; 
      
    // whether you should check for a value 
    // on the line you're reading:
    $checkForValue = false;

    // value of the Air Quality reading:
     $airQuality = -1;
    // open the file at the URL for reading:
    $filePath = fopen ($url, "r");
    
    // as long as you haven't reached the end of the file:
    while (!feof($filePath))
    {
        // read one line at a time, and strip all HTML and
        // PHP tags from the line:
        $line = fgetss($filePath, 4096);
		// if the current line contains the substring "Current Conditions"
        // then the next line with an integer is the air quality:
        if (preg_match('/Current Conditions/', $line)) {
           $checkForValue = true;
        }
        
         if ($checkForValue == true && (int)$line > 0){
        	$airQuality = (int)$line;
        	$checkForValue = false;
        }
    }
    
    echo "Air Quality:". $airQuality;
    // close the file at the URL, you're done: 
    fclose($filePath);
?>
