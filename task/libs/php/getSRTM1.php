<?php

if (!isset($_REQUEST['lat']) || !isset($_REQUEST['lng'])) {
    // if lat or lng parameters are not set, return an error message
    echo json_encode(array("status"=>array("code"=>"400", "name"=>"Bad Request", "description"=>"missing lat or lng parameter")));
    exit();
}

$url = 'http://api.geonames.org/srtm1JSON?username=flightltd&lat=$lat&lng=$lng';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if ($response === false) {
    // if the API call fails, return an error message
    echo json_encode(array("status"=>array("code"=>"500", "name"=>"Internal Server Error", "description"=>curl_error($ch))));
} else {
    // otherwise, return the API response
    echo $response;
}

curl_close($ch);

?>
