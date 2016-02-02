$curl = curl_init();
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
<% if (req.method.toLowerCase() === 'post') { -%>
curl_setopt($curl, CURLOPT_POST, 1);
<% } -%>
<% if (req.headers) { -%>
curl_setopt($curl, CURLOPT_HTTPHEADER, <%- req.headers.replace(/" => "/g, ': ') %>);
<% } -%>
<% var addToUrl = '' -%>
<% if (req.query) { -%>
$query = <%- req.query %>;
<%   addToUrl = ' . "?" . http_build_query($query)'; -%>
<% } -%>
curl_setopt($curl, CURLOPT_URL,
  <%- req.baseUrl + addToUrl %>
);
<% if (req.body) { -%>
<%   if (req.contentType === 'application/json') { -%>
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode(<%- req.body %>));
<%   } else { -%>
curl_setopt($curl, CURLOPT_POSTFIELDS, <%- req.body %>);
<%   } -%>
<% } -%>
<% if (req.returns === 'json') { -%>
$result = json_decode(curl_exec($curl));
<% } else { -%>
$result = curl_exec($curl);
<% } -%>
<% if (typeof returnCode === 'function') { -%>
<%- returnCode('$result') %>
<% } else { -%>
<%   if (req.returns === 'json') { -%>
echo json_encode($result);
<%   } else { -%>
echo $result;
<%   } -%>
<% } -%>
