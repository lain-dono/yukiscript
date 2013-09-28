yuki = {} unless yuki?

class yuki.ReplyForm
  constructor: ->
    @files = new yuki.FileListWithcraft
    yuki.on 'parsedPost', (post) =>
      reply = post.el.find('.reply_:first')
      reply.off('onclick')
      reply.attr('onclick', '')

      # Black Magic
      reply.click( ((post, that) -> ->
        that.showForm post.display_id, post.thread_id
      )(post, this) )

  post: ->
    formData = @form.serializeArray()
    fd = new FormData()

    for data in formData
      fd.append data.name, data.value

    @files.appendToFormData fd

    @form.find("#submit")
      .val("...Работаем...")
      .attr("disabled", "disabled")

    $.ajax
      url: "/#{Hanabira.URL.board}/post/new.xhtml?X-Progress-ID=#{$t()}"
      type: "POST"
      data: fd
      processData: false
      contentType: false
      success: (data, textStatus, jqXHR) =>
        @form.find("#submit")
          .val("Отправить")
          .removeAttr "disabled"
        if Hanabira.URL.thread and data.indexOf("/error/post/") is -1
          #yukiIsPosting = false
          #yukiPleaseRmoveReplyForm = true
          #yukiPleaseCheckUpdates()
        else
          document.location.href = data.match(/\(\'(.+)\'\)/)[1]

      error: (jqXHR, textStatus, errorThrown) =>
        @form.find("#submit")
          .val("Отправить")
          .removeAttr "disabled"
        alert "Не получилось отправить пост.\n
        Попробуйте чуть попозже ещё разок или перезагрузить страницу.\n
        -----------------------------\n
        #{textStatus}"

  showForm: (@pid, @tid) ->
    @createForm()  if !@form?

    @form.find('[name="thread_id"]:first').val(tid)

    pass = $('.userdelete input[name="password"]:first').val()
    @form.find('[name="password"]:first').val(pass)

    @form.find("#captcha-image")
      .attr('src', "/captcha/#{Hanabira.URL.board}/#{$t()}.png")

    name = $("#postform_placeholder input[name='name']").val()
    @form.find("input[name='name']:first").val(name)

    if $('#postFormDiv #captcha').length > 0
      @form.find("input[name='captcha']").show()
    else
      @form.find("input[name='captcha']").hide()

    $("#post_#{@pid}").after @form

    @form.show()

  createForm: (tid) ->
    @form = $("
      <form id='yukiReplyForm' class='reply' enctype='multipart/form-data'
        method='post' action='/#{Hanabira.URL.board}/post/new.xhtml'></form>")
    @form.append "
      <input type='hidden' name='task' value='post'/>
      <input type='hidden' name='thread_id' value=''/>
      <input type='hidden' name='password' value=''/>"

    @form.append "<table id='xxx'><table>"

    @xxx = @form.find('#xxx')

    block = (id, name, txt) ->
      "<tr id='#{id}'><td class='postblock'>#{name}</td><td>#{txt}</td></tr>"

    @xxx.append block('reply-trname', 'Имя', "<td>
      <input name='name' size='35' maxlength='64' value=''>
      </td>
      <td style='text-align:right'>
          <a id='replyClose' class='close icon' title='Убрать'>
            <img src='/images/blank.png' alt='Remove'
              style='vertical-align:middle; min-height:17px'>
          </a>
      </td>
      "
    )
    @form.find('#replyClose').click =>
      @form.hide()

    @xxx.append block('reply-trsubject', 'Тема', "<td>
    <input name='subject' size='35' maxlength='64' value='' />
    </td>
    <td style='text-align:right'>
      <input id=submit type='button' name='new_post' value='Отправить'>
      <a onclick='QuoteSelected()' class='quote icon'
        title='Скопипастить выделенный текст'>
        <img src='/images/blank-double.png'
          alt='Quote' style='vertical-align:middle; min-height:17px'>
      </a>
    </td>
      "
    )

    @form.find('#submit').click (e) =>
      e.preventDefault()
      @post()

    @xxx.append block('reply-trmessage', 'Сообщение',
      "<td colspan=2>
      <textarea id='yukiReplyText' name='message' cols=100 rows=6></textarea>
      </td>"
    )

    @xxx.append block('reply-trcaptcha', 'Капча',
      "<td>
        <img src='#{$('#trcaptcha img:first').attr('src')}' /><br>
        <input name='captcha' size='35' maxlength='64' value='' />
      </td>"
    )

    @xxx.append block('reply-trfile', 'Файлы',
      "<td id=xx colspan=3></td>"
    )
    @xxx.find('#xx').append(@files.dumb).append(@files.button).append(@files.el)



