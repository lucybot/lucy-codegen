<div class="<%- view %>"></div>
<script>
  var element = $('.<%- view %>').last();
  element[0].loadData = function() {
<% if (options.data) { -%>
<% if (!options.data.answers || Object.keys(options.data.answers).length === 0) { -%>
    $('.<%- view %>').last().load('<%- options.data.action %>.php'<%- options.method === 'post' ? ', {}' : '' %>);
<% } else { -%>
    $('.<%- view %>').last().load('<%- options.data.action %>.php', {
<%   for (var answer in options.data.answers) { -%>
       <%- answer %>: <%- options.data.answers[answer] %>,
<%   } -%>
    });
<% } -%>
<% } else { -%>
    $('.<%- view %>').last().load('<%- view %>.php');
<% } -%>
  }
<% if (options.loadImmediately) { -%>
  element[0].loadData();
<% } -%>
</script>
