<?php
<<<<<<< HEAD
header('Content-Type: application/json');
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$url = "http://api.geonames.org/wikipediaSearch?q=london&maxRows=10&username=billthomson1989&type=json";
=======

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$url = "http://api.geonames.org/wikipediaSearch?q=london&maxRows=10&username=billthomson1989";
>>>>>>> 1042dbd224e5accf92dc80fa478a71411b21469c

$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
<<<<<<< HEAD
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$decoded = json_decode($result, true);

echo json_encode($decoded);

=======

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);
 
$decode = json_decode($result, true);
echo json_encode($decode);
>>>>>>> 1042dbd224e5accf92dc80fa478a71411b21469c
