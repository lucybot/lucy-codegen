<?php

$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
  "apikey: foobar"
));
curl_setopt($curl, CURLOPT_URL,
  "https://api.lucybot.com/v1/sample_code/languages"
);
$result = json_decode(curl_exec($curl));
$result = (object)$result;
require 'language_list.php';
?>
