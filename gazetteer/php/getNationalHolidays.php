<?php
header("Content-Type: application/json");
$countrycode = $_GET['countrycode'];
$url = "https://date.nager.at/api/v3/PublicHolidays/2023/{$countrycode}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

if(curl_error($ch)) {
    echo json_encode(array("error" => curl_error($ch)));
} else {
    echo $response;
}

curl_close($ch);
?>
