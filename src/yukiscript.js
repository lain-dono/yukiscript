var
lastPostUpdate = '',
    numOfNewPosts = 0,
    originalThreadTitle = '',
    yukireplyForm = null,
    yukiIsPosting = false,
    yukiPleaseRmoveReplyForm = false,
    updateHeartBeat = null,
    threadUpdateTimer = 60,
    yukiAutoupdateThread = true;

yuki.PleaseReplyLinks2 = function() {
    'use strict';

    var board = Hanabira.URL.board;

    $('.thread').each(function(index) {
        var e = $(this);
        var threadID = e.attr('id').replace('thread_', '');

        e.find('.post:not(.yukiLinksProcessed)').each(function(index) {
            var r = $(this);
            var postID = r.attr('id').replace('post_', '');

            var replyLink = $('<a class="yukiReplyLinks">&gt;&gt;' + postID + '&nbsp;&nbsp;</a>');

            replyLink.attr('href', '/' + board + '/res/' + threadID + '.xhtml#i' + postID);

            replyLink.attr('onmouseover', 'ShowRefPost(event,"' + board + '",' + threadID + ',' + postID + ')');
            replyLink.attr('onclick', 'Highlight(event,' + postID + ')');

            var links = {};

            r.find('.reply_').each(function() {
                var te = $(this);
                var oldOnClick = te.attr('onclick');
                if (oldOnClick) {
                    // TODO: разобраться
                    te.off('onclick');
                    te.attr('onclick', oldOnClick.replace('GetReplyForm', 'yukiMakeReplyForm'));
                }
            });

            r.find('a.search_google').each(function() {
                $(this).attr('href', $(this).attr('href').replace('://dobrochan.ru/', '://dobrochan.com/'));
            });

            r.find('a.search_iqdb ').each(function() {
                $(this).attr('href', $(this).attr('href').replace('://dobrochan.ru/', '://dobrochan.com/'));
                $(this).after($('<a class="yukiPlayReversi icon" onclick="yukiLetsPlayReversi(this);return false;" href="#" style="margin-left: 5px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOBAMAAADtZjDiAAAAMFBMVEUAAQAARgAAXQEAaQEAcgAAfAAAhgAleScAkgBHhUgApAg8lDhJsktxq3FnwWj9//zBDE9UAAAAbUlEQVQI12MQNjdWAUIGj/9/vBwYwhjs//+3YGDgYKj//38GAwMbiK8Bom3+/40SYJBgUPVUMQsWCmGw6uiKWrVqBYMJA2PU+/8nGAwYGKz+///GoMDAIPX//xcQXwvENwXL72DQaMvwaHNtAwD1eicxlfzDswAAAABJRU5ErkJggg==)"><img src="/images/blank.png" title="Play Reversi!" alt="Play Reversi!"></a>'));
            });

            r.find('.message a').each(function(j) {
                var l = $(this);

                if (l.attr('onmouseover') !== null) {
                    var ref = l.text().replace('>>', '');
                    links[ref] = ref;
                } else {
                    var l = $(this);

                    if (!l.hasClass('de-ytube-link') && l.text().indexOf('YouTube: ') === 0 && l.attr('href').indexOf('http://www.youtube.com/watch?v=') === 0) {

                        var ytId = l.attr('href').replace('http://www.youtube.com/watch?v=', '');
                        l.addClass('de-ytube-link');
                        l.on('click', function(event) {
                            event.preventDefault();
                            if ($(this).closest(".postbody").parent().find('.yuki_ytholder').length > 0) {
                                $(this).closest(".postbody").parent().find('.yuki_ytholder').replaceWith($('<div class="yuki_ytholder"><img src="https://i.ytimg.com/vi/' + ytId +
                                    '/0.jpg" height="270" width="360" class="yuki_clickable"/><br/><span style="font-size: 50%;" class="yuki_clickable" onclick="$(this).parent().remove();">[x]</span></div>').find('img').on('click', function(ytId) {
                                    return function(event) {
                                        $(this).replaceWith($('<embed type="application/x-shockwave-flash" src="https://www.youtube.com/v/' + ytId +
                                            '" wmode="transparent" width="360" height="270">'));
                                    };
                                }(ytId)).parent());
                            } else {
                                $(this).closest(".postbody").before($('<div class="yuki_ytholder"><img src="https://i.ytimg.com/vi/' + ytId +
                                    '/0.jpg" height="270" width="360" class="yuki_clickable"/><br/><span style="font-size: 50%;" class="yuki_clickable" onclick="$(this).parent().remove();">[x]</span></div>').find('img').on('click', function(ytId) {
                                    return function(event) {
                                        $(this).replaceWith($('<embed type="application/x-shockwave-flash" src="https://www.youtube.com/v/' + ytId +
                                            '" wmode="transparent" width="360" height="270">'));
                                    };
                                }(ytId)).parent());
                            }
                            $(this).closest(".postbody").css('clear', 'left');
                        });
                    }
                }
            });

            $.each(links, function(key, value) {
                if (value | 0) {
                    $('#post_' + (value | 0) + ' .abbrev').append(replyLink);
                }
            });

            r.addClass('yukiLinksProcessed');

        });
    });
};

