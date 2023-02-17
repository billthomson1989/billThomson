<?php

$curl = curl_init();

$countryName = $_GET['countryName'];
if ($countryName == "United Kingdom") {
  $countryName = "UK";
} else if ($countryName == "United States") {
  $countryName = "USA";
}

curl_setopt_array($curl, [
    CURLOPT_URL => "https://covid-193.p.rapidapi.com/statistics?country=".urlencode($countryName),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => [
        "X-RapidAPI-Host: covid-193.p.rapidapi.com",
        "X-RapidAPI-Key: dfaf4e7ba9mshff70955459ecf6bp18bd2bjsn4976c478a896"
    ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
    echo json_encode("cURL Error #:" . $err);
} else {
    echo $response;
}


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

/*$curl = curl_init();

curl_setopt_array($curl, [
	CURLOPT_URL => "https://covid-193.p.rapidapi.com/statistics",
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		"X-RapidAPI-Host: covid-193.p.rapidapi.com",
		"X-RapidAPI-Key: dfaf4e7ba9mshff70955459ecf6bp18bd2bjsn4976c478a896"
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
	echo "cURL Error #:" . $err;
} else {
	echo $response;
}


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

