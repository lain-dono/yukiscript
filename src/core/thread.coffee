yuki = {} unless yuki?

# Парсит html в json
class yuki.ThreadParser extends utils.EventDispatcherMixin
  # Парсит страницу на предмет тредов
  # @return {Array} все треды на странице
  parsePage: ->
    threads = []
    _this=@
    $(".thread").each ->
      th = _this.parseThread.call _this, $(this)
      threads.push th

    @emit "parsedPage", threads
    threads

  # Парсит html треда
  # @param {jQueryElem} $el - элемент на странице
  # @return {Thread} распарсеный тред
  parseThread: ($el) ->
    console.log $el
    th =
      display_id: $el.attr("id").replace("thread_", "") | 0
      title: $el.find(".replytitle:first").text()
      el: $el
      posts: []

    @parsePosts th
    @emit "parsedThread", th
    th

  # Парсит посты в треде
  # @param {Thread} th - параметры треда
  parsePosts: (th) ->
    _this=@
    th.el.find(".post").each ->
      $post_el = $(this)
      id = $post_el.attr("id").replace("post_", "") | 0

      post =
        display_id: id
        op: id is th.display_id
        thread_id: th.display_id
        el: $post_el
        subject_el: $post_el.find(".replytitle:first")
        name_el: $post_el.find(".postername:first")
        trip_el: $post_el.find(".postertrip:first")
        message_el: $post_el.find(".message:first")

      post.subject = post.subject_el.text()
      post.name = post.name_el.text()
      post.trip = post.trip_el.text()
      
      #TODO: files

      th.posts.push(post)

      _this.emit "parsedPost", post

