<?php

// Load the country borders data
$contents = file_get_contents('../data/countryBorders.geo.json');
$borders = json_decode($contents);

// Get the latitude, longitude, and username from the query string
$lat = $_GET['lat'];
$lng = $_GET['lng'];
$username = $_GET['username'];

// Check if the given latitude and longitude are within the borders of any country
$countryCode = null;
foreach ($borders->features as $feature) {
    $geometry = $feature->geometry;
    $type = $geometry->type;
    $coordinates = $geometry->coordinates;
    
    if ($type === "Polygon") {
        if (pointInPolygon($lat, $lng, $coordinates)) {
            $countryCode = $feature->properties->iso_a2;
            break;
        }
    } elseif ($type === "MultiPolygon") {
        foreach ($coordinates as $polygon) {
            if (pointInPolygon($lat, $lng, $polygon)) {
                $countryCode = $feature->properties->iso_a2;
                break 2;
            }
        }
    }
}

// If a country code was found, fetch the country information from the Geonames API
if ($countryCode) {
    $url = "http://api.geonames.org/countryInfoJSON?country=$countryCode&username=$username";
    $response = file_get_contents($url);
    echo $response;
} else {
    // Return an error message if the latitude and longitude are not within the borders of any country
    echo json_encode(array("error" => "No country found"));
}

// Helper function to check if a point (latitude, longitude) is inside a polygon
function pointInPolygon($lat, $lng, $polygon) {
    $c = false;
    $n = count($polygon);
    for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
        if ((($polygon[$i][1] <= $lat) && ($lat < $polygon[$j][1])) || (($polygon[$j][1] <= $lat) && ($lat < $polygon[$i][1]))) {
            if ($lng < ($polygon[$j][0] - $polygon[$i][0]) * ($lat - $polygon[$i][1]) / ($polygon[$j][1] - $polygon[$i][1]) + $polygon[$i][0]) {
                $c = !$c;
            }
        }
    }
    return $c;
}
?>
