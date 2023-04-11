<?php

$string = file_get_contents("../data/countryBorders.geo.json");
$json = json_decode($string);
$features = $json->features;

$all_countries = array();
for($i=0;$i<sizeof($features);$i++){
    $feature = $features[$i];
    $country_name = $feature->properties->name;
    $country_iso_a2 = $feature->properties->iso_a2;
    $obj = (object)["name" => $country_name, "iso" => $country_iso_a2];
    array_push($all_countries, $obj);
}
usort($all_countries, function($a, $b) {
    return strcasecmp($a->name, $b->name);
});
echo json_encode($all_countries);
?>