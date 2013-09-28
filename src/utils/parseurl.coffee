window.parseUrl = (url) ->
  url = url or document.location.href
  r = /:\/\/([^\/]+)\/([^\/]+)\/((\d+)|res\/(\d+)|\w+)(\.x?html)?(#i?(\d+))?/
  m = url.match(r)
  if m then {
    host: m[1]
    board: m[2]
    page: m[4]
    thread: m[5]
    pointer: m[8]
  }
  else {}
