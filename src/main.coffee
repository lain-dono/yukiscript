Hanabira.URL = parseUrl()

yuki.PleaseInitModules()
yuki.form = new yuki.ReplyForm()

parser = new yuki.ThreadParser
parser.on 'parsedPost', (post) ->
  yuki.emit 'parsedPost', post
parser.parsePage $('.thread')

window.yuki = yuki

# Добавим стилей
$('<style>
  #yukipostform { display: inline-block; text-align: left; width:100%; }
  #yukipostform { display: block; text-align: left; width:100%; }
  #yukiRemoveReplyForm { float: right; }
  #yukiRemoveReplyForm img { vertical-align:middle; min-height:17px; }
  #yuki_sageoff { font-style: italic; }
  #yuki_sageon { font-weight: bold; color: red; }
  #dumb_file_field {
    visiblity:hidden;
    width: 0px;
    height: 0px;
    position: absolute;
    left: -9001px;
  }
  pre {
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
  }
  .reply_ { height: 16px; display: inline-block; vertical-align: bottom; }
  .reply, .post-error, .popup { border-radius: 5px; }
  .yuki_ytholder { float: left;}
  .yukiSaysPostDeleted { opacity: .5; }
  .yukiSaysPostDeleted:hover { opacity: 1; }
  .yukiSaysPostNew { background: #ee9; }
  .yuki_clickable {
    cursor: pointer;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: -moz-none;
    -ms-user-select: none;
    user-select: none;
  }
  .yukiFile {
    text-align: center;
    font-size: 66%;
    display: inline-block;
    width: 210px;
    margin: 5px;
  }

  #files_placeholder > * { vertical-align: top; }
  .yukiFile img {
    max-width: 200px;
    max-height: 200px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    margin: 5px 0;
  }
  .yukiFile span { max-width: 200px; word-wrap: break-word; }
  .rating_SFW { background: green; }
  .rating_R15 { background: yellow; }
  .rating_R18 { background: orange; }
  .rating_R18G { background: red; }
  .de-ytube-link:before {
    content:"";
    background:url(https://youtube.com/favicon.ico) no-repeat center;
    margin:0 4px;
    padding:0 16px 0 0;
  }

  .yukiReplyLinks { font-size: 66%; font-style: italic; }

  div.thread { counter-reset: pstcnt 1; }
  .replypost:not(.yukiSaysPostDeleted) .cpanel:after {
    counter-increment: pstcnt;
    content: counter(pstcnt);
    margin-right:4px;
    vertical-align:1px;
    color:#090;
    font:bold 11px tahoma;
    cursor:default;
  }
  .replypost:nth-child(n+500) .cpanel:after { color: #900; }
</style>').appendTo('head')

