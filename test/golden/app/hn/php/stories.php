<?php foreach($result as $index=>$storyID) { ?>
  <?php if($index == 0) { ?>
    <div class="item"></div>
    <script>
      var element = $('.item').last();
      element[0].loadData = function() {
        $('.item').last().load('getItem.php', {
           itemID: <?php echo json_encode($storyID) ?>,
        });
      }
      element[0].loadData();
    </script>

  <?php } else { ?>
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
<?php } ?>
