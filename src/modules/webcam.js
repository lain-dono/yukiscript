yuki.on('init', function() {
    yuki.WebCam = {
        button: null,
        el: $('<div>'),
        video: $('<video id="video" width="640" height="480" autoplay></video>'),
        button: $('<button id="snap">Snap Photo</button>'),
        init: function() {
            var canvas = document.createElement("canvas"),
            this.context = canvas.getContext("2d");

            this.el.append(this.video);
            this.el.append($('<br>'));
            this.el.append(this.button);

            this.button.click(function() {
                this.el.show();
                this.context.drawImage(this.video[0], 0, 0, 640, 480);
            }.bind(this));
        },
        show: function() {
            this.el.show();
        },
        snap: function() {
        },
        grab: function() {
            var canvas = document.getElementById("canvas"),
                context = canvas.getContext("2d"),
                video = document.getElementById("video"),
                videoObj = { "video": true },
                errBack = function(error) {
                    console.error("Video capture error: ", error.code); 
                };

            if(navigator.getUserMedia) { // Standard
                navigator.getUserMedia(videoObj, function(stream) {
                    video.src = stream;
                    video.play();
                }, errBack);
            } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
                navigator.webkitGetUserMedia(videoObj, function(stream){
                    video.src = window.webkitURL.createObjectURL(stream);
                    video.play();
                }, errBack);
            } else if(navigator.mozGetUserMedia) { // FF-prefixed
                navigator.mozGetUserMedia(videoObj, function(stream){
                    video.src = stream;
                    //video.src = window.webkitURL.createObjectURL(stream);
                    video.play();
                }, errBack);
            }
            
            document.getElementById("snap").addEventListener("click", function() {
                context.drawImage(video, 0, 0, 640, 480);
            });
        }
    };


    yuki.on('makeReplyForm', function($el) {
        var button = $el.find('#makeWebcamPhoto');        
        if(!button) {
            button = $('<button id="makeWebcamPhoto">Сделать фото</button>');
            button.click(function() {

            });
        }
    });
});
