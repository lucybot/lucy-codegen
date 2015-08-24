// Built by LucyBot. www.lucybot.com
$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_URL,
  "http://api.lucybot.com/request/languages"
);
$result = curl_exec($curl);
echo $result;
