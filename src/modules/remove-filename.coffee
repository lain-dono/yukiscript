# кнопка удаления имени файла
yuki.modules['remove-filename'] =
  init: -> true
  addFile: (f) ->
    a = $('<a href=#>Удалить имя</a>')
    a.before $('<br>')
    a.click (e)->
      e.preventDefault()
      f.name_Original = f.name
      rand = utils.makeRandId(32)
      type = (f.name.match(/\.[^\.]+$/) or [""])[0]
      name = (rand + type).toLowerCase()
      f.name = name
      console.info 'Удаляем имя', f.name
      f._el.find('.file_name:first').text f.name
    f._el.find('.preview_stub').append a


