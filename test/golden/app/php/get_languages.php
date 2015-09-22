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
$result = (object) $result;
?>
<?php foreach($result as $index=>$l) { ?>
  <?php if($l->foo) { ?>
    <p>foo</p>
  <?php } ?>
  <?php if(!$l->foo) { ?>
    <p>bar</p>
  <?php } ?>
  <?php if($index != 2) { ?>
    <h2><?php echo $index ?>. <?php echo $l->label ?></h2>
  <?php } ?>
  <?php if($l->label == 'Ruby') { ?>
    IF <?php echo $l->label ?>
    <?php if($index == 0) { ?>
      ZERO
    <?php } else { ?>
      NONZERO
    <?php } ?>
  <?php } else { ?>
    ELSE <?php echo $l->label ?>
    <?php if($index == 0) { ?>
      ZERO
    <?php } else { ?>
      NONZERO
    <?php } ?>
  <?php } ?>
<?php } ?>
<br></br>
<br></br>
<h3>Lucy Goose</h3>
<div><b>Bold</b>&nbsp;<i>Italic</i></div>
<div>I &lt;3 &lt;b&gt;APIs&lt;/b&gt;</div>
<?php
?>
