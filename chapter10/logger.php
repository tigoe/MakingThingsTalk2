<?php
// name of the file on the server 
// where you want to save stuff:
$dataFile = 'datalog.txt';

// see if the client uploaded a file:
if (isset($_FILES)) {
   // put the file parameters in variables:
   $fileName = $_FILES['file']['name'];         // what the client called it
   $fileTempName = $_FILES['file']['tmp_name']; // where the server's keeping it now
   $fileType = $_FILES['file']['type'];         // what type of file it is
 
    //make sure the uploaded file is not empty:
     if (file_exists($fileTempName)) {
      // get the contents of the uploaded file:
      $newData = file_get_contents($fileTempName);
      // Open the existing file to get existing content
      $currentData = file_get_contents($dataFile);
      // Add a new person to the file
      $currentData .= $newData;
      // Write everything back to the existing file
      file_put_contents($dataFile, $currentData);
   }
}
?>

<html>
   <body>
      <form action="logger.php" method="post"
         enctype="multipart/form-data">
         <label for="file">Filename:</label>
         <input type="file" name="file" id="file" /> 
         <br />
         <input type="submit" name="submit" value="Submit" />
      </form>   
   </body>
</html>