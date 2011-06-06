<?php
/*
IP geocoder
 Language: PHP
 
 Uses a client's IP address to get a latitude and longitude. 
 Uses the client's user agent to format the response.

*/
// initialize variables:
    $lat = 0;
    $long = 0;
    $country = "unknown";

    // Check to see what type of client this is:
    $userAgent  = getenv('HTTP_USER_AGENT');
    // Get the client's IP address:
    $ipAddress = getenv('REMOTE_ADDR');    

    // use http://www.hostIP.info to get the latitude and longitude
    // from the IP address.  First, format the HTTP request string:
    $IpLocatorUrl = "http://api.hostip.info/?&position=true&ip=";
   // add the IP address:
    $IpLocatorUrl .= $ipAddress;
    
    // make the HTTP request:
    $filePath = fopen($IpLocatorUrl, "r");
    
    // as long as you haven't reached the end of the incoming text:
    while (!feof($filePath)) {
        // read one line at a time
        $line = fgets($filePath, 4096);
       // if the line contains the coordinates, then you want it:
        if (preg_match('/<gml:coordinates>/', $line)) {
     		$position = strip_tags($line);			// strip the XML tags
     		$position = trim($position);			// trim the whitespace
     		$coordinates = explode(",",$position);	// split on the comma
     		$lat = $coordinates[0];
     		$long = $coordinates[1];
        }       
    }
    // close the connection:
    fclose($filePath);
    
    // decide on the output based on the client type:
    switch ($userAgent) {
        case "lantronix": 
            // Lantronix device wants a nice short answer:
            echo "<$lat,$long,$country>\n";
            break;
        case "processing":
            // Processing does well with lines:
            echo "Latitude:$lat\nLongitude:$long\nCountry:$country\n\n";
            break;
        default:
            // other clients can take a long answer:        
            echo <<<END
<html>
<head></head> 

<body>
    <h2>Where You Are:</h2>
        Your country: $country<br>
        Your IP: $ipAddress<br>
        Latitude: $lat<br>
        Longitude: $long<br>
</body>
</html>
END;
    }
?>