var yukiSaysWeFocused = true,
    emptyIconData = '',
    dobrochanIconData = '',
    lastPostUpdate = '',
    numOfNewPosts = 0,
    originalThreadTitle = '',
    yukireplyForm = null,
    fileList = [],
    yukiIsPosting = false,
    yukiPleaseRmoveReplyForm = false,
    updateHeartBeat = null,
    threadUpdateTimer = 60,
    yukiAutoupdateThread = true,
    yukiRemoveExif = true,
    yukiRemoveFileName = true;

yukiPleaseReplyLinks2 = function() {
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
                $('#post_' + value + ' .abbrev').append(replyLink);
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
            yukiPleaseReplyLinks2();
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
                yukiPleaseReplyLinks2();
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
        fileList = [];
    }

    yukiPleaseShowNumUpdates();

    $(document).scrollTop(scrollPos);
};

yukiPleasSetFavicon = function(ico) {
    $('link[rel="shortcut icon"]').remove();
    $('<link rel="shortcut icon" type="image/x-icon" href="' + ico + '">').appendTo("head");
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
};

yukiAddFile = function(evt, b) {
    var files = evt.target.files; // FileList object

    if (fileList.length >= 5) {
        alert('Пять файлов это максимум на Доброчане.');
        return;
    }

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {
        if (fileList.length >= 5) {
            alert('Пять файлов это максимум на Доброчане.');
            break;
        }
        var f_name = f.name,
            renamed = false;
        if (yukiRemoveFileName) {
            f_name = (utils.makeRandId(32) + (f.name.match(/\.[^\.]+$/) || [''])[0]).toLowerCase();
            renamed = true;
        }

        fileList.push({
            file: f,
            f_name: f_name,
            renamed: renamed,
            el: $('<div class="yukiFile"><span class="yuki_clickable">[убрать]</span><br/><div class="preview_stub"></div><br/><span class="file_name">' +
                escape(f_name) + '</span><br/><span class="file_name">' +
                utils.bytesMagnitude(f.size) + '&nbsp;</span><select name="file_1_rating" class="rating_SFW" onchange=\'$(this).attr("class", "").addClass("rating_" + $(this).children(":selected").val().replace("-",""));\'><option class="rating_SFW">SFW</option><option class="rating_R15">R-15</option><option class="rating_R18">R-18</option><option class="rating_R18G">R-18G</option></select></div>')
        });

        fileList[fileList.length - 1].el.find('.yuki_clickable').on("click", (function(data) {
            return function(e) {
                var idx = fileList.indexOf(data);
                data.el.remove();
                delete fileList[idx];
                fileList.splice(idx, 1);

            };
        }(fileList[fileList.length - 1])));

        $('#files_placeholder').append(fileList[fileList.length - 1].el);

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                // Render thumbnail.
                var span = $('<span></span>');

                if (yukiRemoveExif && theFile.file.type.toLowerCase() == 'image/jpeg') {
                    theFile.dataURL = utils.jpegStripExtra(e.target.result);
                    theFile['jpegStripped'] = true;
                } else {
                    theFile.dataURL = e.target.result;
                    theFile['jpegStripped'] = false;
                }

                if (theFile.file.type.match('image.*')) {
                    theFile.el.find('.preview_stub').replaceWith($('<img />').attr('src', theFile.dataURL));
                }
            };
        })(fileList[fileList.length - 1]);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
};

yukiPleasePost = function() {
    var formData = $('#yukipostform').serializeArray(),
        fd = new FormData();

    for (var i = 0; i < formData.length; i++) {
        fd.append(formData[i].name, formData[i].value);
    }

    for (var i = 0; i < fileList.length; i++) {

        if (yukiRemoveExif && fileList[i].file.type.toLowerCase() == 'image/jpeg' && !fileList[i].jpegStripped) {
            fileList[i].dataURL = utils.jpegStripExtra(fileList[i].dataURL);
        }

        if (yukiRemoveFileName && !fileList[i].renamed) {
            fileList[i].f_name = (utils.makeRandId(32) + (fileList[i].f_name.match(/\.[^\.]+$/) || [''])[0]).toLowerCase();
        }

        fd.append("file_" + (i + 1), utils.dataURLtoBlob(fileList[i].dataURL, fileList[i].file.type), fileList[i].f_name);
        fd.append("file_" + (i + 1) + "_rating", fileList[i].el.find("select[name='file_1_rating']").val());
    }
    fd.append("post_files_count", fileList.length);

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

yukiAddGameFile = function(el) {
    if (fileList.length >= 5) {
        alert('Пять файлов это максимум на Доброчане.');
        return false;
    }

    var boardDataUrl = $(el).parent().find('canvas')[0].toDataURL();

    f = {
        "name": 'reversigameboard.png',
        "size": boardDataUrl.length * 6 / 8,
        "type": 'image/png'
    };

    fileList.push({
        file: f,
        renamed: false,
        f_name: 'reversigameboard.png',
        jpegStripped: true,
        el: $('<div class="yukiFile"><span class="yuki_clickable">[убрать]</span><br/><img src="' + boardDataUrl + '"/><br/><span class="file_name">' +
            escape(f.name) + '</span><br/><span class="file_name">' +
            utils.bytesMagnitude(f.size) + '&nbsp;</span><select name="file_1_rating" class="rating_SFW" onchange=\'$(this).attr("class", "").addClass("rating_" + $(this).children(":selected").val().replace("-",""));\'><option class="rating_SFW">SFW</option><option class="rating_R15">R-15</option><option class="rating_R18">R-18</option><option class="rating_R18G">R-18G</option></select></div>'),
        dataURL: boardDataUrl
    });


    fileList[fileList.length - 1].el.find('.yuki_clickable').on("click", (function(data) {
        return function(e) {
            var idx = fileList.indexOf(data);
            data.el.remove();
            delete fileList[idx];
            fileList.splice(idx, 1);

        };
    }(fileList[fileList.length - 1])));

    $('#files_placeholder').append(fileList[fileList.length - 1].el);

    return true;
};

yukiAttachCapcha = function(el) {
    if (fileList.length >= 5) {
        alert('Пять файлов это максимум на Доброчане.');
        return false;
    }

    var img = $(el).parent().find('img')[0];
    if (img.nodeName.toLowerCase() === 'img') {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");

        f = {
            "name": 'talking_captcha.png',
            "size": dataURL.length * 6 / 8,
            "type": 'image/png'
        };

        fileList.push({
            file: f,
            renamed: false,
            f_name: 'talking_captcha.png',
            jpegStripped: true,
            el: $('<div class="yukiFile"><span class="yuki_clickable">[убрать]</span><br/><img src="' + dataURL + '"/><br/><span class="file_name">' +
                escape(f.name) + '</span><br/><span class="file_name">' +
                utils.bytesMagnitude(f.size) + '&nbsp;</span><select name="file_1_rating" class="rating_SFW" onchange=\'$(this).attr("class", "").addClass("rating_" + $(this).children(":selected").val().replace("-",""));\'><option class="rating_SFW">SFW</option><option class="rating_R15">R-15</option><option class="rating_R18">R-18</option><option class="rating_R18G">R-18G</option></select></div>'),
            dataURL: dataURL
        });


        fileList[fileList.length - 1].el.find('.yuki_clickable').on("click", (function(data) {
            return function(e) {
                var idx = fileList.indexOf(data);
                data.el.remove();
                delete fileList[idx];
                fileList.splice(idx, 1);

            };
        }(fileList[fileList.length - 1])));

        $('#files_placeholder').append(fileList[fileList.length - 1].el);
    }
    return true;
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
