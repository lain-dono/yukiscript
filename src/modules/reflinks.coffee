# рефлинки
yuki.modules['reflinks'] =
  init: -> true
  parsedPost: (post) ->
    board = Hanabira.URL.board

    console.info 'Ставим рефки от поста', post

    reply = $("<a href=#>&gt;&gt;#{post.display_id}&nbsp;&nbsp;</a>")
    reply.addClass "yukiReplyLinks"

    href = "/#{board}/res/#{post.thread_id}.xhtml#i#{post.display_id}"
    reply.attr "href", href

    s = "ShowRefPost(event,\"#{board}\",#{post.thread_id},#{post.display_id})"
    reply.attr "onmouseover", s
    reply.attr "onclick", "Highlight(event,#{post.display_id})"

    post.el.find(".message a").each ->
      a = $(this)
      # пропускаем внешние ссылки
      return  if a.attr("rel") is "nofollow"
      to = a.text().trim().replace(">>", "") | 0
      $("#post_#{to} .abbrev").append reply
      console.log to, a, reply

