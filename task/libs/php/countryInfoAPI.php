<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$url = "http://api.geonames.org/countryInfoJSON?formatted=true&lang=it&country=DE&username=billthomson1989";
<<<<<<< HEAD

=======
 
>>>>>>> 1042dbd224e5accf92dc80fa478a71411b21469c
$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);
<<<<<<< HEAD

=======
 
>>>>>>> 1042dbd224e5accf92dc80fa478a71411b21469c
$decode = json_decode($result, true);
echo json_encode($decode);
