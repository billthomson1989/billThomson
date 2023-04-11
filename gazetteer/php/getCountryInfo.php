<?php

// Retrieve the country code from the query string
$country_code = $_GET['country_code'];

// Construct the API URL using the country code
$url = "https://restcountries.com/v2/alpha/$country_code";

// Initialize cURL
$ch = curl_init();

// Set the URL and options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the cURL request and retrieve the response
$response = curl_exec($ch);

// Check for errors
if (!curl_errno($ch)) {
    $info = curl_getinfo($ch);
    if ($info['http_code'] == 200) {
        // Return the response to the client
        echo $response;
    } else {
        echo "Error: HTTP response code " . $info['http_code'];
    }
} else {
    echo "Error: cURL error number " . curl_errno($ch);
}

// Close the cURL session
curl_close($ch);

?>