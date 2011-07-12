<?php
/*
   Age checker
   Context: PHP

   Expects two parameters from the HTTP request: 
      name (a text string)
      age (an integer)
   Prints a personalized greeting based on the name and age.
*/

// read all the parameters and assign them to local variables:
foreach ($_REQUEST as $key => $value)
   {
      if ($key == "name") {
          $name = $value;
      }
      
      if ($key == "age") {
          $age = $value;
      }
   }

if (isset($name) && isset($age) ) {
    if ($age < 21) {
        echo “<p> $name, You’re not old enough to drink.</p>\n”;
    } else {
        echo “<p> Hi $name. You’re old enough to have a drink, but do “;
        echo “so responsibly.</p>\n”;
    }
}
?>

<html>
<body>

<form action=”age_checker.php” method=”post”
enctype=”application/x-www-form-urlencoded”>
First name: <input type=”text” name=”name” /><br>
Last name: <input type=”age” name=”age” />
<input type=”submit” value=”Submit” />
</form>

</body>
</html>