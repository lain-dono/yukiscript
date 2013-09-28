# фикс поисковых ссылок
yuki.modules['fix-search'] =
  init: -> true
  parsedPost: (post) ->
    console.info 'Заменяем домен в поисковых кнопах', post
    post.el.find('a.search_google').each ->
      gogl = $(this)
      href = gogl.attr('href').replace('://dobrochan.ru/', '://dobrochan.com/')
      gogl.attr 'href', href

    post.el.find('a.search_iqdb').each ->
      iqdb = $(this)
      href = iqdb.attr('href').replace('://dobrochan.ru/', '://dobrochan.com/')
      iqdb.attr 'href', href

