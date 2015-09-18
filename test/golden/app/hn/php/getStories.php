<?php

$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_URL,
  "https://hacker-news.firebaseio.com/v0/topstories.json"
);
$result = json_decode(curl_exec($curl));
$result = (object)$result;
require 'stories.php';
?>
