<?php if($result->foo) { ?>
  <p>foo</p>
<?php } ?>
<?php if(!$result->foo) { ?>
  <p>bar</p>
<?php } ?>
<?php foreach($result as $index=>$l) { ?>
  <?php if($index != 2) { ?>
    <h2><?php echo $index ?>. <?php echo $l->label ?></h2>
  <?php } ?>
<?php } ?>
