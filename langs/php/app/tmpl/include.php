<div class="<%- view %>"></div>
<script>
  var element = $('.<%- view %>:empty').first();
  element.html('loading...');
<% if (options.data) { -%>
<% if (!options.data.answers || Object.keys(options.data.answers).length === 0) { -%>
  element.load('<%- options.data.action %>.php'<%- options.method === 'post' ? ', {}' : '' %>);
<% } else { -%>
  element.load('<%- options.data.action %>.php', {
<%   for (var answer in options.data.answers) { -%>
    <%- answer %>: <%- options.data.answers[answer] %>,
<%   } -%>
  });
<% } -%>
<% } else { -%>
  element.load('<%- view %>.php');
<% } -%>
</script>
