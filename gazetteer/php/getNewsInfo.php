<?php
$countryCode = $_GET['countryCode'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];

$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => "http://newsapi.org/v2/everything?q='.$countryCode.'&sortBy=relevancy&pageSize=10&apiKey=909b5e98f4194bae8dfeed80a03a3033",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "GET",
  CURLOPT_HTTPHEADER => array(
    "Accept: */*",
    "Accept-Encoding: gzip, deflate",
    "Cache-Control: no-cache",
    "Connection: keep-alive",
    "Host: newsapi.org",
    "Postman-Token: 8f0429db-dcc7-4d8e-8c70-c00cc13e1dc9,72fba6f2-b33d-4884-a6a8-48cd8635e1b9",
    "User-Agent: ".$userAgent,
    "cache-control: no-cache"
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
?>


