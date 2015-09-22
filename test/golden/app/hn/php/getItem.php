<?php

$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_URL,
  "https://hacker-news.firebaseio.com/" . "v0/item/" . $_POST["itemID"] . ".json"
);
$result = json_decode(curl_exec($curl));
$result = (object) $result;
?>
<h2><?php echo $result->title ?></h2>
<?php
?>