yukiPleaseExpandThread = function(e, board, thread) {
    e.preventDefault();
    var th = $('#thread_' + thread);
    var html = th.html();
    if (Hanabira.ExpThreads[thread])
        th.html(Hanabira.ExpThreads[thread]);
    else {
        $(e.target.parentNode).html(toLoading($('<span></span>')));
        $.get('/api/thread/expand/' + board + '/' + thread, function(res) {
            th.html(res);
            BindCrosses($(".delete input", th));
            yuki.PleaseReplyLinks2();
        });
    }
    Hanabira.ExpThreads[thread] = html;
};

yukiPleaseShowNumUpdates = function() {
    if (numOfNewPosts > 0) {
        document.title = '[' + numOfNewPosts + '] ' + originalThreadTitle;

    } else {
        numOfNewPosts = 0;
        document.title = originalThreadTitle;
    }
};

yukiPleaseCheckUpdates = function(force) {
    if (yukiIsPosting) {
        return;
    }

    clearTimeout(updateHeartBeat);
    updateHeartBeat = setTimeout(yukiPleaseCheckUpdates, threadUpdateTimer * 1000);

    if (!yukiAutoupdateThread && !force) {
        return true;
    }

    $.get('/api/thread/' + Hanabira.URL.board + '/' + Hanabira.URL.thread + '.json', {}, function(data) {
        if (lastPostUpdate != data.last_modified) {
            $.get('/api/thread/expand/' + Hanabira.URL.board + '/' + Hanabira.URL.thread, function(res) {
                yukiPleaseUpdateThread(res);
                BindCrosses($(".delete input"));
                yuki.PleaseReplyLinks2();
            });

            lastPostUpdate = data.last_modified;
        }
    }, 'json');
};

yukiPleaseUpdateThread = function(newHtml) {
    'use strict';

    var scrollPos = $(document).scrollTop();

    var newThread = $('<body>' + newHtml + '</body>'),
        oldPosts = [],
        newPosts = [],
        postParents = {},
        prevPost = 0;

    newThread.filter('table.replypost').each(function(i) {
        var postID = $(this).attr('id').replace('post_', '');

        newPosts.push(postID);
        postParents[postID] = prevPost;
        prevPost = postID;

    });

    $('table.replypost').each(function(i) {
        var postID = $(this).attr('id').replace('post_', '');

        oldPosts.push(postID);
    });

    $.each(utils.difference(oldPosts, newPosts), function(index, item) {
        $('table#post_' + item).addClass('yukiSaysPostDeleted');

    });

    $.each(utils.difference(newPosts, oldPosts), function(index, item) {
        if (postParents[item] !== 0) {
            var pEl = $('table#post_' + postParents[item]);
            while (pEl.next().hasClass('yukiSaysPostDeleted')) {
                pEl = pEl.next();
            }
            pEl.after(newThread.filter('table#post_' + item).first().addClass('yukiSaysPostNew').mouseleave(function(e) {
                $(e.delegateTarget).removeClass('yukiSaysPostNew');
                $(e.delegateTarget).off('mouseleave');
                numOfNewPosts--;
                yukiPleaseShowNumUpdates();
            }));
        } else {
            $('div.oppost').after(newThread.filter('table#post_' + item).first().addClass('yukiSaysPostNew').mouseleave(function(e) {
                $(e.delegateTarget).removeClass('yukiSaysPostNew');
                $(e.delegateTarget).off('mouseleave');
                numOfNewPosts--;
                yukiPleaseShowNumUpdates();
            }));
        }

        numOfNewPosts++;
    });

    if (yukiPleaseRmoveReplyForm) {
        yukiPleaseRmoveReplyForm = false;
        yukireplyForm.remove();
        yukireplyForm = null;
        yuki.FileListWithcraft.clear();
    }

    yukiPleaseShowNumUpdates();

    $(document).scrollTop(scrollPos);
};


