<?php
$country_code = $_GET['country_code'];
$api_key = "dfaf4e7ba9mshff70955459ecf6bp18bd2bjsn4976c478a896";

$options = [
  "http" => [
    "method" => "GET",
    "header" => [
      "X-RapidAPI-Key: $api_key"
    ]
  ]
];
$context = stream_context_create($options);
$data = file_get_contents("https://covid-193.p.rapidapi.com/statistics?", false, $context);
print_r($data);

/*$country_code = $_GET['country_code'];
$api_key = "dfaf4e7ba9mshff70955459ecf6bp18bd2bjsn4976c478a896";

$options = [
  "http" => [
    "method" => "GET",
    "header" => [
      "X-RapidAPI-Key: $api_key"
    ]
  ]
];
$context = stream_context_create($options);
$data = file_get_contents("https://covid-193.p.rapidapi.com/statistics?country=$country_code", false, $context);
print_r($data);*/


?>