<?php

// Get the latitude, longitude, and username from the query string
$lat = $_GET['lat'];
$lng = $_GET['lng'];
$username = $_GET['username'];

// Form the API endpoint URL using the query string parameters
$url = "http://api.geonames.org/countryCodeJSON?lat=$lat&lng=$lng&username=$username";

// Send a GET request to the API endpoint
$response = file_get_contents($url);

// Return the response from the API
echo $response;

?>