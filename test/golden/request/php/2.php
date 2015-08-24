// Built by LucyBot. www.lucybot.com
$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
$query = array(
  "q" => array(
    0 => "one",
    1 => "two",
    2 => "three"
  )
);
curl_setopt($curl, CURLOPT_URL,
  "http://undefined/" . "?" . http_build_query($query)
);
$result = curl_exec($curl);
echo $result;
