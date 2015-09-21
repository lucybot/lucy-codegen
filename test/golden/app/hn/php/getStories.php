<?php

$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_URL,
  "https://hacker-news.firebaseio.com/v0/topstories.json"
);
$result = json_decode(curl_exec($curl));
$result = (object)$result;
?>
<?php foreach($result as $index=>$storyID) { ?>
  <?php if($index < 10) { ?>
    <div class="story">
      <?php echo $storyID ?> 
      <a class="btn btn-success"
     data-action="getItem"
     data-view="itemView"
     data-answers="{itemID: <?php echo $storyID ?>}">
     Load
  </a>

    </div>
  <?php } ?>
<?php } ?>


<?php
?>
