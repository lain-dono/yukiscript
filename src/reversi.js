var ReversiGame = (function() {
    'use strict';

    var my = {},
        reversiBoard = [],
        blacks = 1,
        whites = 2,
        current = blacks,
        startedAs = current,
        moves = [],
        startPos = reversiBoard;

    var reversiMove = function(x, y, doMove, color) {
        if (!color) {
            color = current;
        }
        if (!doMove) {
            doMove = false;
        }

        var index = y * 8 + x;
        //console.log('check for ' +x+', ' + y + ' (' +index+')');

        if (reversiBoard[index] !== 0) {
            return false;
        }

        var checkDirection = function(dx, dy) {
            if (dx === 0 && dy === 0) {
                return false;
            }

            var cx = x + dx,
                cy = y + dy,
                cidx = cy * 8 + cx;

            if (cx < 0 || cx > 7 || cy < 0 || cy > 7 ||
                reversiBoard[cidx] === 0 || reversiBoard[cidx] === color) {
                return false;
            }

            while (cx >= 0 && cx <= 7 && cy >= 0 && cy <= 7) {
                if (reversiBoard[cidx] == color) {
                    return true;
                }
                if (reversiBoard[cidx] === 0) {
                    return false;
                }
                cx += dx;
                cy += dy;
                cidx = cy * 8 + cx;
            }

            return false;
        };

        var doDirection = function(dx, dy) {
            var cx = x + dx,
                cy = y + dy,
                cidx = cy * 8 + cx;

            reversiBoard[y * 8 + x] = color;

            while (cx >= 0 && cx <= 7 && cy >= 0 && cy <= 7) {
                if (reversiBoard[cidx] === color) {
                    return true;
                }

                reversiBoard[cidx] = color;

                cx += dx;
                cy += dy;
                cidx = cy * 8 + cx;
            }

            return false;
        };

        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (checkDirection(i, j)) {
                    if (doMove) {
                        doDirection(i, j);
                    } else {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    var checkCanMove = function(color) {
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (reversiMove(i, j, false, color)) {
                    return true;
                }
            }
        }
        return false;
    };

    my.initBoard = function(initMoves, fromImage) {
        reversiBoard = [0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 2, 1, 0, 0, 0,
            0, 0, 0, 1, 2, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0
        ];
        blacks = 1;
        whites = 2;
        current = 1;
        moves = [];

        if (fromImage) {
            var buffer = document.createElement('canvas');
            buffer.width = 600;
            buffer.height = 600;
            var ctxB = buffer.getContext('2d'),
                numOfMoves = 0,
                imgMoves = [],
                colorAsNum = function(r, g, b) {
                    return (255 - r) | ((255 - g) << 2) | ((255 - b) << 4);
                };

            ctxB.drawImage(initMoves, 0, 0);
            var imageData = ctxB.getImageData(0, 0, buffer.width, buffer.height);
            ctxB.putImageData(imageData, 0, 0);

            numOfMoves = colorAsNum(imageData.data[0], imageData.data[1], imageData.data[2]);

            for (var i = 0; i < numOfMoves; i++) {
                imgMoves.push(colorAsNum(imageData.data[4 + i * 4], imageData.data[5 + i * 4], imageData.data[6 + i * 4]));
            }

            initMoves = imgMoves;
        }

        if (initMoves && Object.prototype.toString.call(initMoves) === '[object Array]' && initMoves.length > 0) {
            for (var i = 0; i < initMoves.length; i++) {
                var index = initMoves[i];

                if (reversiMove(index % 8, Math.floor(index / 8))) {
                    reversiMove(index % 8, Math.floor(index / 8), true);
                    moves.push(index);

                    if (checkCanMove(current == blacks ? whites : blacks)) {
                        startedAs = current = (current == blacks ? whites : blacks);
                    }
                } else {
                    break;
                }
            }
        }
    };

    my.getBoard = function() {
        var result = [];
        for (var i = 0; i < reversiBoard.length; i++) {
            result.push(reversiBoard[i] === 0 ? 'empty' : reversiBoard[i] === blacks ? 'black' : 'white');
        }

        return result;
    };

    my.getMoves = function() {
        return moves;
    };

    my.getCurrentColor = function() {
        return current == blacks ? 'black' : 'white';
    };

    my.makeMove = function(x, y) {
        if (startedAs != current) {
            return false;
        }
        if (reversiMove(x, y)) {
            reversiMove(x, y, true);
            moves.push(y * 8 + x);

            if (checkCanMove(current == blacks ? whites : blacks)) {
                current = (current == blacks ? whites : blacks);
            }
            return true;
        }

        return false;
    };

    var getStats = my.getStats = function() {
        var countBlacks = 0,
            countWhites = 0,
            countEmpty = 0;
        for (var i = 0; i < reversiBoard.length; i++) {
            if (reversiBoard[i] == blacks) {
                countBlacks++;
            } else if (reversiBoard[i] == whites) {
                countWhites++;
            } else {
                countEmpty++;
            }
        }

        return {
            "blacks": countBlacks,
            "whites": countWhites,
            "empty": countEmpty
        };
    };

    my.drawCanvas = function() {
        var buffer = document.createElement('canvas');
        buffer.width = 600;
        buffer.height = 600;
        var ctxB = buffer.getContext('2d'),
            stats = getStats();

        ctxB.fillStyle = 'white';
        ctxB.fillRect(0, 0, 600, 600);
        ctxB.fillStyle = '#090';
        ctxB.fillRect(100, 100, 400, 400);


        ctxB.strokeStyle = 'rgba(0,0,0,0.5)';
        ctxB.lineWidth = 2;
        ctxB.lineCap = "round";

        for (var i = 0; i < 9; i++) {

            ctxB.beginPath();
            ctxB.moveTo(100, 100 + 50 * i);
            ctxB.lineTo(500, 100 + 50 * i);

            ctxB.stroke();
            ctxB.closePath();

            ctxB.beginPath();
            ctxB.moveTo(100 + 50 * i, 100);
            ctxB.lineTo(100 + 50 * i, 500);

            ctxB.stroke();
            ctxB.closePath();

        }



        for (var i = 0; i < reversiBoard.length; i++) {
            if (reversiBoard[i] !== 0) {
                ctxB.beginPath();
                ctxB.arc(125 + (i % 8) * 50 + 2, 125 + Math.floor(i / 8) * 50 + 2, 20, 0, 2 * Math.PI, false);
                ctxB.fillStyle = 'rgba(0,0,0,0.3)';
                ctxB.fill();
                ctxB.closePath();

                ctxB.beginPath();
                ctxB.arc(125 + (i % 8) * 50, 125 + Math.floor(i / 8) * 50, 20, 0, 2 * Math.PI, false);
                ctxB.fillStyle = reversiBoard[i] == blacks ? '#000' : '#fff';
                ctxB.fill();
                ctxB.closePath();
            }
        }

        if (startedAs == current) {
            ctxB.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctxB.fillStyle = 'rgba(0, 0, 0, 0.1)';
            for (var i = 0; i < reversiBoard.length; i++) {
                if (reversiMove((i % 8), Math.floor(i / 8))) {
                    ctxB.beginPath();
                    ctxB.arc(125 + (i % 8) * 50 + 2, 125 + Math.floor(i / 8) * 50 + 2, 10, 0, 2 * Math.PI, false);
                    ctxB.fill();
                    ctxB.stroke();
                    ctxB.closePath();
                }
            }
        }


        ctxB.fillStyle = 'black';
        ctxB.textAlign = "left";

        if (checkCanMove(blacks) || checkCanMove(whites)) {
            ctxB.font = current == whites ? "bold 20pt Verdana" : "20pt Verdana";
            ctxB.fillText((current == whites ? '> ' : '') + 'Белые: ' + stats.whites, 100, 550);
            ctxB.textAlign = "right";
            ctxB.font = current == blacks ? "bold 20pt Verdana" : "20pt Verdana";
            ctxB.fillText((current == blacks ? '> ' : '') + 'Чёрные: ' + stats.blacks, 500, 550);
        } else {
            ctxB.fillStyle = stats.blacks < stats.whites ? 'red' : 'black';
            ctxB.font = stats.blacks < stats.whites ? "bold 20pt Verdana" : "20pt Verdana";
            ctxB.fillText('Белые: ' + stats.whites, 100, 550);
            ctxB.textAlign = "right";
            ctxB.fillStyle = stats.blacks > stats.whites ? 'red' : 'black';
            ctxB.font = stats.blacks > stats.whites ? "bold 20pt Verdana" : "20pt Verdana";
            ctxB.fillText('Чёрные: ' + stats.blacks, 500, 550);
            ctxB.fillStyle = 'red';
        }



        ctxB.font = "bold 40pt Comic Sans MS";
        ctxB.textAlign = "left";
        ctxB.fillText('Reversi', 100, 70);

        var numAsColor = function(num) {
            return "rgb(" + (255 - (num & 3)) + "," + (255 - ((num >> 2) & 3)) + "," + (255 - ((num >> 4) & 3)) + ')';
        };

        ctxB.fillStyle = numAsColor(moves.length);
        ctxB.fillRect(0, 0, 1, 1);

        for (var i = 0; i < moves.length; i++) {
            ctxB.fillStyle = numAsColor(moves[i]);
            ctxB.fillRect(1 + i, 0, 1, 1);
        }

        return buffer;
    };

    my.createGameBoard = function() {
        var buffer = document.createElement('canvas');
        buffer.width = 600;
        buffer.height = 600;
        var ctxB = buffer.getContext('2d'),
            elBoard = $(buffer);

        ctxB.drawImage(my.drawCanvas(), 0, 0);

        elBoard.on('click', function(e) {
            var canvasX = e.clientX - this.getBoundingClientRect().left,
                canvasY = e.clientY - this.getBoundingClientRect().top,
                cx = Math.floor((canvasX - 100) / 50),
                cy = Math.floor((canvasY - 100) / 50);

            if (my.makeMove(cx, cy)) {
                ctxB.drawImage(my.drawCanvas(), 0, 0);
            }

        });

        return $('<p style="text-align: center;"></p>').append(elBoard).append($('<br/><input value="Убрать" onclick="$(this).parent().parent().empty();" type="button">&nbsp;&nbsp;<input value="Готово!" onclick="if(yukiAddGameFile(this)){$(this).parent().parent().empty();};" style="font-weight: bold;" type="button">'));
    };

    return my;
}());

