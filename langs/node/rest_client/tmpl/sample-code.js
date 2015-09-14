<% var host = (input.swagger.schemes ? input.swagger.schemes[0] : 'http') + '://' + input.swagger.host -%>
var <%- input.className %> = require('<%- input.packageName %>').<%- input.className %>;
var <%- input.className %>Client = new <%- input.className %>('<%- host %>');

<% if (input.answers) { -%>
<%- input.className %>Client.<%- input.methodName %>(<%- JSON.stringify(input.answers, null, 2) %>) %>
<% } else { -%>
<%- input.className %>Client.<%- input.methodName %>() %>
<% } %>.then(function(result) {
  console.log(result.body);
});
