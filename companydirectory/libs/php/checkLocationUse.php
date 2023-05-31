<?php

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];

    mysqli_close($conn);

    echo json_encode($output);

    exit;

}   

$query = $conn->prepare('SELECT count(d.id) as count, l.name as locationName FROM department d LEFT JOIN location l ON ( l.id = d.locationID) WHERE l.id = ?');

$query->bind_param("i", $_POST['id']);

$query->execute();

$result = $query->get_result();

$data = $result->fetch_assoc();

if (false === $result) {

    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed"; 
    $output['data'] = [];

    mysqli_close($conn);

    echo json_encode($output); 

    exit;

}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = ['departmentCount' => $data['count'], 'locationName' => $data['locationName']];

mysqli_close($conn);

echo json_encode($output); 

?>
