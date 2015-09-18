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
