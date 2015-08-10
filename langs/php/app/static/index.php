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
<% if (input.viewSetup) { -%>
    <%- shift(input.viewSetup.code, 4) %>
<% } -%>
  </head>
  <body>
    <div class="container" style="margin-top:40px">
      <%- Lucy.include(input.main.view, {indent: 6, data: input.main.data, loadImmediately: true}) %>
    </div>
  </body>
</html>
