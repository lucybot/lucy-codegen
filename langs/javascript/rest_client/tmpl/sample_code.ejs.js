<% var apiTitle = (input.swagger.info.title || 'API').replace(/\W/g, '') -%>
<% if (input.auth) { -%>
var <%- apiTitle %> = new <%- apiTitle %>Client();
<% } else { -%>
var <%- apiTitle %> = new <%- apiTitle %>Client(<%- JSON.stringify(input.auth, null, 2) %>);
<% } -%>
<%- apiTitle %>.<%- input.route.method %>('<%- input.route.path %>', <%- JSON.stringify(input.answers, null, 2) %>, function(err, data) {
  console.log(data);
});
