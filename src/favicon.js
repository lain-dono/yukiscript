yuki.PleaseSetFavicon = function(ico) {
    $('link[rel="shortcut icon"]').remove();
    $('<link rel="shortcut icon" type="image/x-icon" href="' + ico + '">').appendTo("head");
};

yuki.Says.WeFocused = true;

yuki.FaviconWitchcraft = new function() {
    this.emptyIconData = '';
    this.dobrochanIconData = '';

    var icon = document.createElement('canvas');
    icon.width = 16;
    icon.height = 16;

    this.emptyIconData = icon.toDataURL("image/png");

    var favicon = document.createElement('img');
    favicon.src = '/favicon.ico';
    favicon.onload = function() {
        icon.getContext('2d').drawImage(favicon, 0, 0);
        this.dobrochanIconData = icon.toDataURL("image/png");
        $('link[rel="icon"]').remove();
        yuki.PleaseSetFavicon(this.dobrochanIconData);
    }.bind(this);

    this.swith = function() {
        var isLinkHrefEmpty = $('link[rel="shortcut icon"]').attr('href') != this.dobrochanIconData;

        if (!(window.document.hidden || window.document.webkitHidden)) {
            yuki.Says.WeFocused = true;
            if (isLinkHrefEmpty) {
                yuki.PleaseSetFavicon(this.dobrochanIconData);
            }
            return;
        }

        if (numOfNewPosts !== 0) {
            // мигаем фавиконкой
            if (!isLinkHrefEmpty) {
                yuki.PleaseSetFavicon(this.emptyIconData);
            } else {
                yuki.PleaseSetFavicon(this.dobrochanIconData);
            }
        } else if (isLinkHrefEmpty) {
            yuki.PleaseSetFavicon(this.dobrochanIconData);
        }

    };

    setInterval(this.swith.bind(this), 500);
};
