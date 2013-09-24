var utils = {};

// используется один раз в main.js
utils.parseUrl = function(url) {
    m = (url || document.location.href).match(/https?:\/\/([^\/]+)\/([^\/]+)\/((\d+)|res\/(\d+)|\w+)(\.x?html)?(#i?(\d+))?/);
    return m ? {
        host: m[1],
        board: m[2],
        page: m[4],
        thread: m[5],
        pointer: m[8]
    } : {};
};

// используется один раз в main.js
// обязанна быть глобальной
// т.к. жестко хардкорится в onkeypress
function checkEnter(e) {
    e = e || event;
    return (e.keyCode || e.which || e.charCode || 0) !== 13;
}

utils.supports_html5_storagefunction = function() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
};

// используется только в main.js
utils.getLocalStorageValue = function(name, deflt) {
    if (utils.supports_html5_storagefunction() && name in localStorage) {
        var v = localStorage.getItem(name);
        if (v == 'false') {
            v = false;
        }
        if (v == 'true') {
            v = true;
        }
        return v;
    } else {
        return deflt;
    }
};

// только в ф-ии yukiSetNewOptions
utils.setLocalStorageValue = function(name, value) {
    if (utils.supports_html5_storagefunction()) {
        localStorage.setItem(name, value);
        return true;
    } else {
        return false;
    }
};

// только в ф-ии yukiPleasePost
utils.dataURLtoBlob = function(dataURL, dataType) {
    // Decode the dataURL    
    var binary = atob(dataURL.split(',')[1]);
    // Create 8-bit unsigned array
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    // Return our Blob object
    return new Blob([new Uint8Array(array)], {
        type: dataType
    });
}

// используется в ф-ях yukiAddFile, yukiAddGameFile, yukiAttachCapcha
utils.bytesMagnitude = function(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    }
};

// используется в ф-ии yukiPleasePost для создания имени файла
utils.makeRandId = function(size) {
    var text = "";
    var possible = "0123456789abcdef";

    for (var i = 0; i < size; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

utils.arrayBufferDataUri = function(raw) {
    var base64 = '';
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var bytes = new Uint8Array(raw);
    var byteLength = bytes.byteLength;
    var byteRemainder = byteLength % 3;
    var mainLength = byteLength - byteRemainder;

    var a, b, c, d;
    var chunk;

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
        d = chunk & 63; // 63       = 2^6 - 1
        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength];

        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4; // 3   = 2^2 - 1
        base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

        a = (chunk & 16128) >> 8; // 16128 = (2^6 - 1) << 8
        b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4
        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2; // 15    = 2^4 - 1
        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }

    return base64;
};

// используется в ф-ях yukiAddFile, yukiPleasePost
utils.jpegStripExtra = function(input) {
    // result e.target.result;

    // Decode the dataURL    
    var binary = atob(input.split(',')[1]);
    // Create 8-bit unsigned array
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }

    var orig = new Uint8Array(array);
    var outData = new ArrayBuffer(orig.byteLength);
    var output = new Uint8Array(outData);
    var posO = 2,
        posT = 2;

    output[0] = orig[0];
    output[1] = orig[1];

    while (!(orig[posO] === 0xFF && orig[posO + 1] === 0xD9) && posO <= orig.byteLength) {
        if (orig[posO] === 0xFF && orig[posO + 1] === 0xFE) {
            posO += 2 + orig[posO + 2] * 256 + orig[posO + 3];
        } else if (orig[posO] === 0xFF && (orig[posO + 1] >> 4) === 0xE) {
            posO += 2 + orig[posO + 2] * 256 + orig[posO + 3];
        } else if (orig[posO] === 0xFF && orig[posO + 1] === 0xDA) {
            var l = (2 + orig[posO + 2] * 256 + orig[posO + 3]);
            for (var i = 0; i < l; i++) {
                output[posT++] = orig[posO++];
            }
            while (!(orig[posO] === 0xFF && orig[posO + 1] !== 0 && orig[posO + 1] < 0xD0 && orig[posO + 1] > 0xD7) && posO <= orig.byteLength) {
                output[posT++] = orig[posO++];
            }
        } else {
            var l = (2 + orig[posO + 2] * 256 + orig[posO + 3]);
            for (var i = 0; i < l; i++) {
                output[posT++] = orig[posO++];
            }
        }
    }

    output[posT] = orig[posO];
    output[posT + 1] = orig[posO + 1];

    output = new Uint8Array(outData, 0, posT + 2);

    return "data:image/Jpeg;base64," + utils.arrayBufferDataUri(output);
};

// используется в ф-ии yukiPleaseUpdateThread
utils.difference = function(array1, array2) {
    var result = [];

    if (array2.length === 0) {
        return array1;
    }

    for (var i = 0; i < array1.length; i++) {
        if (array2.indexOf(array1[i]) == -1) {
            result.push(array1[i]);
        }
    }

    return result;
};
