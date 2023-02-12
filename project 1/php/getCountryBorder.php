<?php

$string = file_get_contents("../data/countryBorders.geo.json");
$json = json_decode($string);
$features = $json->features;

$country_code = $_GET['country_code'];

$output_geom = "";
for($i=0;$i<sizeof($features);$i++){
    $feature = $features[$i];
    if($feature->properties->iso_a2 == $country_code){
        $output_geom = $feature->geometry;
        break;
    }
}

// If the matching country code was found, return the border data
if ($output_geom) {
    echo json_encode($output_geom);
} else {
    // Return an error message if the country code was not found
    echo json_encode(array("error" => "Country code not found"));
}