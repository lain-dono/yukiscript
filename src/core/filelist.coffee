yuki = {} unless yuki?

#yukiRemoveExif = true
#yukiRemoveFileName = true

class yuki.FileListWithcraft
  el: $('<div id=files_placeholder>')
  RemoveExif:false
  RemoveFileName:false

  dumb: $('<input id="dumb_file_field" type="file" multiple>)')
  button: $('<input value="Добавить файлы" type="button"/>')

  fileList: []

  constructor:->
    @dumb.change @AddFile.bind(@)
    @button.click ->
      $('#dumb_file_field').click()

  rating_tpl: "
  <select name='file_1_rating' class='rating_SFW'>
  <option class='rating_SFW'>SFW</option>
  <option class='rating_R15'>R-15</option>
  <option class='rating_R18'>R-18</option>
  <option class='rating_R18G'>R-18G</option>
  </select>"

  dataURLtoBlob: (dataURL, dataType) ->
    # Decode the dataURL
    binary = atob(dataURL.split(",")[1])
    # Create 8-bit unsigned array
    array = []
    for _x, i in binary
      array.push binary.charCodeAt(i)
    # Return our Blob object
    new Blob([new Uint8Array(array)], type: dataType)

  clear: ->
    @fileList = []
    console.log 'clearFilelist', idx, @fileList[idx]
    yuki.emit "clearFilelist"

  removeByVal: (f) ->
    @removeByIdx @fileList.indexOf(f)

  removeByIdx: (idx) ->
    yuki.emit "removeFile", idx, @fileList[idx]
    console.log 'removeFile', idx, @fileList[idx]
    @fileList[idx]._el.remove()
    delete @fileList[idx]
    @fileList.splice idx, 1

  AddFile: (evt, b) ->
    files = evt.target.files # FileList object
    that = @

    for f in files
      reader = new FileReader()
      reader.onload = ((file, that) ->
        (e) ->
          f = {}
          f[name] = file[name] for name of file

          f.dataURL = e.target.result
          f.type = f.type.toLowerCase()
          f.size = f.dataURL.length * 6 / 8

          if that.RemoveExif and f.type is "image/jpeg"
            f.dataURL_Original = f.dataURL
            f.dataURL = utils.jpegStripExtra f.dataURL

          if that.RemoveFileName
            f.name_Original = f.name
            rand = utils.makeRandId(32)
            type = (f.name.match(/\.[^\.]+$/) or [""])[0]
            f.name = (rand + type).toLowerCase()

          that.push f
      )(f, that)
      reader.readAsDataURL f

  # name
  # type
  # size
  # dataURL
  # dataURL_tumb
  # ? name_Original
  # ? dataURL_Original
  # _rating
  # _el
  bytesMagnitude: (bytes) ->
    if bytes < 1024
      bytes + " B"
    else if bytes < 1024 * 1024
      (bytes / 1024).toFixed(2) + " KB"
    else
      (bytes / 1024 / 1024).toFixed(2) + " MB"

  push: (f) ->
    if @fileList.length >= 5
      alert "Пять файлов это максимум на Доброчане."
      return false

    f.type = f.type.toLowerCase()
    f.dataURL_tumb = f.dataURL  unless f.dataURL_tumb

    rating = $(@rating_tpl)
    rating.change ->
      f._rating = $(this).val()
      rating = $(this).children(":selected").val().replace("-", "")
      $(this).attr("class", "").addClass "rating_#{rating}"

    f._el = $("<div class='yukiFile'>")
    f._el.append $("<span class='yuki_clickable'>[убрать]</span><br/>")
    f._el.append $("<div class='preview_stub'>
      <img src='#{f.dataURL}'/>
      </div>")
    f._el.append $("<span class='file_name'>#{f.name}</span><br/>")
    f._el.append $("<span class='file_size'>
      #{@bytesMagnitude(f.size)}'</span>")
    f._el.append rating
    f._el.find(".yuki_clickable").click => @removeByVal f

    @fileList.push f

    console.log 'addFile', f

    @el.append f._el

    yuki.emit "addFile", f
    true

  appendToFormData: (fd) ->
    fd.append "post_files_count", @fileList.length
    for f, i in @fileList
      fd.append "file_#{(i + 1)}", @dataURLtoBlob(f.dataURL, f.type), f.name
      fd.append "file_#{(i + 1)}_rating", f._rating

