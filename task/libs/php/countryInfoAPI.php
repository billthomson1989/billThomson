<?php
header('Content-Type: application/json');
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$searchTerm = $_REQUEST["countryName"];
$url = "http://api.geonames.org/countryInfo?username=billthomson1989&type=json";
$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$decoded = json_decode($result, true);
$filtered = array();

foreach($decoded["geonames"] as $item){
    if(strtolower($item["countryName"]) == strtolower($searchTerm)){
        $filtered[] = $item;
    }
}

echo json_encode($filtered);