yukiMakeReplyForm = function(click, board, tid, pid) {
    if (!yukireplyForm) {
        yukireplyForm = $('<form class="reply" style="display: inline-block; text-align: left;" id="yukipostform" action="/b/post/new.xhtml" method="post" enctype="multipart/form-data" onsubmit="return yukiPleasePost()">' +
            '<input name="thread_id" value="2412950" type="hidden"><input name="task" value="post" type="hidden"><input id="scroll_to" name="scroll_to" value="2426848" type="hidden">' +
            '<table><tbody><tr id="trname"><td class="postblock">Имя</td><td><input name="name" size="30" value="Анонимус" type="text"><span id="yuki_sageoff" class="yuki_clickable" onclick="$(this).hide(); $(\'#yuki_sageon\').show(); $(\'#isSage\').attr(\'checked\',\'checked\');">&nbsp;<i>(no&nbsp;sage)</i></span>' +
            '<span id="yuki_sageon" style="display: none;" class="yuki_clickable" onclick="$(this).hide(); $(\'#yuki_sageoff\').show(); $(\'#isSage\').removeAttr(\'checked\');">&nbsp;<b style="color: red;"><img src="data:image/gif;base64,R0lGODlhDgAOAIQQAAYGAxscGiEjITEyMNwaFuEjI+kxMe5KS/FcXfFqafV+fvaQj/miofisrPu2tPvDw' +
            '////////////////////////////////////////////////////////////////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQFMgAQACwAAAAADgAOAAAFbiCUGGRpJqLjNE/rPs6THKwz3EMALAtDsouGkNdbKEjBBW4gACgUCOSQYUxYZ0jqTdAEGBCHgoGh4FkPB8MBgSAYnksmAIB2QxU4nbeuRsD1CQVhbmwjBnMEBWIFBDNpaQSRiYoGImkGiomRYhAhACH5BAUyAB8ALAQAAgAGAAEAAAUE4COOI' +
            'QAh+QQFMgAfACwEAAIABgADAAAFC+AgDgHwnWijLmwIACH5BAEyAB8ALAQABAAGAAMAAAUM4CAOAvCd6MIoSpKEADs="/>&nbsp;SAGE</b></span><span style="float: right;">&nbsp;<a class="close icon" title="Убрать" onclick="yukireplyForm.remove()" ><img src="/images/blank.png" alt="Remove" style="vertical-align:middle; min-height:17px"></a></span></td></tr><tr style="display: none;" id="trsage"><td class="postblock">Не поднимать тред&nbsp;</td><td><input name="sage" type="checkbox" id="isSage"></td>' +
            '</tr><tr id="trsubject"><td class="postblock">Тема</td><td><input name="subject" size="30" maxlength="64" value="" type="text"><input name="new_post" value="Отправить" type="submit"><span style="float: right;"><span id="de-btn-quote" title="Цитировать выделенное" onclick="yukiQuoteSelected()"><input value=">" style="font-weight: bold;" type="button"></span></span>' +
            '</td></tr><tr id="trmessage"><td class="postblock">Сообщение</td><td><textarea style="padding: 0px; resize: both; " id="yukireplyText" name="message" cols="60" rows="6" onkeyup="$(this).css(\'height\', \'auto\' ); $(this).height(this.scrollHeight + 24);"></textarea><br/><div id="gamePlaceholder"></div></td></tr><tr id="trcaptcha"><td class="postblock">Капча</td><td><span><img src="" alt="Капча" id="captcha-image" onclick="reload_captcha(event);" style="margin: 2px; vertical-align:middle">&nbsp;<span onclick="yukiAttachCapcha(this);" class="yuki_clickable" title="Прикрепить капчу" style="color: #999;">[+]</span></span><br>' +
            '<input autocomplete="off" id="captcha" name="captcha" size="30" onfocus="reload_captcha(event);" onkeypress="CaptchaProcess(event, \'ru\')" type="text" style="display: none;">' +
            '</td></tr><tr style="display: none;" id="trrempass"><td class="postblock">Пароль</td><td><input name="password" size="35" value="123" type="password">' +
            '</td></tr><tr id="trfile"><td class="postblock">Файлы</td><td id="files_parent"><input id="post_files_count" name="post_files_count" value="2" type="hidden">' +
            '<div id="file_1_div"><input id="dumb_file_field" onchange="yukiAddFile(event, this);" type="file" style="visiblity:hidden; width: 0px; height: 0px; position: absolute; left: -9001px;" multiple />' +
            '<input value="Добавить файлы" type="button" onclick="$(\'#dumb_file_field\').click()"/>' +
            '<span style="font-size: 66%;">&nbsp;<label><input type="checkbox" id="yukiRemoveExif" onchange="yukiSetNewOptions(this);"' + (yukiRemoveExif ? ' checked' : '') + '> Убирать Exif</label> &nbsp;<label><input type="checkbox" id="yukiRemoveFileName" onchange="yukiSetNewOptions(this);"' + (yukiRemoveFileName ? ' checked' : '') + '> Убирать имя файла</label></span>' +
            '<div id="files_placeholder"></div></div></td></tr><tr style="display: none;" id="trgetback">' +
            '<td class="postblock">Вернуться к</td><td><select name="goto"><option value="board" selected="selected">доске</option><option value="thread">треду</option>' +
            '</select></td></tr></tbody></table></form>');
        upload_handler = $t() * 10000;

        yukireplyForm.find("#captcha-image").attr('src', "/captcha/" + Hanabira.URL.board + "/" + $t() + '.png');
        yukireplyForm.find("input[name='password']").val($(".userdelete input[name='password']").val());
        yukireplyForm.find("input[name='thread_id']").val(tid);
        yukireplyForm.find("input[name='name']").val($("#postform_placeholder input[name='name']").val());
        if ($('#postFormDiv #captcha').length > 0) {
            yukireplyForm.find("input[name='captcha']").show();
        }

    }
    yukireplyForm.find("input[name='scroll_to']").val(pid || 0);
    $('#post_' + pid).after(yukireplyForm);

    InsertInto(document.getElementById('yukireplyText'), ">>" + pid + "\n");

    if ($(click).hasClass('yukiPlayReversi')) {
        //console.log("play reversi");
        yukireplyForm.find("#gamePlaceholder").empty().append($('<span>...загружаем игру...</span>'));

        var gameData = new Image();
        gameData.onload = function() {
            ReversiGame.initBoard(gameData, true);
            $("#gamePlaceholder span").replaceWith(ReversiGame.createGameBoard());
        };

        gameData.src = $($(click).parent().find('a')[0]).attr('href');
    }
    yuki.emit('makeReplyForm', yukireplyForm);
};


