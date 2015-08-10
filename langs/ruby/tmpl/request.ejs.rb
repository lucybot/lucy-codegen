uri = URI(<%- req.baseUrl %>)
http = Net::HTTP.new(uri.host, uri.port)
<% if (req.protocol === 'https') { -%>
http.use_ssl = true
<% } -%>
<% if (req.headers) { -%>
headers = <%- req.headers %>
<% } -%>
<% if (req.query) { -%>
uri.query = URI.encode_www_form(<%- req.query %>)
<% } -%>
request = Net::HTTP::<%- req.method.charAt(0).toUpperCase() + req.method.substring(1).toLowerCase() -%>.new(uri.request_uri
<%- req.headers ? ', headers)' : ')' %>
<% if (req.body) { -%>
<%   if (req.contentType === 'application/json') { -%>
request.body = <%- req.body %>.to_json
<%   } else { -%>
request.body = <%- req.body %>
<%   } -%>
<% } -%>
<% if (req.returns === 'json') { -%>
@result = JSON.parse(http.request(request).body)
<% } else { -%>
@result = http.request(request).body
<% } -%>
<% if (typeof returnCode === 'function') { -%>
<%- returnCode('@result') %>
<% } else if (req.returns === 'json') { -%>
<%   if (req.sends === 'stdout') { -%>
puts @result.inspect
<%   } else { -%>
render :json => @result
<%   } -%>
<% } else { -%>
<%   if (req.sends === 'stdout') { -%>
puts @result
<%   } else { -%>
render :text => @result
<%   } -%>
<% } -%>
