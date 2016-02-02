<?php
<% if (input.setup) { -%>
  <%- shift(input.setup.code, 2) %>

<% } -%>
  <%- shift(input.actions[actionIdx].code, 2) %>
?>
