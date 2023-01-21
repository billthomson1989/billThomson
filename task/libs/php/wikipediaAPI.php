<?php
header('Content-Type: application/json');
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$searchTerm = $_REQUEST["searchTerm"];
$url = "http://api.geonames.org/wikipediaSearch?q=$searchTerm&maxRows=10&username=billthomson1989&type=json";

$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$decoded = json_decode($result, true);

echo json_encode($decoded);

