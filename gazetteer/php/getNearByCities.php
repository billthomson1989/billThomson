<?php

// Include the configuration file
require_once 'config.php';

$east = $_GET['east'];
$west = $_GET['west'];
$north = $_GET['north'];
$south = $_GET['south'];
$username = $config['username'];

// Construct the API URL using the bounding coordinates and the username
$url = "http://api.geonames.org/citiesJSON?north=$north&south=$south&east=$east&west=$west&username=$username";

// Initialize a curl session
$ch = curl_init();

// Set the URL for the curl session
curl_setopt($ch, CURLOPT_URL, $url);

// Set curl to return the response as a string, instead of outputting it directly
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the curl session
$response = curl_exec($ch);

// Close the curl session
curl_close($ch);

// Return the response to the client
echo $response;

?>
