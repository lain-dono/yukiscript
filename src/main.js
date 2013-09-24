(function() {
    'use strict';

    $('<style type="text/css"> pre {white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word;} .reply_ {height: 16px;display: inline-block;vertical-align: bottom;} .reply, .post-error, .popup {border-radius: 5px;} .yuki_ytholder {float: left;} .yukiSaysPostDeleted {opacity: .5;} .yukiSaysPostDeleted:hover {opacity: 1;} .yukiSaysPostNew {background: #ee9;} .yuki_clickable { cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: -moz-none; -ms-user-select: none; user-select: none; } .yukiFile { text-align: center; font-size: 66%; display: inline-block; width: 210px; background: #eee; border-radius: 5px; margin: 5px; border: 1px solid #ccc; } #files_placeholder > * { vertical-align: top; } .yukiFile img { max-width: 200px; max-height: 200px; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); margin: 5px 0; } .yukiFile span { max-width: 200px; word-wrap: break-word; } .rating_SFW { background: green; } .rating_R15 { background: yellow; } .rating_R18 { background: orange; } .rating_R18G { background: red; } .de-ytube-link:before {content:"";background:url(https://youtube.com/favicon.ico) no-repeat center;margin:0 4px;padding:0 16px 0 0;} </style>').appendTo("head");

    Hanabira.URL = parseUrl();

    threadUpdateTimer = yukiGetLocalStorageValue('yukithreadupdatetime', threadUpdateTimer);
    yukiAutoupdateThread = yukiGetLocalStorageValue('yukiautoupdatethread', yukiAutoupdateThread);
    yukiRemoveExif = yukiGetLocalStorageValue('yukiRemoveExif', yukiRemoveExif);
    yukiRemoveFileName = yukiGetLocalStorageValue('yukiRemoveFileName', yukiRemoveFileName);

    if (Hanabira.URL.thread) {
        originalThreadTitle = Hanabira.URL.board + '/ ' + document.title.match(/.+—\s.+—\s(.+)/)[1];
        document.title = originalThreadTitle;

        $('div.thread').append($('<br clear="left"><form><label><input type="checkbox" id="yukiAutoloadOption" onchange="yukiSetNewOptions(this);"' + (yukiAutoupdateThread ? ' checked' : '') + '> Подгружать новые посты</label> каждые <input size="4" maxlength="4" value="60" type="text" id="yukiAutoloadPeriod" onkeypress = "checkEnter()" onchange="yukiSetNewOptions(this);">(сек) <span>[<a href="#" id="yukiForceUpdate" onclick="yukiPleaseCheckUpdates(true); return false;">Обновить сейчас</a>]</span></form>'));
        $('#yukiAutoloadPeriod').val(threadUpdateTimer);
        $('<style type="text/css"> div.thread{counter-reset: pstcnt 1;} .replypost:not(.yukiSaysPostDeleted) .cpanel:after{counter-increment: pstcnt;content: counter(pstcnt);margin-right:4px;vertical-align:1px;color:#090;font:bold 11px tahoma;cursor:default;} .replypost:nth-child(n+500) .cpanel:after{color: #900;}  </style>').appendTo("head");

    }

    yukiPleaseReplyLinks2();

    $('div.oppost .abbrev a').each(function() {
        var te = $(this);
        var oldOnClick = te.attr('onclick');
        if (oldOnClick) {
            te.off('onclick');
            te.attr('onclick', oldOnClick.replace('ExpandThread', 'yukiPleaseExpandThread'));
        }
    });

    var icon = document.createElement('canvas');
    icon.width = 16;
    icon.height = 16;

    emptyIconData = icon.toDataURL("image/png");

    var favicon = document.createElement('img');
    favicon.src = '/favicon.ico';
    favicon.onload = function() {
        icon.getContext('2d').drawImage(favicon, 0, 0);
        dobrochanIconData = icon.toDataURL("image/png");
        $('link[rel="icon"]').remove();
        yukiPleasSetFavicon(dobrochanIconData);
    };


    setInterval(function() {
        if (window.document.hidden || window.document.webkitHidden) {
            yukiSaysWeFocused = false;
            if (numOfNewPosts !== 0) {
                if ($('link[rel="shortcut icon"]').attr('href') == dobrochanIconData) {
                    yukiPleasSetFavicon(emptyIconData);
                } else {
                    yukiPleasSetFavicon(dobrochanIconData);
                }
            } else if ($('link[rel="shortcut icon"]').attr('href') != dobrochanIconData) {
                yukiPleasSetFavicon(dobrochanIconData);
            }
        } else if ($('link[rel="shortcut icon"]').attr('href') != dobrochanIconData) {
            yukiPleasSetFavicon(dobrochanIconData);
            yukiSaysWeFocused = true;
        }
    }, 500);

    if (Hanabira.URL.thread) {
        setTimeout(yukiPleaseCheckUpdates, threadUpdateTimer * 1000);
    }

}());
