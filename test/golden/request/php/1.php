// Built by LucyBot. www.lucybot.com
$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
  "Content-Type: application/json",
  "apikey: asdf"
));
$query = array(
  "q" => "Obama"
);
curl_setopt($curl, CURLOPT_URL,
  "https://api.foo.com/bar/baz" . "?" . http_build_query($query)
);
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode(array(
  0 => array(
    "a" => 1,
    "b" => 2
  ),
  1 => array(
    "a" => 3,
    "b" => 4
  )
)));
$result = curl_exec($curl);
echo $result;
