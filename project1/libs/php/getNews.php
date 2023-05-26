<?php

include('config.php');

$executionStartTime = microtime(true);

$category = isset($_REQUEST['category']) ? $_REQUEST['category'] : 'top';
$url = 'https://newsdata.io/api/1/news?apikey=' . $newsKey . '&country=' . $_REQUEST['param1'] . '&category=' . $category . '&language=en';
$decode = curlNewsData($url);


function curlNewsData($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);
    return $decode;
}

if ($decode['status'] == 'error') {
    $url = 'https://newsdata.io/api/1/news?apikey=' . $newsKey . '&q=' . $_REQUEST['param2'] . '&category=' . $category . '&language=en';
    $decode = curlNewsData($url);
}

if ($decode['totalResults'] == 0) {
    $url = 'https://newsdata.io/api/1/news?apikey=' . $newsKey . '&category=' . $category . '&language=en';
    $decode = curlNewsData($url);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

$newsData = array();

$stories = $decode['results'];
foreach ($stories as $story) {
    $title = $story['title'];
    $link = $story['link'];
    $image = isset($story['image_url']) ? $story['image_url'] : './libs/css/news-blue.png';
    $sourceId = isset($story['source_id']) ? $story['source_id'] : '';

    array_push($newsData, array('title' => $title, 'link' => $link, 'image_url' => $image, 'source_id' => $sourceId));
}

$output['data'] = $newsData;

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);

?>
