<?php

$lat = $_GET['lat'];
$lng = $_GET['lng'];

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat=$lat&lon=$lng&exclude=current,minutely,hourly,alerts&APPID=4264d96a45968735df7a8073aa680813",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "GET",
));

$response = curl_exec($curl);

curl_close($curl);

echo $response;

?>
