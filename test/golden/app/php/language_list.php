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
<?php } ?>
