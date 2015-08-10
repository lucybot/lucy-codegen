<% if (languages.client === 'html-angular') { -%>
$_POST = json_decode(file_get_contents('php://input'), true);
<% } -%>
<%- body %>
