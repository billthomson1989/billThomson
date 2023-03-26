<?php

// Include the configuration file
require_once 'config.php';

$east = $_GET['east'];
$west = $_GET['west'];
$north = $_GET['north'];
$south = $_GET['south'];
$username = $config['username'];

// API endpoint
$url = "http://api.geonames.org/wikipediaBoundingBoxJSON?north=$north&south=$south&east=$east&west=$west&username=$username";

// Initialize cURL session
$ch = curl_init();

// Set the URL
curl_setopt($ch, CURLOPT_URL, $url);

// Return the response as a string instead of printing it to the screen
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// Execute the cURL request
$response = curl_exec($ch);

// Close the cURL session
curl_close($ch);

// Return the response
echo $response;

?>

