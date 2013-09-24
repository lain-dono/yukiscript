var fileList = [];
var yukiRemoveExif = true;
var yukiRemoveFileName = true;

yuki.fileList = fileList;

yuki.FileListWithcraft = new function() {
    var el_name = '#files_placeholder';
    var rating_tpl = [
        '<select name="file_1_rating" class="rating_SFW"',
        //'onchange=\'$(this).attr("class", "").addClass("rating_" + $(this).children(":selected").val().replace("-",""));',
        '\'>',
        '<option class="rating_SFW">SFW</option>',
        '<option class="rating_R15">R-15</option>',
        '<option class="rating_R18">R-18</option>',
        '<option class="rating_R18G">R-18G</option>',
        '</select>'
    ].join('\n');

    this.fileList = fileList;

    this.clear = function() {
        this.fileList = [];
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
        //f._el.append($(''));

        f._el.find('.yuki_clickable').click(function() {
            var list = yuki.FileListWithcraft.fileList;
            var idx = list.indexOf(f);
            list[idx]._el.remove();
            delete list[idx];
            list.splice(idx, 1);
        });

        this.fileList.push(f);

        $('#files_placeholder').append(f._el);

        return true;
    }.bind(this);

    this.appendToFormData = function(fd) {
        fd.append("post_files_count", this.fileList.length);

        for (var i = 0, len = fileList.length; i < len; i++) {
            var f = this.fileList[i];
            fd.append("file_" + (i + 1), utils.dataURLtoBlob(f.dataURL, f.type), f.name);
            fd.append("file_" + (i + 1) + "_rating", f._rating);
        }
    }.bind(this);
};

yukiAddFile = function(evt, b) {
    var files = evt.target.files; // FileList object
    for (var i = 0, f; f = files[i]; i++) {
        console.log("x", f);
        var reader = new FileReader();

        reader.onload = (function(theFile) {
            return function(e) {
                console.log("y", theFile);
                theFile.dataURL = e.target.result;

                if (yukiRemoveExif && theFile.type.toLowerCase() == 'image/jpeg') {
                    theFile.dataURL_Original = theFile.dataURL;
                    theFile.dataURL = utils.jpegStripExtra(theFile.dataURL);
                }

                if (yukiRemoveFileName) {
                    theFile.name_Original = theFile.name;
                    theFile.name = (utils.makeRandId(32) + (theFile.name.match(/\.[^\.]+$/) || [''])[0]).toLowerCase();
                }

                theFile.size = theFile.dataURL.length * 6 / 8;

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
