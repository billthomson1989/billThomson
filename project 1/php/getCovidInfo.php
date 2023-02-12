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
$data = file_get_contents("https://covid-193.p.rapidapi.com/statistics", false, $context);
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


/* Retrieve the country code from the query string
$country_code = $_GET['country_code'];

// Set the API endpoint and headers
$endpoint = "https://covid-193.p.rapidapi.com/statistics?country=$country_code";
$headers = array(
  "X-RapidAPI-Host: covid-193.p.rapidapi.com",
  "X-RapidAPI-Key: dfaf4e7ba9mshff70955459ecf6bp18bd2bjsn4976c478a896"
);

// Initialize a cURL session
$ch = curl_init();

// Set the cURL options
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the cURL request and retrieve the response
$response = curl_exec($ch);

// Close the cURL session
curl_close($ch);

// Return the response to the client
echo $response;*/

?>

