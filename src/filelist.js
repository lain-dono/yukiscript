var yukiRemoveExif = true;
var yukiRemoveFileName = true;

yuki.FileListWithcraft = new function() {
    utils.EventDispatcherMixin.call(this);

    this.fileList = [];

    var rating_tpl = [
        '<select name="file_1_rating" class="rating_SFW">',
        '<option class="rating_SFW">SFW</option>',
        '<option class="rating_R15">R-15</option>',
        '<option class="rating_R18">R-18</option>',
        '<option class="rating_R18G">R-18G</option>',
        '</select>'
    ].join('\n');

    this.clear = function() {
        this.fileList = [];
        this.emit('clear');
    }.bind(this);

    this.removeByVal = function(f) {
        this.removeByIdx(this.fileList.indexOf(f))
    }.bind(this);

    this.removeByIdx = function(idx) {
        this.emit('remove', idx, this.fileList[idx]);
        this.fileList[idx]._el.remove();
        delete this.fileList[idx];
        this.fileList.splice(idx, 1);
    }.bind(this);

    /*
     * name
     * type
     * size
     * dataURL
     * ? name_Original
     * ? dataURL_Original
     * _rating
     * _el
     */

    this.push = function(f) {
        if (this.fileList.length >= 5) {
            alert('Пять файлов это максимум на Доброчане.');
            return false;
        }

        f.type = f.type.toLowerCase();

        var rating = $(rating_tpl);
        rating.change(function() {
            f._rating = $(this).val();
            $(this).attr("class", "").addClass("rating_" + $(this).children(":selected").val().replace("-", ""));
        });

        f._el = $('<div class="yukiFile">');
        f._el.append($('<span class="yuki_clickable">[убрать]</span><br/>'));
        f._el.append($('<div class="preview_stub"><img src="' + f.dataURL + '"/></div><br/>'));
        f._el.append($('<span class="file_name">' + escape(f.name) + '</span><br/>'));
        f._el.append($('<span class="file_name">' + utils.bytesMagnitude(f.size) + '&nbsp;</span>'));
        f._el.append(rating);

        f._el.find('.yuki_clickable').click(function() {
            yuki.FileListWithcraft.removeByVal(f);
        });

        this.fileList.push(f);

        $('#files_placeholder').append(f._el);

        this.emit('push', f);

        return true;
    }.bind(this);

    this.appendToFormData = function(fd) {
        for (var i = 0, len = fileList.length; i < len; i++) {
            var f = this.fileList[i];
            fd.append("file_" + (i + 1), utils.dataURLtoBlob(f.dataURL, f.type), f.name);
            fd.append("file_" + (i + 1) + "_rating", f._rating);
        }

        fd.append("post_files_count", this.fileList.length);
    }.bind(this);
};

yukiAddFile = function(evt, b) {
    var files = evt.target.files; // FileList object
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();

        reader.onload = (function(theFile) {
            return function(e) {
                theFile.dataURL = e.target.result;
                theFile.type = theFile.type.toLowerCase();
                theFile.size = theFile.dataURL.length * 6 / 8;

                if (yukiRemoveExif && theFile.type == 'image/jpeg') {
                    theFile.dataURL_Original = theFile.dataURL;
                    theFile.dataURL = utils.jpegStripExtra(theFile.dataURL);
                }

                if (yukiRemoveFileName) {
                    theFile.name_Original = theFile.name;
                    theFile.name = (utils.makeRandId(32) + (theFile.name.match(/\.[^\.]+$/) || [''])[0]).toLowerCase();
                }

                yuki.FileListWithcraft.push(theFile);
            };
        })(f);

        reader.readAsDataURL(f);
    }
};

yukiAddGameFile = function(el) {
    var boardDataUrl = $(el).parent().find('canvas')[0].toDataURL();

    return yuki.FileListWithcraft.push({
        type: 'image/png',
        size: boardDataUrl.length * 6 / 8,
        name: 'reversigameboard.png',
        dataURL: boardDataUrl,
    });
};

yukiAttachCapcha = function(el) {
    var img = $(el).parent().find('img')[0];

    if (img.nodeName.toLowerCase() === 'img') {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");

        return yuki.FileListWithcraft.push({
            type: 'image/png',
            size: dataURL.length * 6 / 8,
            name: 'talking_captcha.png',
            dataURL: dataURL,
        });
    }
};
