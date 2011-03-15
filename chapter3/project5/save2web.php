<?php
if (isset($_FILES)) {
    // put the file parameters in variables:
    $fileName =  $_FILES[‘file’][‘name’];
    $fileTempName = $_FILES[‘file’][‘tmp_name’];
    $fileType = $_FILES[‘file’][‘type’];
    $fileSize = $_FILES[‘file’][‘size’];
    $fileError = $_FILES[‘file’][‘error’];
    
    // if the file is a JPEG and under 100K, proceed:
    if (($fileType == "image/jpeg") && ($fileSize < 100000)){
        // if there’s a file error, print it:
        if ( $fileError > 0){
            echo "Return Code: " . $fileError . "<br />";
        }
        // if there’s no file error, print some HTML about the file:
         else {
            echo "Upload: " . $fileName . "<br />";
            echo "Type: " . $fileType . "<br />";
            echo "Size: " . ($fileSize / 1024) . " Kb<br />";
            echo "Temp file: " . $fileTempName . "<br />";
            
            // if the file already exists,
            // delete the previous version:
            if (file_exists($fileName)) {
                unlink($fileName);
            }
            // move the file from the temp location to
            // this directory:
            move_uploaded_file($fileTempName, $fileName);
            echo "Uploaded file stored as: ".$fileName;
        }
    } 
    // if the file’s not a JPEG or too big, say so:
    else {  
        echo "File is not a JPEG or too big.";
    }
}  
?>

<html>
<body>

<form action="save2web.php" method="post"
enctype="multipart/form-data">
<label for="file">Filename:</label>
<input type="file" name="file" id="file" /> 
<br />
<input type="submit" name="submit" value="Upload" />
</form>

</body>
</html>