yukiPleasePost = function() {
    var formData = $('#yukipostform').serializeArray(),
        fd = new FormData();

    for (var i = 0; i < formData.length; i++) {
        fd.append(formData[i].name, formData[i].value);
    }

    yuki.FileListWithcraft.appendToFormData(fd);

    yukiIsPosting = true;
    clearTimeout(updateHeartBeat);
    yukireplyForm.find("input[type=submit]").val('...Работаем...').attr("disabled", "disabled");

    $.ajax({
        url: '/' + Hanabira.URL.board + '/post/new.xhtml' + "?X-Progress-ID=" + upload_handler,
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {
            if (Hanabira.URL.thread && data.indexOf("/error/post/") == -1) {
                yukiIsPosting = false;
                yukiPleaseRmoveReplyForm = true;
                yukiPleaseCheckUpdates();
            } else {
                document.location.href = data.match(/\(\'(.+)\'\)/)[1];
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            yukiIsPosting = true;
            yukireplyForm.find("input[type=submit]").val('Отправить').removeAttr("disabled");
            alert('Не получилось отправить пост.\nПопробуйте чуть попозже ещё разок или перезагрузить страницу.\n\n-----------------------------\n' + textStatus);
        }
    });

    return false;
};

yukiQuoteSelected = function() {
    var t = document.getElementById('yukireplyText');
    InsertInto(t, '>' + window.getSelection().toString().replace(/\n/gm, '\n>') + '\n');
};

yukiLetsPlayReversi = function(el) {
    yukiMakeReplyForm(el, Hanabira.URL.board, $(el).parents('.thread').attr('id').replace('thread_', ''), $(el).parents('.post').attr('id').replace('post_', ''));
};

yukiSetNewOptions = function(el) {
    if ($(el).attr('id') == 'yukiAutoloadOption') {
        yukiAutoupdateThread = el.checked;
        utils.setLocalStorageValue('yukiautoupdatethread', yukiAutoupdateThread);
    }
    if ($(el).attr('id') == 'yukiAutoloadPeriod') {
        threadUpdateTimer = $(el).val();
        utils.setLocalStorageValue('yukithreadupdatetime', threadUpdateTimer);
    }

    if ($(el).attr('id') == 'yukiRemoveExif') {
        yukiRemoveExif = el.checked;
        utils.setLocalStorageValue('yukiRemoveExif', yukiRemoveExif);
    }
    if ($(el).attr('id') == 'yukiRemoveFileName') {
        yukiRemoveFileName = el.checked;
        utils.setLocalStorageValue('yukiRemoveFileName', yukiRemoveFileName);
    }
};
