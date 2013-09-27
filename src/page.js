/*
 * Парсит html в json
 * @constructor
 */
yuki.ThreadParser = function() {
    var that = this;

    utils.EventDispatcherMixin.call(this);

    /*
     * Парсит страницу на предмет тредов
     * @returns {Array} все треды на странице
     */
    this.parsePage = function() {
        var threads = [];

        $('.threads').each(function() {
            var th = that.parseThread($(this));
            threads.push(th);
        });

        that.emit('parsedPage', threads);

        return threads;
    };

    /*
     * Парсит html треда
     * @param {jQueryElem} $el - элемент на странице
     * @returns {Thread} распарсеный тред
     */
    this.parseThread = function($el) {
        var th = {
            display_id: $el.attr('id').replace('thread_','') |0,
            title: $el.find('.replytitle:first').text(),
            el: $el,
            posts: [],
        };

        that.parsePosts(th);

        that.emit('parsedThread', th);

        return th;
    };

    /*
     * Парсит посты в треде
     * @param {Thread} th - параметры треда
     */
    this.parsePosts = function(th) {
        th.el.find('.post').each(function() {
            var $post_el = $(this);
            var id = $post_el.attr('id').replace('post_','') |0,

            var post = {
                display_id: id,
                op: id === th.display_id,
                thread_id: th.display_id,
                el: $post_el,
                subject_el: $post_el.find('.replytitle:first'),
                name_el: $post_el.find('.postername:first'),
                message_el: $post_el.find('.message:first'),
            };

            post.subject = post.subject_el.text(),
            post.name = post.name_el.text(),

            //TODO: files

            th.posts.push(post);

            that.emit('parsedPost', post);
        });
    };
};

yuki.PleaseParsePage = function() {
    var onPost = function(post) {
        yuki.emit('newPost', post);
    };

    var parser = new ThreadParser();
    parser.on('parsedPost', onPost);
};

yuki.lastPostUpdate;

yuki.PleaseCheckUpdates = function(force) {
    $.get('/api/thread/' + Hanabira.URL.board + '/' + Hanabira.URL.thread + '.json', {}, function(data) {
        if (lastPostUpdate != data.last_modified) {
            $.get('/api/thread/expand/' + Hanabira.URL.board + '/' + Hanabira.URL.thread, function(res) {
                yuki.PleaseUpdateThread(res);
                //BindCrosses($(".delete input"));
                //yuki.PleaseReplyLinks2();
            });

            lastPostUpdate = data.last_modified;
        }
    }, 'json');
};

yuki.PleaseUpdateThread = function(res) {
    var $th = $('<div id="thread_36202" class="thread">');
    $th.html(res);

    var onPost = function(post) {
        //yuki.emit('newPost', post);
    };

    var parser = new ThreadParser();
    parser.on('parsedPost', onPost);
    var th = parser.parseThread($th);
};

// рефлинки
yuki.on('newPost', function(post) {
    var board = Hanabira.URL.board;
    var replyLink = $('<a class="yukiReplyLinks">&gt;&gt;' + post.display_id + '&nbsp;&nbsp;</a>');

    replyLink.attr(
        'href',
        '/' + board + '/res/' + post.thread_id + '.xhtml#i' + post.display_id
    );
    replyLink.attr(
        'onmouseover',
        'ShowRefPost(event,"' + board + '",' + post.thread_id + ',' + post.display_id + ')'
    );
    replyLink.attr(
        'onclick',
        'Highlight(event,' + post.display_id + ')'
    );

    post.el.find('.message a').each(function() {
        var a = $(this);
        // пропускаем внешние ссылки
        if(a.attr('rel') == 'nofollow') {
            return;
        }
        var to = a.text().trim().replace('>>','') |0;
        $('#post_' + to + ' .abbrev').append(replyLink);
    });
});

// фикс гуглоссылок
yuki.on('newPost', function(post) {
    if(location.hostname.indexOf('com') !== -1) {
        var a_gogl = post.el.find('a.search_google:first')
        a_gogl.attr('href', a_gogl.attr('href').replace('://dobrochan.ru/', '://dobrochan.com/'));
    }
});

