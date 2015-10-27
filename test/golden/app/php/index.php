<html>
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js">
    </script>
    <link rel="stylesheet"
          href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">
    <link rel="stylesheet"
          href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js">
    </script>
  </head>
  <body>
    <div class="container" style="margin-top:40px">
      <div class="language_list"></div>
      <script>
        var element = $('.language_list:empty').first();
        element.html('loading...');
        element.load('get_languages.php');
      </script>

    </div>
    <script>
      $(".container").on('click', "a[data-action]", function(event) {
        var el = $(event.target);
        var action = el.attr('data-action');
        var view = el.attr('data-view');
        eval('var answers = ' + el.attr('data-answers'));
        el.parent().load(action + '.php', answers);
      })
    </script>
  </body>
</html>
