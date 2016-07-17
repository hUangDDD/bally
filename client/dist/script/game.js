var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("client/src/resource", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.GLOBAL_SCALE = 1;
    exports.BOX2D = true;
    exports.BOX2D_SCALE = 4 / (1136 * exports.GLOBAL_SCALE);
    exports.INV_BOX2D_SCALE = 1 / exports.BOX2D_SCALE;
    function ToBox2DUnit(n) {
        return n * exports.BOX2D_SCALE;
    }
    exports.ToBox2DUnit = ToBox2DUnit;
    function FromBox2DUnit(n) {
        return n * exports.INV_BOX2D_SCALE;
    }
    exports.FromBox2DUnit = FromBox2DUnit;
    var SCREEN_WIDTH = 640 * exports.GLOBAL_SCALE;
    var SCREEN_HEIGHT = 1136 * exports.GLOBAL_SCALE;
    var FPS = 30;
    var TICK_TIME = 1 / FPS;
    exports.GraphicConstant = {
        SCREEN_WIDTH: SCREEN_WIDTH,
        SCREEN_HEIGHT: SCREEN_HEIGHT,
        GLOBAL_SCALE: exports.GLOBAL_SCALE,
        FPS: FPS,
        TICK_TIME: TICK_TIME
    };
    //底部弧形碰撞区域的坐标
    exports.BOTTOM_STATIC_CHAIN_POINT = [];
    {
        var width = exports.GraphicConstant.SCREEN_WIDTH;
        var y0 = (723 + 95) * exports.GLOBAL_SCALE, y1 = (764 + 95) * exports.GLOBAL_SCALE, y2 = (774 + 95) * exports.GLOBAL_SCALE;
        y0 += 40 * exports.GLOBAL_SCALE;
        y1 += 40 * exports.GLOBAL_SCALE;
        y2 += 40 * exports.GLOBAL_SCALE;
        var yy = [y0, y0, y1, y2, y1, y0, y0];
        var xx = [-10, 0, width / 4, width / 2, width / 4 * 3, width, width + 10];
        for (var i = 0; i < xx.length; ++i) {
            exports.BOTTOM_STATIC_CHAIN_POINT.push({ x: xx[i], y: yy[i] });
        }
    }
    //一些公用的图形元素的位置坐标
    exports.POSITIONS = {
        SKILL_BUTTON: { x: 94, y: 1014 },
        COIN_CENTER: { x: 333, y: 153 },
        SCORE_CENTER: { x: 321, y: 97 },
        FEVER_CENTER: { x: 336, y: 1019 },
        FEVER_SCORE_CENTER: { x: 319, y: 200 },
    };
    for (var key in exports.POSITIONS) {
        exports.POSITIONS[key].x *= exports.GLOBAL_SCALE;
        exports.POSITIONS[key].y *= exports.GLOBAL_SCALE;
    }
});
///<reference path="../typings/tsd.d.ts"/>
define("client/src/util", ["require", "exports"], function (require, exports) {
    "use strict";
    function isPrimatyButton(e) {
        return e.nativeEvent.button == 0 || (window["TouchEvent"] && e.nativeEvent instanceof TouchEvent);
    }
    exports.isPrimatyButton = isPrimatyButton;
    function assert(test, msg) {
        if (!test) {
            var e = new Error('assert error');
            console.log(e);
            alert(msg);
        }
    }
    exports.assert = assert;
    function randomChoose(arr) {
        var i = (Math.random() * arr.length) | 0;
        return arr[i];
    }
    exports.randomChoose = randomChoose;
    function clipImage(image, x, y, width, height, scale) {
        var canvas = document.createElement('canvas');
        var cx = canvas.width = (width * scale) | 0;
        var cy = canvas.height = (height * scale) | 0;
        var ctx = canvas.getContext('2d');
        if (!scale || scale === 1) {
            ctx.drawImage(image, -x, -y);
        }
        else {
            ctx.drawImage(image, x, y, width, height, 0, 0, cx, cy);
        }
        return canvas;
    }
    exports.clipImage = clipImage;
    function cutRowImages(image, n, scale) {
        if (!scale)
            scale = 1;
        var ret = [];
        var width = (image.width / n) | 0;
        var height = image.height;
        for (var i = 0; i < n; ++i) {
            ret.push(clipImage(image, i * width, 0, width, height, scale));
        }
        return ret;
    }
    exports.cutRowImages = cutRowImages;
    function scaleImage(image, scale) {
        return clipImage(image, 0, 0, image.width, image.height, scale);
    }
    exports.scaleImage = scaleImage;
    /**生成一个播放序列帧的Tween */
    function animTween(bitmap, arr, time, autoRemove) {
        bitmap.image = arr[0];
        var obj = {
            _frame: 0,
            bitmap: bitmap,
            arr: arr
        };
        Object.defineProperty(obj, 'frame', {
            get: function () { return this._frame; },
            set: function (val) {
                this._frame = val;
                this.bitmap.image = this.arr[val | 0];
            }
        });
        var tween = createjs.Tween.get(obj).to({ frame: arr.length - 1 }, time);
        if (autoRemove) {
            tween = tween.call(function (x) {
                if (x.parent)
                    x.parent.removeChild(x);
            }, [bitmap]);
        }
        return tween;
    }
    exports.animTween = animTween;
    function sqrDistance(a, b) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return dx * dx + dy * dy;
    }
    exports.sqrDistance = sqrDistance;
    function intToString(n) {
        n = n | 0;
        var str = n.toString();
        var arr = [];
        var arr2 = [];
        for (var _i = 0, str_1 = str; _i < str_1.length; _i++) {
            var c = str_1[_i];
            arr.push(c);
        }
        for (var i = arr.length - 1, j = 0; i >= 0; --i, ++j) {
            if (j > 0 && j % 3 == 0 && arr[i] != '-') {
                arr2.push(',');
            }
            arr2.push(arr[i]);
        }
        return arr2.reverse().join('');
    }
    exports.intToString = intToString;
    function getParameterByName(name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    exports.getParameterByName = getParameterByName;
    function shuffle(arr) {
        for (var i = 0; i < arr.length; ++i) {
            var j = (Math.random() * arr.length) | 0;
            if (i !== j) {
                var tmp = arr[i];
                arr[i] = arr[j];
                arr[j] = tmp;
            }
        }
    }
    exports.shuffle = shuffle;
    function getQueryString() {
        var obj = {};
        var ss = location.search;
        if (ss && ss[0] == '?') {
            ss = ss.substr(1);
            for (var _i = 0, _a = ss.split('&'); _i < _a.length; _i++) {
                var pair = _a[_i];
                var pos = pair.indexOf('=');
                if (pos >= 0) {
                    var left = decodeURIComponent(pair.substr(0, pos));
                    var right = decodeURIComponent(pair.substr(pos + 1));
                    obj[left] = right;
                }
            }
        }
        return obj;
    }
    exports.getQueryString = getQueryString;
    function encodeQueryString(obj) {
        var str = "";
        for (var key in obj) {
            str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]) + '&';
        }
        return str;
    }
    exports.encodeQueryString = encodeQueryString;
});
define("client/src/SimpleButton", ["require", "exports", "client/src/resource"], function (require, exports, res) {
    "use strict";
    var GLOBAL_SCALE = res.GLOBAL_SCALE;
    var SimpleButton = (function (_super) {
        __extends(SimpleButton, _super);
        function SimpleButton(text) {
            var _this = this;
            _super.call(this);
            this.buttondown = false;
            this.addEventListener("mousedown", function (e) { return _this.onMouseDown(e); });
            this.addEventListener("mouseup", function (e) { return _this.onMouseUp(e); });
            this.addEventListener("click", function (e) { return _this.onClick(); });
            this.label = new createjs.Text(text);
            this.shape = new createjs.Shape();
            this.addChild(this.shape);
            this.addChild(this.label);
            this.label.x = SimpleButton.BUTTON_SIZE.width / 2;
            this.label.font = 20 * GLOBAL_SCALE + "px Arial";
            this.label.textAlign = "center";
            this.label.y = (SimpleButton.BUTTON_SIZE.height - this.label.getMeasuredHeight()) / 2;
            this.repaint();
        }
        SimpleButton.prototype.onClick = function () {
            if (this.onclick)
                this.onclick();
        };
        SimpleButton.prototype.onMouseDown = function (e) {
            this.buttondown = true;
            var stage = this.stage;
            var self = this;
            function func(e) {
                self.removeEventListener("removed", func);
                stage.removeEventListener("stagemouseup", func);
                self.onMouseUp(e);
            }
            this.addEventListener("removed", func);
            stage.addEventListener("stagemouseup", func);
            this.repaint();
        };
        SimpleButton.prototype.onMouseUp = function (e) {
            this.buttondown = false;
            this.repaint();
        };
        SimpleButton.prototype.repaint = function () {
            var g = this.shape.graphics;
            g.clear();
            g.beginStroke("black");
            g.setStrokeStyle(2);
            g.beginFill(this.buttondown ? "rgba(255,0,0,0.2)" : "rgba(0,255,0,0.2)");
            g.drawRect(0, 0, SimpleButton.BUTTON_SIZE.width, SimpleButton.BUTTON_SIZE.height);
            g.endFill();
            g.endStroke();
        };
        SimpleButton.BUTTON_SIZE = { width: 100 * GLOBAL_SCALE, height: 40 * GLOBAL_SCALE };
        return SimpleButton;
    }(createjs.Container));
    exports.SimpleButton = SimpleButton;
});
define("client/src/game/Ball", ["require", "exports", "client/src/resource"], function (require, exports, res) {
    "use strict";
    var GC = res.GraphicConstant;
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var DENSITY = 0.001;
    var GLOBAL_SCALE = res.GLOBAL_SCALE;
    var BALL_SCALE = 1;
    var BALL_IMAGE_SCALE = 1.4;
    var BALL_RADIUS = 45 * BALL_SCALE * GLOBAL_SCALE;
    var BOMB_RADIUS = 50 * BALL_SCALE * GLOBAL_SCALE;
    var IMAGE_CACHE_SIZE = 60 * GLOBAL_SCALE;
    var IMAGE_CACHE_ANCHOR_X = IMAGE_CACHE_SIZE * GLOBAL_SCALE;
    var IMAGE_CACHE_ANCHOR_Y = IMAGE_CACHE_SIZE * GLOBAL_SCALE;
    exports.BALL_BITMAP_RESAMPLE = 1;
    var ballImageCache = {};
    function rotationToIndex(rot) {
        var MAX_ROT = 360;
        var i = rot;
        while (i < 0)
            i += MAX_ROT;
        while (i >= MAX_ROT)
            i -= MAX_ROT;
        i = (i + 0.5) | 0;
        if (i >= MAX_ROT)
            i = MAX_ROT - 1;
        return (i / 10) | 0;
    }
    function indexToRotation(i) {
        return i * 10;
    }
    //清空图片缓存。除了在ids中制定的内容。
    //每次游戏开始的时候，清空这一局游戏中用不到的缓存。节省内存.
    function clearImageCacheExcept(ids) {
        var keys = Object.keys(ballImageCache);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (ids.indexOf(key) < 0) {
                delete ballImageCache[key];
            }
        }
    }
    exports.clearImageCacheExcept = clearImageCacheExcept;
    function cacheImageRotate(id, image, anchorX, anchorY, rot) {
        var cacheArray;
        if (ballImageCache[id]) {
            cacheArray = ballImageCache[id];
        }
        else {
            cacheArray = ballImageCache[id] = [];
        }
        var i = rotationToIndex(rot);
        if (cacheArray[i])
            return false;
        // now cache it
        var container = new createjs.Container();
        var bitmap = new createjs.Bitmap(image);
        bitmap.regX = anchorX;
        bitmap.regY = anchorY;
        if (['bomb', 'bomb0', 'bomb1', 'bomb2', 'bomb3', 'bomb4', 'bomb5'].indexOf(id) >= 0) {
            bitmap.scaleX = GLOBAL_SCALE * BALL_SCALE * 1.0 * exports.BALL_BITMAP_RESAMPLE;
            bitmap.scaleY = GLOBAL_SCALE * BALL_SCALE * 1.0 * exports.BALL_BITMAP_RESAMPLE;
        }
        else {
            bitmap.scaleX = GLOBAL_SCALE * BALL_SCALE * BALL_IMAGE_SCALE * exports.BALL_BITMAP_RESAMPLE;
            bitmap.scaleY = GLOBAL_SCALE * BALL_SCALE * BALL_IMAGE_SCALE * exports.BALL_BITMAP_RESAMPLE;
        }
        bitmap.rotation = indexToRotation(i);
        container.addChild(bitmap);
        container.cache(-IMAGE_CACHE_SIZE * exports.BALL_BITMAP_RESAMPLE, -IMAGE_CACHE_SIZE * exports.BALL_BITMAP_RESAMPLE, IMAGE_CACHE_SIZE * 2 * exports.BALL_BITMAP_RESAMPLE, IMAGE_CACHE_SIZE * 2 * exports.BALL_BITMAP_RESAMPLE);
        cacheArray[i] = container.cacheCanvas;
        return true;
    }
    exports.cacheImageRotate = cacheImageRotate;
    function getImageRotated2(id, rot) {
        var i = rotationToIndex(rot);
        var image = ballImageCache[id][i];
        return image;
    }
    var g_BallId = 123;
    var Ball = (function () {
        function Ball(game, ballDefine, x, y) {
            this.id = (g_BallId++).toString();
            this.linkCount = -1; /**是不是正在被连接中 */
            this.wantBecomeBomb = -1; //炸了以后是不是自己会变成炸弹
            this.noEnergy = false; /**如果是true，表示爆炸之后不会产生能量 */
            this.skillHighlight = false; /**由技能控制要求这个球，高亮起来 */
            this.bombSoundIndex = -1; /**爆炸用哪个声音，-1表示没声音 */
            this.bombAsBomb = false; /**如果是个普通球，在炸的时候是不是像炸弹一样会同时炸掉周围的球 */
            this.blink = false; /** 是否需要闪烁，由BallRenderer来实现闪烁的功能 */
            this.drawScale = 1; /**画的时候是不是需要缩放。对于特殊大球，除了物理上需要放大，画面上也需要放大 */
            this.status = "normal";
            this.bombTick = 0;
            this._dirty = true;
            this._sleep = false;
            this._angle = 0;
            this._game = game;
            var define = this._define = ballDefine;
            this.radius = BALL_RADIUS;
            this.color = define.color;
            this._position = { x: x, y: y };
            this.bitmap = new createjs.Bitmap(null);
            this.bitmap.regX = IMAGE_CACHE_ANCHOR_X * exports.BALL_BITMAP_RESAMPLE;
            this.bitmap.regY = IMAGE_CACHE_ANCHOR_Y * exports.BALL_BITMAP_RESAMPLE;
            this.bitmap.scaleX = 1 / exports.BALL_BITMAP_RESAMPLE;
            this.bitmap.scaleY = 1 / exports.BALL_BITMAP_RESAMPLE;
            if (this.isBomb) {
                this.radius = BOMB_RADIUS;
            }
            // if (!this.isBomb && Math.random() < 0.01)
            // {
            // 	var SCALE = 1.5;
            // 	this.radius *= SCALE;
            // 	this.drawScale = SCALE;
            // }
            this._earRadius = 10 * res.GLOBAL_SCALE;
            if (!this.isBomb) {
                var deg = 110;
                var cos = Math.cos(deg * Math.PI / 180);
                var sin = Math.sin(deg * Math.PI / 180);
                var R = this.radius;
                this._earPos = [
                    {
                        x: R * sin,
                        y: -R * cos
                    },
                    {
                        x: -R * sin,
                        y: -R * cos
                    }
                ];
            }
            else {
                this._earPos = [];
            }
            var createObj = {
                id: this.id,
                radius: this.radius,
                x: x,
                y: y,
                earPos: this._earPos,
                earRadius: this._earRadius,
                cmd: "addBall"
            };
            game.postMessage(createObj);
            this._position = { x: x, y: y };
        }
        Object.defineProperty(Ball.prototype, "isLinking", {
            get: function () { return this.linkCount >= 0; },
            enumerable: true,
            configurable: true
        });
        Ball.fromBody = function (body) {
            return body['_refBall'];
        };
        Object.defineProperty(Ball.prototype, "position", {
            get: function () { return this._position; },
            set: function (val) { this._position = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ball.prototype, "angle", {
            get: function () { return this._angle; },
            set: function (val) { this._angle = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ball.prototype, "isBomb", {
            get: function () {
                var c = this.color;
                return ['bomb', 'bomb0', 'bomb1', 'bomb2', 'bomb3', 'bomb4', 'bomb5'].indexOf(c) >= 0;
            },
            enumerable: true,
            configurable: true
        });
        Ball.prototype.getEarShape = function () {
            var ret = [];
            for (var _i = 0, _a = this._earPos; _i < _a.length; _i++) {
                var cc = _a[_i];
                var x = cc.x;
                var y = cc.y;
                var x2 = void 0;
                var y2 = void 0;
                var cos = Math.cos(this.angle);
                var sin = Math.sin(this.angle);
                x2 = x * cos - y * sin + this.position.x;
                y2 = x * sin + y * cos + this.position.y;
                ret.push({ x: x2, y: y2, r: this._earRadius });
            }
            return ret;
        };
        /**变换球的颜色。假定：不会变成炸弹，当前也不是炸弹，并且球的物理属性都是一样 */
        Ball.prototype.changeColor = function (define) {
            this._define = define;
            this.color = define.color;
            var rotation = this.angle * 180 / Math.PI;
            this.bitmap.image = getImageRotated2(this._define.id, rotation);
        };
        Ball.prototype.getDefine = function () {
            return this._define;
        };
        Ball.prototype.update = function () {
            var rotation = this.angle * 180 / Math.PI;
            this.bitmap.image = getImageRotated2(this._define.id, rotation);
        };
        Ball.prototype.isOutOfSpace = function () {
            var pos = this.position;
            return pos.y > GC.SCREEN_HEIGHT || pos.x < 0 || pos.x > GC.SCREEN_WIDTH;
        };
        /**
         * remove self
         */
        Ball.prototype.remove = function () {
            this._game.postMessage({ cmd: 'delBall', id: this.id });
        };
        /**综合了所有条件的判断：当前球在爆炸的时候，能产生能量吗？ */
        Ball.prototype.canHasEnergy = function () {
            return !this.noEnergy && !this.isBomb && this.color == this._game.getMainBallDefine().color;
        };
        Ball.prototype.clear = function () {
        };
        Ball.MAX_RADIUS = 45 * GC.GLOBAL_SCALE;
        return Ball;
    }());
    exports.Ball = Ball;
});
define("client/src/game/BallRenderer", ["require", "exports", "client/src/resource", "client/src/util", "client/src/game/Ball"], function (require, exports, res, util, Ball_1) {
    "use strict";
    var BallRenderer = (function (_super) {
        __extends(BallRenderer, _super);
        function BallRenderer(game) {
            _super.call(this);
            this._blinkShowFlag = false; /**true 表示，闪烁的球要亮起来。每隔XXX毫秒切换一下，造成闪烁的效果 */
            this._blinkLastTime = 0;
            this._game = game;
            this.hitArea = new createjs.Shape();
            this.setBounds(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
            if (!COIN_IMAGE_RAW) {
                COIN_IMAGE_RAW = new Image();
                COIN_IMAGE_RAW.src = COIN_IMAGE_SRC;
                COIN_IMAGE_RAW.onload = function () {
                    COIN_IMAGE = util.scaleImage(COIN_IMAGE_RAW, res.GLOBAL_SCALE);
                };
                DOT_IMAGE_RAW = new Image();
                DOT_IMAGE_RAW.src = DOT_IMAGE_SRC;
                DOT_IMAGE_RAW.onload = function () {
                    DOT_IMAGE = util.scaleImage(DOT_IMAGE_RAW, res.GLOBAL_SCALE);
                };
            }
        }
        BallRenderer.prototype.draw = function (ctx, ignoreCache) {
            var _this = this;
            if (!this.visible)
                return;
            if (Date.now() - this._blinkLastTime >= 500) {
                this._blinkLastTime = Date.now();
                this._blinkShowFlag = !this._blinkShowFlag;
            }
            var firstBomb = false;
            var isTimeOver = this._game["_isTimeOver"];
            var delayHighlight = isTimeOver && !!this.maskRenderer && this.maskRenderer.visible;
            var isBallHighlight = function (ball) {
                var wantBlink = ball.blink || _this._game.nextLinkIgnoreColor && !_this._game['_isLinking'];
                var wantHighlight = ball.status == 'linking' || ball.status == 'delay_bomb' || ball.skillHighlight || (ball.isBomb && isTimeOver && firstBomb) || (wantBlink && _this._blinkShowFlag);
                return wantHighlight;
            };
            var drawBall = function (ball, highlight) {
                var pos = ball.position;
                var image = ball.bitmap.image;
                if (Ball_1.BALL_BITMAP_RESAMPLE === 1 && ball.drawScale === 1) {
                    var x = (pos.x - ball.bitmap.regX + 0.5) | 0;
                    var y = (pos.y - ball.bitmap.regY + 0.5) | 0;
                    ctx.drawImage(image, x, y);
                }
                else {
                    var invResample = 1 / Ball_1.BALL_BITMAP_RESAMPLE * ball.drawScale;
                    var x = (pos.x - ball.bitmap.regX * invResample + 0.5) | 0;
                    var y = (pos.y - ball.bitmap.regY * invResample + 0.5) | 0;
                    ctx.drawImage(image, 0, 0, image.width, image.height, x, y, image.width * invResample, image.height * invResample);
                }
                if (highlight) {
                    //if (ball.isBomb && isTimeOver) { firstBomb = false; }
                    var canvas2 = void 0;
                    if (0 && g_TempCanvas && g_TempCanvas.width == image.width && g_TempCanvas.height == image.height) {
                        canvas2 = g_TempCanvas;
                    }
                    else {
                        g_TempCanvas = canvas2 = document.createElement('canvas');
                        canvas2.width = image.width;
                        canvas2.height = image.height;
                    }
                    var ctx2 = canvas2.getContext('2d');
                    ctx2.clearRect(0, 0, image.width, image.height);
                    ctx2.drawImage(image, 0, 0);
                    ctx2.globalCompositeOperation = 'source-atop';
                    ctx2.fillStyle = 'rgba(200,200,200,0.8)';
                    ctx2.fillRect(0, 0, image.width, image.height);
                    if (Ball_1.BALL_BITMAP_RESAMPLE === 1 && ball.drawScale === 1) {
                        var x = (pos.x - ball.bitmap.regX + 0.5) | 0;
                        var y = (pos.y - ball.bitmap.regY + 0.5) | 0;
                        ctx.drawImage(canvas2, x, y);
                    }
                    else {
                        var invResample = 1 / Ball_1.BALL_BITMAP_RESAMPLE * ball.drawScale;
                        var x = (pos.x - ball.bitmap.regX * invResample + 0.5) | 0;
                        var y = (pos.y - ball.bitmap.regY * invResample + 0.5) | 0;
                        ctx.drawImage(canvas2, 0, 0, image.width, image.height, x, y, image.width * invResample, image.height * invResample);
                    }
                }
            };
            var balls = this._game.balls;
            if (balls) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                var isTimeOver_1 = this._game["_isTimeOver"];
                var delayHighlightBalls = [];
                for (var i = 0; i < balls.length; ++i) {
                    var ball_1 = balls[i];
                    if (ball_1.status != 'bombed' && ball_1.bitmap.image) {
                        var highlight = isBallHighlight(ball_1);
                        if (highlight) {
                            if (ball_1.isBomb && isTimeOver_1)
                                firstBomb = false; //这个有点奇葩，就是为了在时间结束的时候高亮第一个炸弹
                            if (delayHighlight) {
                                delayHighlightBalls.push(ball_1);
                            }
                            else {
                                drawBall(ball_1, true);
                            }
                        }
                        else {
                            drawBall(ball_1, false);
                        }
                    }
                }
                if (this.lineRenderer) {
                    this.lineRenderer.draw(ctx);
                }
                for (var i = 0; i < balls.length; ++i) {
                    var ball_2 = balls[i];
                    if (ball_2.status == 'linking' || ball_2.status == 'delay_bomb') {
                        var pos = ball_2.position;
                        if (ball_2.linkCount < 3) {
                            if (DOT_IMAGE) {
                                var x = (pos.x - DOT_IMAGE.width / 2) | 0;
                                var y = (pos.y - DOT_IMAGE.height / 2) | 0;
                                ctx.drawImage(DOT_IMAGE, x, y);
                            }
                        }
                        if (ball_2.linkCount >= 3) {
                            if (COIN_IMAGE) {
                                var x = (pos.x - COIN_IMAGE.width / 2) | 0;
                                var y = (pos.y - COIN_IMAGE.height / 2) | 0;
                                ctx.drawImage(COIN_IMAGE, x, y);
                            }
                        }
                    }
                }
                if (this.maskRenderer && this.maskRenderer.visible) {
                    this.maskRenderer.draw(ctx);
                }
                if (delayHighlight) {
                    for (var _i = 0, delayHighlightBalls_1 = delayHighlightBalls; _i < delayHighlightBalls_1.length; _i++) {
                        var ball = delayHighlightBalls_1[_i];
                        drawBall(ball, true);
                    }
                }
            }
            return true;
        };
        BallRenderer.prototype.isVisible = function () { return this.visible; };
        return BallRenderer;
    }(createjs.DisplayObject));
    exports.BallRenderer = BallRenderer;
    var COIN_IMAGE_SRC = 'images/Game/金币icon.png';
    var DOT_IMAGE_SRC = 'images/Game/连接点.png';
    var COIN_IMAGE_RAW;
    var DOT_IMAGE_RAW;
    var COIN_IMAGE;
    var DOT_IMAGE;
    var g_TempCanvas;
});
define("client/src/ImageLoader", ["require", "exports", "client/src/resource", "client/src/GameStage"], function (require, exports, resource_1, GameStage_1) {
    "use strict";
    var g_ImageCache = {};
    var ImageLoader = (function () {
        function ImageLoader(res) {
            this.closed = true;
            this.init(res);
        }
        //点“重试”按钮的时候，调用这个函数
        ImageLoader.prototype.init = function (res) {
            this.close();
            this.closed = false;
            this.res = res.filter(function (x) { return !x.defered; });
            this.deferedRes = res.filter(function (x) { return x.defered; });
            res = this.res;
            for (var i = 0; i < res.length; ++i) {
                var src = this.res[i].src;
                if (src in g_ImageCache) {
                    res[i].img = g_ImageCache[src];
                    res[i].loaded = true;
                    res[i].loadError = false;
                }
                else {
                    res[i].img = new Image();
                    res[i].loaded = false;
                    res[i].loadError = false;
                    var f1 = this._imgComplete.bind(this, res[i]);
                    var f2 = this._imgError.bind(this, res[i]);
                    res[i].f1 = f1;
                    res[i].f2 = f2;
                    res[i].img.addEventListener("load", f1);
                    res[i].img.addEventListener("error", f2);
                    res[i].img.src = ImageLoader.wrapFileVersion(this.res[i].src);
                }
            }
            this._refreshUI();
            this._checkLoaded();
        };
        ImageLoader.prototype.loadDeferedImages = function () {
            this.deferedRes.forEach(function (item) {
                item.img = new Image();
                item.img.src = ImageLoader.wrapFileVersion(item.src);
                if (typeof item.width == 'number')
                    item.img.width = item.width;
                if (typeof item.height == 'number')
                    item.img.height = item.height;
            });
        };
        ImageLoader.wrapFileVersion = function (src) {
            var src2 = src;
            if (window['FILE_VERSIONS']) {
                var fv = window['FILE_VERSIONS'];
                for (var i = 0; i < fv.length; ++i) {
                    var name_1 = fv[i][0];
                    if (src2 == name_1) {
                        src = src + "?q=" + fv[i][1];
                        break;
                    }
                }
            }
            return src;
        };
        ImageLoader.prototype.getImage = function (id) {
            for (var i = 0; i < this.res.length; ++i) {
                if (this.res[i].id == id)
                    return this.res[i].img;
            }
            for (var i = 0; i < this.deferedRes.length; ++i) {
                if (this.deferedRes[i].id == id)
                    return this.deferedRes[i].img;
            }
            console.error("getImage error,id = " + id);
            return null;
        };
        ImageLoader.prototype.close = function () {
            if (this.closed)
                return;
            var res = this.res;
            for (var i = 0; i < this.res.length; ++i) {
                res[i].img.removeEventListener("load", res[i].f1);
                res[i].img.removeEventListener("error", res[i].f2);
            }
        };
        ImageLoader.prototype._imgComplete = function (item) {
            item.loaded = true;
            //console.error(item.src + ", load ok");
            g_ImageCache[item.src] = item.img;
            this._checkLoaded();
        };
        ImageLoader.prototype._imgError = function (item) {
            item.loadError = true;
            console.error(item.src + ", load error");
            this._checkLoaded();
            /*
            if (this.spr.stage)
            {
                if (!window["bodyunload"])
                {
                    alert(item.src + ",载入失败，要刷新页面才能解决问题")
                }
            }*/
        };
        ImageLoader.prototype._checkLoaded = function () {
            var _this = this;
            if (this.closed)
                return;
            var loadedCount = 0;
            var hasError = false;
            for (var i = 0; i < this.res.length; ++i) {
                if (this.res[i].loaded)
                    ++loadedCount;
                if (this.res[i].loadError)
                    hasError = true;
            }
            if (loadedCount == this.res.length) {
                this.loadDeferedImages();
                setTimeout(function () {
                    if (_this.onComplete)
                        _this.onComplete();
                }, 1);
                this.close();
            }
            else if (hasError) {
                if (this.onError)
                    this.onError();
                this.close();
            }
            else {
                if (this.onProgress)
                    this.onProgress(loadedCount, this.res.length);
            }
            this._refreshUI();
        };
        ImageLoader.prototype._refreshUI = function () {
            if (!this.spr) {
                this.spr = new createjs.Container();
                this.spr.addChild(new createjs.Shape());
                this.spr.addChild(new createjs.Text());
            }
            {
                var shape = this.spr.getChildAt(0);
                var g = shape.graphics;
                g.clear();
                g.beginFill('white');
                g.drawRect(0, 0, resource_1.GraphicConstant.SCREEN_WIDTH, resource_1.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
            }
            {
                var textField = this.spr.getChildAt(1);
                var text = [];
                text.push("正在载入资源");
                for (var i = 0; i < this.res.length; ++i) {
                    var item = this.res[i];
                    text.push((item.loaded ? "☑" : "☐") + " " + item.src);
                }
                textField.text = text.join("\n");
            }
            if (this.spr.stage) {
                GameStage_1.GameStage.instance.makeDirty();
            }
        };
        return ImageLoader;
    }());
    exports.ImageLoader = ImageLoader;
});
define("client/src/hall/HallRes", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.res = [
        { id: 'hall/headbar_background', src: 'images/hall/headbar_background.png' },
        { id: 'hall/progressbar', src: 'images/hall/_0045_图层-13.png' },
        { id: 'hall/plus', src: 'images/hall/_0047_图层-32-副本.png' },
        { id: 'hall/star', src: 'images/hall/_0048_图层-10.png' },
        { id: 'hall/panel_background', src: 'images/hall/_0091_图层-19-副本-7.png' },
        { id: 'hall/heart', src: 'images/hall/_0076_图层-28-副本-4.png' },
        { id: 'hall/yellow_heart', src: 'images/hall/_0077_图层-28-副本-2.png' },
        { id: 'hall/mail', src: 'images/hall/_0067_图层-17.png' },
        { id: 'hall/heart_text_bg', src: 'images/hall/_0060_图层-19.png' },
        //好友面板
        { id: 'hall/friend_background', src: 'images/hall/_0020_图层-18-副本-2.png' },
        { id: 'hall/friend_title_text', src: 'images/hall/_0062_好友排行.png' },
        { id: 'hall/friend_1', src: 'images/hall/_0080_1.png' },
        { id: 'hall/friend_2', src: 'images/hall/_0079_2.png' },
        { id: 'hall/friend_3', src: 'images/hall/_0078_3.png' },
        { id: 'hall/friend_0', src: 'images/hall/0.png' },
        { id: 'hall/friend_4', src: 'images/hall/4.png' },
        { id: 'hall/friend_5', src: 'images/hall/5.png' },
        { id: 'hall/friend_6', src: 'images/hall/6.png' },
        { id: 'hall/friend_7', src: 'images/hall/7.png' },
        { id: 'hall/friend_8', src: 'images/hall/8.png' },
        { id: 'hall/friend_9', src: 'images/hall/9.png' },
        { id: 'hall/friend_icon_background', src: 'images/hall/_0081_图层-4.png' },
        { id: 'hall/friend_invite', src: 'images/hall/invite_friends.png' },
        //everyday task bar
        { id: 'hall/task_star0', src: 'images/hall/_0070_图层-29-副本-3.png' },
        { id: 'hall/task_star1', src: 'images/hall/_0069_图层-29-副本-2.png' },
        { id: 'hall/gear', src: 'images/hall/_0071_图层-16.png' },
        { id: 'hall/daily_task_text', src: 'images/hall/_0063_每日任务.png' },
        { id: 'hall/daily_task_progress_bg', src: 'images/hall/_0065_图层-27-副本.png' },
        //bottom button
        { id: 'hall/side_button', src: 'images/hall/_0075_图层-15.png' },
        { id: 'hall/center_button', src: 'images/hall/123456565.png' },
        { id: 'hall/button_text_game', src: 'images/hall/_0073_-游戏.png' },
        { id: 'hall/button_text_weekly_task', src: 'images/hall/_0074_-冒险.png' },
        { id: 'hall/button_text_carry', src: 'images/hall/_0041_携带.png' },
        { id: 'hall/button_start', src: 'images/hall/开始.png' },
        { id: 'hall/pet0', src: 'images/Balls/1.png' },
        { id: 'hall/pet1', src: 'images/Balls/2.png' },
        { id: 'hall/pet2', src: 'images/Balls/3.png' },
        { id: 'hall/pet3', src: 'images/Balls/4.png' },
        { id: 'hall/pet4', src: 'images/Balls/5.png' },
        { id: 'hall/pet5', src: 'images/Balls/6.png' },
        { id: 'hall/pet6', src: 'images/Balls/7.png' },
        { id: 'hall/pet7', src: 'images/Balls/8.png' },
        { id: 'hall/pet8', src: 'images/Balls/9.png' },
        { id: 'hall/pet9', src: 'images/Balls/10.png' },
        { id: 'hall/pet10', src: 'images/Balls/11.png' },
        { id: 'hall/pet11', src: 'images/Balls/12.png' },
        { id: 'hall/pet12', src: 'images/Balls/13.png' },
        { id: 'hall/pet13', src: 'images/Balls/14.png' },
        { id: 'hall/pet14', src: 'images/Balls/15.png' },
        { id: 'hall/pet15', src: 'images/Balls/16.png' },
        { id: 'hall/pet16', src: 'images/Balls/17.png' },
        { id: 'hall/pet17', src: 'images/Balls/18.png' },
        { id: 'hall/pet18', src: 'images/Balls/19.png' },
        { id: 'hall/pet19', src: 'images/Balls/20.png' },
        { id: 'hall/pet20', src: 'images/Balls/21.png' },
        { id: 'hall/pet21', src: 'images/Balls/22.png' },
        { id: 'hall/pet22', src: 'images/Balls/23.png' },
        { id: 'hall/pet23', src: 'images/Balls/24.png' },
        { id: 'hall/pet24', src: 'images/Balls/25.png' },
        { id: 'hall/pet25', src: 'images/Balls/26.png' },
        { id: 'hall/pet26', src: 'images/Balls/27.png' },
        { id: "hall/weekly_task_title", src: "images/hall/_0049_本周冒险.png" },
        { id: 'hall/weekly_task_bg0', src: 'images/hall/_0050_图层-9.png' },
        { id: 'hall/weekly_task_bg1', src: 'images/hall/_0051_图层-18-副本-2.png' },
        { id: 'hall/weekly_task_bg2', src: 'images/hall/已完成.png' },
        { id: 'hall/weekly_task_unfinish', src: 'images/hall/_0053_图层-17-副本.png' },
        { id: 'hall/weekly_task_finished', src: 'images/hall/_0037_图层-8.png' },
        { id: 'hall/weekly_task_prize0', src: 'images/hall/_0022_图层-42-副本-3.png' },
        { id: 'hall/weekly_task_prize1', src: 'images/hall/-_0005_小金币.png' },
        { id: 'hall/weekly_task_prize2', src: 'images/hall/_0077_图层-28-副本-2.png' },
        { id: 'hall/weekly_task_desc', src: 'images/hall/冒险介绍.png' },
        { id: 'hall/pager_point_empty', src: 'images/hall/_0055_图层-6-副本.png' },
        { id: 'hall/pager_point_full', src: 'images/hall/_0056_图层-6.png' },
        { id: 'hall/pet_bg', src: 'images/hall/_0081_图层-4.png' },
        { id: 'hall/pet_bg_sel', src: 'images/hall/选中状态.png' },
        { id: 'hall/pet_bg_unknown', src: 'images/hall/_0039_图层-30-副本.png' },
        { id: 'hall/pet_question_mark', src: 'images/hall/_0057_图层-34-副本.png' },
        { id: 'hall/pet_progress', src: 'images/hall/_0058_图层-36-副本.png' },
        { id: 'hall/pet_progress_bg', src: 'images/hall/_0059_图层-5.png' },
        { id: 'hall/pet_progress2', src: 'images/hall/pet_progress.png' },
        { id: 'hall/pet_progress_bg2', src: 'images/hall/pet_progress_bg.png' },
        { id: 'hall/pet_unlock', src: 'images/hall/升级.png' },
        { id: 'hall/game_item_0', src: 'images/hall/gameitem1.png' },
        { id: 'hall/game_item_1', src: 'images/hall/gameitem2.png' },
        { id: 'hall/game_item_2', src: 'images/hall/gameitem3.png' },
        { id: 'hall/game_item_3', src: 'images/hall/gameitem4.png' },
        { id: 'hall/game_item_4', src: 'images/hall/gameitem5.png' },
        { id: 'hall/game_item_5', src: 'images/hall/gameitem6.png' },
        { id: 'hall/game_item_0_sel', src: 'images/hall/gameitem1_sel.png' },
        { id: 'hall/game_item_1_sel', src: 'images/hall/gameitem2_sel.png' },
        { id: 'hall/game_item_2_sel', src: 'images/hall/gameitem3_sel.png' },
        { id: 'hall/game_item_3_sel', src: 'images/hall/gameitem4_sel.png' },
        { id: 'hall/game_item_4_sel', src: 'images/hall/gameitem5_sel.png' },
        { id: 'hall/game_item_5_sel', src: 'images/hall/gameitem6_sel.png' },
        { id: 'hall/game_item_locked', src: 'images/hall/-_0013_未开放.png' },
        { id: 'hall/game_item_price_bg', src: 'images/hall/-_0014_道具价格底.png' },
        { id: 'hall/game_item_price_icon', src: 'images/hall/-_0015_道具价格icon.png' },
        { id: 'hall/game_item_price_1800', src: 'images/hall/-_0016_1800价格.png' },
        { id: 'hall/game_item_price_1500', src: 'images/hall/-_0017_1500价格.png' },
        { id: 'hall/game_item_price_1000', src: 'images/hall/-_0018_1000-价格.png' },
        { id: 'hall/game_item_price_500', src: 'images/hall/-_0019_500价格.png' },
        //{ id: 'hall/game_item_background', src: 'images/hall/_0081_图层-4.png' },
        //{ id: 'hall/game_item_background_sel', src: 'images/hall/选中状态11111.png' },
        { id: 'hall/game_item_empty_background', src: 'images/hall/_0039_图层-30-副本.png' },
        { id: 'hall/game_item_price_background', src: 'images/hall/_0015_图层-27-副本-2.png' },
        //{ id: 'hall/ready_text', src: 'images/hall/_0014_准-备.png' },
        { id: 'hall/game_item_sel_text', src: 'images/hall/_0013_道具使用选择.png' },
        { id: 'hall/game_item_title_text', src: 'images/hall/-_0020_游戏道具.png' },
        //游戏结算：宠物升级
        { id: 'pet/levelup_background', src: 'images/hall/-_0004_结算底.png' },
        { id: 'pet/levelup_progress', src: 'images/hall/进度条上.png' },
        { id: 'pet/levelup_progress_background', src: 'images/hall/进度条下.png' },
        { id: 'pet/levelup_text', src: 'images/hall/Level-up.png' },
        //游戏结算
        { id: 'hall/score/pet_add_text', src: 'images/hall/-_0004_宠物加成.png' },
        { id: 'hall/score/item_add_text', src: 'images/hall/-_0003_道具加成.png' },
        { id: 'hall/score/score_bg', src: 'images/hall/分数结算底.png' },
        { id: 'hall/score/week_high_score', src: 'images/hall/-_0002_本周最高分.png' },
        { id: 'hall/score/historical_high_score', src: 'images/hall/-_0001_历史最高分.png' },
        { id: 'hall/score/score_digits', src: 'images/hall/win_Number_score72.png' },
        { id: 'hall/score/$', src: 'images/hall/分数结算.png' },
        //邮件
        // 新的背景
        { id: 'hall/mail/bkg', src: 'images/hall/item_bkg.png' },
        { id: 'hall/mail/btnclose', src: 'images/hall/btnClose.png' },
        { id: 'hall/mail/btngetmail', src: 'images/hall/btnGetMail.png' },
        { id: 'hall/mail/btngetallmail', src: 'images/hall/btnGetAllMail.png' },
        { id: 'hall/mail/title', src: 'images/hall/_0019_邮-箱.png' },
        { id: 'hall/mail/tip', src: 'images/hall/_0066_图层-18.png' },
        { id: 'hall/ok_button', src: 'images/hall/ok_button.png' },
        { id: 'hall/cancel_button', src: 'images/hall/cancel_button.png' },
        { id: 'hall/dialog_bg', src: 'images/hall/dialog_bg.png' },
        { id: 'hall/buy_button', src: 'images/hall/buy_button.png' },
        { id: 'hall/button_text_shop', src: 'images/hall/未标题-4.png' },
        //shop
        { id: 'hall/button_text_buy', src: 'images/hall/_0088_购入.png' },
        { id: 'hall/gift_bg', src: 'images/hall/_0089_图层-41-副本.png' },
        { id: 'hall/shop_title', src: 'images/hall/_0083_宠物扭蛋.png' },
        //weekly task bitmaps
        { id: 'hall/weekly_task_progress_text', src: 'images/hall/-_0006_冒险进度.png' },
        { id: 'hall/weekly_task_progress_bg', src: 'images/hall/-_0005__0065_图层-27-副本.png' },
        { id: 'hall/weekly_task_prize_final', src: 'images/hall/-_0003__0089_图层-41-副本.png' },
        { id: 'hall/pet_select', src: 'images/hall/宠物准备.png' },
        { id: 'tutorial/pet', src: 'images/tutorial/pet.png' },
        { id: 'tutorial/frame', src: 'images/tutorial/frame.png' },
        { id: 'hall/dialog_title', src: 'images/hall/未标题-411.png' },
        { id: 'hall/friend_info_title', src: 'images/hall/_0000_名-片.png' },
        { id: 'hall/friend_info_bg', src: 'images/hall/_0001_携带果冻：-最高分数：-最好连击：-最长连接：-果冻数量：-果冻总等级：-总消除果冻：.png' },
        { id: 'hall/sound_on', src: 'images/hall/_0002_图层-4.png' },
        { id: 'hall/sound_off', src: 'images/hall/静音.png' },
        { id: 'hall/btn_remove_friend', src: 'images/hall/btn_remove_friend.png' },
        { id: 'hall/btn_add_heart', src: 'images/hall/btn_add_heart.png' },
        { id: 'hall/payment/buy_button', src: 'images/hall/btn_buy.png' },
        { id: 'hall/payment/promote_yellow_bg', src: 'images/hall/_0008_图层-31-副本.png' },
        { id: 'hall/payment/promote_red_bg', src: 'images/hall/_0003_图层-31.png' },
        { id: 'hall/payment/promote_8%', src: 'images/hall/_0002_优惠8.png' },
        { id: 'hall/payment/promote_10%', src: 'images/hall/_0007_优惠10.png' },
        { id: 'hall/payment/promote_20%', src: 'images/hall/_0006_优惠20-副本.png' },
        { id: 'hall/payment/promote_30%', src: 'images/hall/_0005_优惠30.png' },
        { id: 'hall/payment/promote_25%', src: 'images/hall/_0004_优惠25.png' },
        { id: 'hall/payment/promote_60%', src: 'images/hall/-_0000_优惠60.png' },
        { id: 'hall/payment/promote_48%', src: 'images/hall/优惠百分之48.png' },
        { id: 'hall/payment/promote_200%', src: 'images/hall/优惠百分之200.png' },
        { id: 'hall/payment/promote_once', src: 'images/hall/限购.png' },
        { id: 'hall/payment/buy_coin_title', src: 'images/hall/_0085_金币交换.png' },
        { id: 'hall/payment/buy_diamond_title', src: 'images/hall/_0018_钻石购入.png' },
        { id: 'hall/payment/buy_heart_title', src: 'images/hall/-_0001_体力回复.png' },
        //{ id: 'hall/mail_text', src: 'images/hall/邮箱文字.png' },
        { id: 'hall/shop_text', src: 'images/hall/扭蛋.png' },
        { id: 'hall/week_score_number_digit', src: 'images/Game/连线数量.png' },
        { id: 'hall/btn_weekScore', src: 'images/hall/-_0000_图层-1.png' },
        { id: 'hall/btn_historicalScore', src: 'images/hall/-_0001_周排行-_-历史排行.png' },
        { id: 'hall/gift_box', src: 'images/hall/-_0001_图层-41-副本.png' },
        { id: 'hall/click_gift_text', src: 'images/hall/dianji.png' },
        { id: 'hall/pet_not_get', src: 'images/hall/宠物准备1111.png' },
        { id: 'hall/face_mask', src: 'images/hall/_0081_图层-41111.png' },
        { id: 'hall/face_mask2', src: 'images/hall/未标题-6.png' },
        //search friend dialog_bg
        { id: 'hall/search_friend_title_text', src: 'images/hall/-_0000s_0000_添加好友.png' },
        { id: 'hall/search_friend_text', src: 'images/hall/-_0000s_0005_搜索好友：.png' },
        { id: 'hall/search_button', src: 'images/hall/search_btn.png' },
        { id: 'hall/share_button', src: 'images/hall/share_btn.png' },
        { id: 'hall/share_text', src: 'images/hall/-_0000s_0006_通过分享链接进入游戏的玩家将自动与您建立好友关系。.png' },
        { id: 'hall/add_friend_button', src: 'images/hall/add_btn.png' },
        { id: 'hall/default_user_headicon', src: 'images/hall/default_user_head.png' },
        { id: 'hall/agree_button', src: 'images/hall/-_0001_同意.png' },
        { id: 'hall/reject_button', src: 'images/hall/-_0000_拒绝.png' },
        { id: 'hall/pet_lock_icon_tip', src: 'images/hall/锁.png' },
        //宠物升级动画
        { id: 'hall/petlv/text', src: 'images/hall/petlevelup/-_0014_消除分数UP：.png' },
        { id: 'hall/petlv/right_arrow', src: 'images/hall/petlevelup/-_0000_-→--副本.png' },
        { id: 'hall/petlv/up_arrow', src: 'images/hall/petlevelup/-_0001_-→-.png' },
        { id: 'hall/petlv/num_digits', src: 'images/hall/petlevelup/petlevelup_anim_score_num.png' },
        //宠物购买界面，new图标
        { id: 'hall/shop_new_icon', src: 'images/hall/-_0006_NEW.png' },
        //宠物购买页面，升级字样
        { id: 'hall/shop_skill_levelup_text', src: 'images/hall/-_0005_技能等级.png' },
        { id: 'hall/game_item_help_button', src: 'images/hall/214423.png' },
        { id: 'hall/game_item_help_text', src: 'images/hall/-_0001_连接6个果冻-就会生成炸弹.png' },
        { id: 'hall/game_item_help_title', src: 'images/hall/未标题-1.png' },
        { id: 'hall/shop_first_free', src: 'images/hall/首次免费.png' },
        { id: 'hall/lama_tip_text', src: 'images/hall/辣妈群推广.png' },
        { id: 'hall/friend_self_frame', src: 'images/hall/kuang.png' },
        { id: 'hall/friend_first_icon', src: 'images/hall/皇冠.png' },
        { id: 'hall/new_text_tip', src: 'images/hall/new.png' },
        { id: 'hall/sale_text_tip', src: 'images/hall/特卖.png' },
        { id: 'hall/limit_sale_text_tip', src: 'images/hall/限时翻倍.png' },
        { id: 'hall/+10s_dialog_title', src: 'images/hall/-_0005_增-援.png' },
        { id: 'hall/want_more_heart', src: 'images/hall/-_0000_没有足够的爱心！.png' },
        { id: 'hall/want_10s', src: 'images/hall/-_0000_是否延长10秒倒计时？.png' },
        { id: 'hall/want_more_coin', src: 'images/hall/-_0001_没有足够的金币！.png' },
        { id: 'hall/want_more_diamond', src: 'images/hall/-_0002_没有足够的钻石！.png' },
        { id: 'hall/NeedMoreValueDialog_item_diamond', src: 'images/hall/未标题-5.png' },
        { id: 'hall/NeedMoreValueDialog_item_coin', src: 'images/hall/未标题-61111.png' },
        { id: 'hall/NeedMoreValueDialog_need_button', src: 'images/hall/未标题-4213213.png' },
        { id: 'hall/help_text_weekly_highscore_award', src: 'images/hall/未标题-10.png', defered: true, width: 514, height: 588 },
        { id: 'hall/help_text_historical_highscore_award', src: 'images/hall/未标题-11.png', defered: true, width: 512, height: 565 },
        //一个动画
        { id: 'hall/up_arrow', src: 'images/hall/-_0002_沐浴1_0002_→.png' },
        { id: 'hall/historical_high_score_up_text', src: 'images/hall/-_0000_历史纪录UP.png' },
        { id: 'hall/weekly_high_score_up_text', src: 'images/hall/-_0003_周纪录UP.png' },
        { id: 'hall/high_score_up_light_effect', src: 'images/hall/光晕.png' },
        //又一个动画
        { id: 'hall/position_up_text', src: 'images/hall/-_0002_周排名上升.png' },
        { id: 'hall/position_up_digits', src: 'images/hall/-_0001_0123456789.png' },
        { id: 'hall/position_up_arrow', src: 'images/hall/-_0000_→.png' },
        { id: 'hall/position_up_light_effect', src: 'images/hall/超过好友.png' },
        { id: 'hall/pet_button_tip_when_coin>1w', src: 'images/hall/1wtips.png' },
        { id: 'hall/weekly_task_satisfied_label', src: 'images/hall/未标题-3.png' },
        { id: 'hall/download_button_image', src: 'images/hall/下载.png' },
        { id: 'hall/match/matching_text', src: 'images/hall/-_0001_匹配中…….png' },
        { id: 'hall/match/matching_text_dot', src: 'images/hall/加载中.png' },
        { id: 'hall/match/vs_text', src: 'images/hall/-_0002_VS.png' },
        { id: 'hall/match/leave_match_button', src: 'images/hall/取消匹配.png' },
        { id: 'hall/match/icon_frame', src: 'images/hall/透明边框.png' },
        { id: 'hall/small_weekly_task_button', src: 'images/hall/small_button1.png' },
        { id: 'hall/small_activity_button', src: 'images/hall/small_button2.png' },
        { id: 'hall/small_rank_button', src: 'images/hall/small_button3.png' },
        { id: 'hall/small_help_button', src: 'images/hall/small_button4.png' },
        { id: 'hall/button_text_match', src: 'images/hall/对战.png' },
        { id: 'hall/match/match_button1', src: 'images/hall/1v1.png' },
        { id: 'hall/match/match_button2', src: 'images/hall/混战.png' },
        { id: 'hall/match/match_button3', src: 'images/hall/大师赛.png' },
        { id: 'hall/match/match_button_lock', src: 'images/hall/锁1111.png' },
        { id: 'hall/match/button2_lock_text', src: 'images/hall/-_0002_分数首次达到-250‘000解锁.png' },
        { id: 'hall/match/button3_lock_text', src: 'images/hall/-_0001_分数首次达到-500‘000解锁.png' },
        { id: 'hall/match/win', src: 'images/hall/-_0001_胜利.png' },
        { id: 'hall/match/loss', src: 'images/hall/-_0000_失败.png' },
        { id: 'hall/blink_star', src: 'images/hall/星.png' },
        { id: 'hall/rank_list_panel_title', src: 'images/hall/排行.png' },
        { id: 'hall/share_button_text2', src: 'images/hall/分享给好友.png' },
        { id: 'hall/continue_match', src: 'images/hall/继续对战.png' },
        { id: 'hall/return_match', src: 'images/hall/返回对战.png' },
        //{ id: 'hall/help_image', src: 'images/hall/帮助1.png' },
        { id: 'hall/help_tutorial_button', src: 'images/hall/帮助2.png' },
        { id: 'hall/headbar_exp_progress', src: 'images/hall/-_0027_经验进度条.png' },
        { id: 'hall/friend_panel_background', src: 'images/hall/好友排行区底.png' },
        { id: 'hall/week_sort_btn_sel', src: 'images/hall/-_0012_周排行（选中）.png' },
        { id: 'hall/week_sort_btn', src: 'images/hall/-_0013_周排行（未选中）.png' },
        { id: 'hall/historical_sort_btn_sel', src: 'images/hall/-_0011_世界排行（选中）.png' },
        { id: 'hall/historical_sort_btn', src: 'images/hall/-_0014_世界排行（未选中）.png' },
        { id: 'hall/sort_btn_bg', src: 'images/hall/-_0005_周排行世界排行选中底.png' },
        { id: 'hall/full_heart', src: 'images/hall/-_0017_体力.png' },
        { id: 'hall/empty_heart', src: 'images/hall/-_0018_未填充体力.png' },
        { id: 'hall/add_heart_btn', src: 'images/hall/-_0016_体力加号.png' },
        { id: 'hall/btn_send_heart', src: 'images/hall/-_0008_送心（激活）.png' },
        { id: 'hall/btn_send_heart_invalid', src: 'images/hall/-_0007_送心（灰色）.png' },
        { id: 'hall/friend_pos1', src: 'images/hall/-_0022_1.png' },
        { id: 'hall/friend_pos2', src: 'images/hall/-_0003_2.png' },
        { id: 'hall/friend_pos3', src: 'images/hall/-_0002_3.png' },
        { id: 'hall/bottom_pet_icon_bg', src: 'images/hall/-_0007_宠物底圈.png' },
        { id: 'hall/out_text', src: 'images/hall/-_0008_出战.png' },
        { id: 'hall/new_pet_button', src: 'images/hall/-_0004_换宠-_-升级.png' },
        { id: 'hall/new_download_button', src: 'images/hall/-_0020_下载.png' },
        { id: 'hall/new_bottom_start_game_button', src: 'images/hall/-_0006_开始游戏.png' },
        { id: 'hall/new_bottom_start_match_button', src: 'images/hall/-_0005_PK-对战.png' },
        { id: 'pet_outline_0', src: 'images/BallOutline/1.png' },
        { id: 'pet_outline_1', src: 'images/BallOutline/2.png' },
        { id: 'pet_outline_2', src: 'images/BallOutline/3.png' },
        { id: 'pet_outline_3', src: 'images/BallOutline/4.png' },
        { id: 'pet_outline_4', src: 'images/BallOutline/5.png' },
        { id: 'pet_outline_5', src: 'images/BallOutline/6.png' },
        { id: 'pet_outline_6', src: 'images/BallOutline/7.png' },
        { id: 'pet_outline_7', src: 'images/BallOutline/8.png' },
        { id: 'pet_outline_8', src: 'images/BallOutline/9.png' },
        { id: 'pet_outline_9', src: 'images/BallOutline/10.png' },
        { id: 'pet_outline_10', src: 'images/BallOutline/11.png' },
        { id: 'pet_outline_11', src: 'images/BallOutline/12.png' },
        { id: 'pet_outline_12', src: 'images/BallOutline/13.png' },
        { id: 'pet_outline_13', src: 'images/BallOutline/14.png' },
        { id: 'pet_outline_14', src: 'images/BallOutline/15.png' },
        { id: 'pet_outline_15', src: 'images/BallOutline/16.png' },
        { id: 'pet_outline_16', src: 'images/BallOutline/17.png' },
        { id: 'pet_outline_17', src: 'images/BallOutline/18.png' },
        { id: 'pet_outline_18', src: 'images/BallOutline/19.png' },
        { id: 'pet_outline_19', src: 'images/BallOutline/20.png' },
        { id: 'pet_outline_20', src: 'images/BallOutline/21.png' },
        { id: 'pet_outline_21', src: 'images/BallOutline/22.png' },
        { id: 'pet_outline_22', src: 'images/BallOutline/23.png' },
        { id: 'pet_outline_23', src: 'images/BallOutline/24.png' },
        { id: 'pet_outline_24', src: 'images/BallOutline/25.png' },
        { id: 'pet_outline_25', src: 'images/BallOutline/26.png' },
        { id: 'pet_outline_26', src: 'images/BallOutline/27.png' },
        { id: 'pet_name_0', src: 'images/BallName/0.png' },
        { id: 'pet_name_1', src: 'images/BallName/1.png' },
        { id: 'pet_name_2', src: 'images/BallName/2.png' },
        { id: 'pet_name_3', src: 'images/BallName/3.png' },
        { id: 'pet_name_4', src: 'images/BallName/4.png' },
        { id: 'pet_name_5', src: 'images/BallName/5.png' },
        { id: 'pet_name_6', src: 'images/BallName/6.png' },
        { id: 'pet_name_7', src: 'images/BallName/7.png' },
        { id: 'pet_name_8', src: 'images/BallName/8.png' },
        { id: 'pet_name_9', src: 'images/BallName/9.png' },
        { id: 'pet_name_10', src: 'images/BallName/10.png' },
        { id: 'pet_name_11', src: 'images/BallName/11.png' },
        { id: 'pet_name_12', src: 'images/BallName/12.png' },
        { id: 'pet_name_13', src: 'images/BallName/13.png' },
        { id: 'pet_name_14', src: 'images/BallName/14.png' },
        { id: 'pet_name_15', src: 'images/BallName/15.png' },
        { id: 'pet_name_16', src: 'images/BallName/16.png' },
        { id: 'pet_name_17', src: 'images/BallName/17.png' },
        { id: 'pet_name_18', src: 'images/BallName/18.png' },
        { id: 'pet_name_19', src: 'images/BallName/19.png' },
        { id: 'pet_name_20', src: 'images/BallName/20.png' },
        { id: 'pet_name_21', src: 'images/BallName/21.png' },
        { id: 'pet_name_22', src: 'images/BallName/22.png' },
        { id: 'pet_name_23', src: 'images/BallName/23.png' },
        { id: 'pet_name_24', src: 'images/BallName/24.png' },
        { id: 'pet_name_25', src: 'images/BallName/25.png' },
        { id: 'pet_name_26', src: 'images/BallName/26.png' },
        { id: 'hall/pet_panel_background', src: 'images/hall/-_0002_底图.png' },
        { id: 'hall/pet_icon_background_selected', src: 'images/hall/-_0009_选中框.png' },
        { id: 'hall/pet_icon_background_unselected', src: 'images/hall/-_0008_未选中框.png' },
        { id: 'hall/pet_icon_current_tip', src: 'images/hall/-_0001_出战tips.png' },
        { id: 'hall/pet_progress_big', src: 'images/hall/pet_panel_big_progressbar.png' },
        { id: 'hall/pet_progress_small', src: 'images/hall/pet_panel_small_progressbar.png' },
        { id: 'hall/pet_progress_big_bg', src: 'images/hall/-_0011_进度条.png' },
        { id: 'hall/pet_progress_small_bg', src: 'images/hall/-_0005_小进度条.png' },
        { id: 'hall/pet_panel_lv_chars', src: 'images/hall/-_0010_等级数字.png' },
        { id: 'hall/pet_panel_exp_chars', src: 'images/hall/-_0000_进度条数字.png' },
        { id: 'hall/new_pager_point_empty', src: 'images/hall/-_0007_页面点.png' },
        { id: 'hall/new_pager_point_full', src: 'images/hall/-_0006_选中点.png' },
        { id: 'hall/pet_question_mark_2', src: 'images/hall/-_0001_未解锁？.png' },
        { id: 'hall/pet_not_get_text', src: 'images/hall/-_0002_未拥有.png' },
        { id: 'hall/return_button', src: 'images/hall/-_0005_返回.png' },
        { id: 'hall/pet_shop_button', src: 'images/hall/-_0006_宠物商店.png' },
        { id: 'hall/carry_button', src: 'images/hall/carry_button.png' },
        { id: 'hall/shop_free_icon', src: 'images/hall/-_0004_免费tips.png' },
        { id: 'hall/pet_shop_background', src: 'images/hall/-_0000s_0000_宠物扭蛋弹窗.png' },
        { id: 'hall/pet_shop_buy_button', src: 'images/hall/-_0003_扭蛋按钮.png' },
        { id: 'hall/pet_shop_gift_icon', src: 'images/hall/-_0001_礼盒.png' },
        { id: 'hall/pet_shop_price_chars', src: 'images/hall/-_0000_扭蛋价格数字.png' },
        { id: 'hall/pet_lvup_not_get_text', src: 'images/hall/-_0001_未获得宠物.png' },
        { id: 'hall/pet_lvup_lv_text', src: 'images/hall/-_0002_等级字体.png' },
        { id: 'hall/pet_lvup_progress', src: 'images/hall/-_0003_进度条1111.png' },
        { id: 'hall/pet_lvup_progress_chars', src: 'images/hall/-_0000_进度百分比字体111.png' },
        { id: 'hall/match_panel_background', src: 'images/hall/-_0003_底.png' },
        { id: 'hall/match_button_lock_mask', src: 'images/hall/-_0001_遮盖.png' },
        { id: 'hall/big_return_button', src: 'images/hall/-_0005_返--回.png' },
        { id: 'hall/match_myinfo_background', src: 'images/hall/-_0002_名片栏.png' },
        { id: 'hall/match_title_text', src: 'images/hall/-_0004_世界对战.png' },
        { id: 'hall/matching_background', src: 'images/hall/匹配中底图.jpg' },
        { id: 'hall/matching_face_frame', src: 'images/hall/-_0001_圆形头像框.png' },
        { id: 'hall/match_end_background', src: 'images/hall/背景图.jpg' },
        { id: 'hall/match_endpanel_background', src: 'images/hall/-_0002_结算底.png' },
        { id: 'hall/match_end_win_text', src: 'images/hall/-_0000_胜利.png' },
        { id: 'hall/match_end_loss_text', src: 'images/hall/-_0001_失败.png' },
        { id: 'hall/match_end_my_panel', src: 'images/hall/-_0006_自身名片底.png' },
        { id: 'hall/match_end_other_panel', src: 'images/hall/-_0005_对手名片底.png' },
        { id: 'hall/match_end_medal_0', src: 'images/hall/-_0010_金牌.png' },
        { id: 'hall/match_end_medal_1', src: 'images/hall/-_0009_银牌.png' },
        { id: 'hall/match_end_medal_2', src: 'images/hall/-_0008_铜牌.png' },
        { id: 'hall/match_end_score_chars', src: 'images/hall/-_0012_分数数字.png' },
        { id: 'hall/match_end_coin', src: 'images/hall/-_0011_金币.png' },
        { id: 'hall/match_end_coin_bg', src: 'images/hall/-_0007_金币数量底.png' },
        { id: 'hall/match_end_match_again_button', src: 'images/hall/-_0003_继续对战.png' },
        { id: 'hall/add_friend', src: 'images/hall/-_0001_图层-2.png' },
        { id: 'hall/weekly_task_background', src: 'images/hall/冒险底.png' },
        { id: 'hall/weekly_task_progress', src: 'images/hall/weekly_task_progressbar.png' },
        { id: 'hall/new_weekly_task_prize0', src: 'images/hall/-_0005_小金币.png' },
        { id: 'hall/new_weekly_task_prize1', src: 'images/hall/-_0003_小钻石.png' },
        { id: 'hall/new_weekly_task_prize2', src: 'images/hall/-_0001_小体力.png' },
        { id: 'hall/new_weekly_task_prize_final', src: 'images/hall/-_0000_奖励.png' },
        { id: 'hall/weekly_task_item_bg', src: 'images/hall/-_0003_冒险条目底.png' },
        { id: 'hall/weekly_task_item_bg(satisfied)', src: 'images/hall/-_0001_达成条件遮盖.png' },
        { id: 'hall/weekly_task_item_bg(unknown)', src: 'images/hall/-_0002_完成上一个任务解锁.png' },
        { id: 'hall/weekly_task_item_bg(finish mask)', src: 'images/hall/-_0006_已完成蒙板.png' },
        { id: 'hall/weekly_task_item_point_empty', src: 'images/hall/-_0004_未激活进度.png' },
        { id: 'hall/weekly_task_item_point_full', src: 'images/hall/-_0005_已激活进度.png' },
        { id: 'hall/weekly_task_get_prize_text', src: 'images/hall/-_0000_领取奖励.png' },
        { id: 'hall/+10s_dlg_bg', src: 'images/hall/-_0001_续时.png' },
        { id: 'hall/+10s_dlg_btn', src: 'images/hall/-_0000_增援.png' },
        { id: 'hall/+10s_dlg_cancel_btn', src: 'images/hall/cancel_10s_btn.png' },
        { id: 'hall/game_ready_item_bg', src: 'images/hall/gameitem_bg.png' },
        { id: 'hall/matching_round_anim', src: 'images/hall/-_0002_进度跳.png' },
        { id: 'hall/panel_conver', src: 'images/hall/panel_conver.png' },
        { id: 'hall/help_title_text', src: 'images/hall/帮助.png' },
        { id: 'hall/score_panel_background', src: 'images/hall/score_panel_background.png' },
        { id: 'hall/score/title_text', src: 'images/hall/-_0004_结--算.png' },
        { id: 'hall/score/percent_chars', src: 'images/hall/百分比字体.png' },
        { id: 'hall/score/score_chars', src: 'images/hall/结算分数.png' },
        { id: 'hall/score/std_score_chars', src: 'images/hall/普通数字字体.png' },
        { id: 'hall/score/pet_lv_chars', src: 'images/hall/等级字体.png' },
        { id: 'hall/return_to_home_button', src: 'images/hall/exit_button.png' },
        //{ id: 'hall/continue_game_button', src: 'images/hall/continue_button.png' },
        { id: 'hall/continue_game_button', src: 'images/hall/continue_button2.png' },
        { id: 'hall/activity_title', src: 'images/hall/活动.png' },
        { id: 'hall/cross_button', src: 'images/hall/fanhui-.png' },
    ];
});
define("client/src/hall/shared/ProgressBarControl", ["require", "exports", "client/src/resource", "client/src/hall/HallUI"], function (require, exports, res, HallUI_1) {
    "use strict";
    var defaultDefine = {
        imageSrc: 'hall/progressbar',
        leftWidth: 12,
        centerWidth: 3,
        rightWidth: 11
    };
    var ProgressBarControl = (function (_super) {
        __extends(ProgressBarControl, _super);
        function ProgressBarControl(define) {
            _super.call(this);
            this._LEFT_WIDTH = 0;
            this._CENTER_WIDTH = 0;
            this._RIGHT_WIDTH = 0;
            this._MaxWidth = 233;
            this._percent = 0.5;
            if (!define)
                define = defaultDefine;
            this._image = HallUI_1.HallUI.instance.getImage(define.imageSrc);
            this._LEFT_WIDTH = define.leftWidth;
            this._CENTER_WIDTH = define.centerWidth;
            this._RIGHT_WIDTH = define.rightWidth;
        }
        Object.defineProperty(ProgressBarControl.prototype, "percent", {
            get: function () { return this._percent; },
            set: function (val) {
                if (this._percent !== val) {
                    this._percent = val;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgressBarControl.prototype, "maxWidth", {
            get: function () { return this._MaxWidth; },
            set: function (val) {
                if (val !== this._MaxWidth) {
                    this._MaxWidth = val;
                }
            },
            enumerable: true,
            configurable: true
        });
        ProgressBarControl.prototype.draw = function (ctx, ignoreCache) {
            if (!this.isVisible)
                return false;
            if (this._percent <= 0)
                return false;
            var totalDrawWidth = this._MaxWidth;
            var image = this._image;
            var SCALE = res.GLOBAL_SCALE;
            var DRAW_HEIGHT = (this._image.height * SCALE) | 0;
            var IMAGE_HEIGHT = this._image.height;
            var x; //= this.x | 0;
            var y; //= this.y | 0;
            if (this.parent) {
                var pt = this.parent.localToGlobal(this.x, this.y);
                x = pt.x | 0;
                y = pt.y | 0;
            }
            else {
                x = this.x | 0;
                y = this.y | 0;
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            //draw left
            {
                var DRAW_WIDTH = (this._LEFT_WIDTH * SCALE) | 0;
                ctx.drawImage(image, 0, 0, this._LEFT_WIDTH, IMAGE_HEIGHT, x, y, DRAW_WIDTH, DRAW_HEIGHT);
                x += DRAW_WIDTH;
            }
            //draw center
            {
                var DRAW_WIDTH = ((totalDrawWidth - this._LEFT_WIDTH - this._RIGHT_WIDTH) * this._percent * SCALE) | 0;
                if (DRAW_WIDTH > 0) {
                    ctx.drawImage(image, this._LEFT_WIDTH, 0, this._CENTER_WIDTH, IMAGE_HEIGHT, x, y, DRAW_WIDTH, DRAW_HEIGHT);
                    x += DRAW_WIDTH;
                }
            }
            //draw right
            {
                var DRAW_WIDTH = (this._RIGHT_WIDTH * SCALE) | 0;
                ctx.drawImage(image, this._LEFT_WIDTH + this._CENTER_WIDTH, 0, this._RIGHT_WIDTH, IMAGE_HEIGHT, x, y, DRAW_WIDTH, DRAW_HEIGHT);
                x += DRAW_WIDTH;
            }
            return true;
        };
        ProgressBarControl.prototype.isVisible = function () { return this.visible && this._percent > 0; };
        return ProgressBarControl;
    }(createjs.DisplayObject));
    exports.ProgressBarControl = ProgressBarControl;
});
define("client/src/SoundManager", ["require", "exports"], function (require, exports) {
    "use strict";
    var SoundManager = (function () {
        function SoundManager() {
        }
        SoundManager.init = function () {
            var _this = this;
            window['sound'] = this;
            var soundarr = [
                { id: 'click', src: '格式工厂点击按钮.mp3' },
                { id: 'linkBall', src: '格式工厂点击果冻.mp3' },
                { id: 'skillReady', src: '格式工厂技能充能完毕.mp3' },
                { id: 'nearTimeover', src: '格式工厂倒计时.mp3' },
                { id: 'readygo', src: '格式工厂readygo.mp3' },
                { id: 'openPet', src: '开启果冻.mp3' },
                { id: 'timeover', src: 'jin1gle04.mp3' },
                //bgs
                { id: 'bgMain', src: '格式工厂主界面.mp3' },
                { id: 'bgGame', src: '格式工厂游戏中正常背音.mp3' },
                { id: 'bgFever', src: '格式工厂狂热.mp3' },
                { id: 'bgGameOver', src: '格式工厂评分界面.mp3' },
                { id: 'bgPet', src: '格式工厂宠物培养界面.mp3' },
            ];
            try {
                createjs.Sound.registerSounds(soundarr, '/sound/');
                createjs.Sound.registerSounds(this.ballBombSound, '/sound/爆破声音/');
            }
            catch (e) {
                alert('registerSounds error:' + e);
                alert(e['stack']);
            }
            createjs.Sound.addEventListener('fileload', function (e) {
                if (e.id === _this._currentBgId) {
                    try {
                        _this._currentBg.play(null, null, null, -1);
                    }
                    catch (e) {
                    }
                }
            });
            onDocumentVisibilityChanged(function (hidden) {
                _this.background = hidden;
            });
            this.muted = localStorage.getItem('mutted') === 'true' ? true : false;
        };
        SoundManager.playEffect = function (id) {
            if (this.muted || this.background)
                return;
            try {
                return createjs.Sound.play(id);
            }
            catch (e) {
                console.error('play sound error:', e);
            }
        };
        SoundManager.playBallBomb = function (index) {
            if (this.muted || this.background)
                return;
            if (index < 0)
                index = 0;
            else if (index >= this.ballBombSound.length)
                index = this.ballBombSound.length - 1;
            this.playEffect(this.ballBombSound[index].id);
        };
        SoundManager.playBg = function (id, noLoop) {
            if (id === this._currentBgId)
                return;
            if (this._currentBg) {
                try {
                    this._currentBg.stop();
                }
                catch (e) {
                }
                this._currentBg = null;
            }
            this._currentBgId = id;
            if (id) {
                var loop = noLoop ? undefined : -1;
                try {
                    this._currentBg = createjs.Sound.play(id, null, 0, 0, loop);
                }
                catch (e) {
                    console.error('play sound error:', e);
                }
                return this._currentBg;
            }
            return null;
        };
        Object.defineProperty(SoundManager, "background", {
            get: function () { return this._background; },
            set: function (val) {
                this._background = val;
                createjs.Sound.volume = val ? 0 : 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundManager, "muted", {
            get: function () { return createjs.Sound.muted; },
            set: function (val) {
                createjs.Sound.muted = val;
                localStorage.setItem('mutted', val.toString());
            },
            enumerable: true,
            configurable: true
        });
        SoundManager.ballBombSound = [
            { id: 'ballbomb0', src: 'se09.mp3' },
            { id: 'ballbomb1', src: 'se10.mp3' },
            { id: 'ballbomb2', src: 'se11.mp3' },
            { id: 'ballbomb3', src: 'se12.mp3' },
            { id: 'ballbomb4', src: 'se13.mp3' },
            { id: 'ballbomb5', src: 'se14.mp3' },
            { id: 'ballbomb6', src: 'se15.mp3' },
            { id: 'ballbomb7', src: 'se16.mp3' },
            { id: 'ballbomb8', src: 'se17.mp3' },
            { id: 'ballbomb9', src: 'se18.mp3' },
            { id: 'ballbomb10', src: 'se19.mp3' },
            { id: 'ballbomb11', src: 'se20.mp3' },
            { id: 'ballbomb12', src: 'se21.mp3' },
            { id: 'ballbomb13', src: 'se22.mp3' },
            { id: 'ballbomb14', src: 'se23.mp3' },
            { id: 'ballbomb15', src: 'se24.mp3' },
        ];
        SoundManager._background = false;
        return SoundManager;
    }());
    exports.SoundManager = SoundManager;
    function onDocumentVisibilityChanged(callback) {
        var hidden, visibilityChange;
        if (typeof document['webkitHidden'] !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }
        else if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        }
        else if (typeof document['mozHidden'] !== "undefined") {
            hidden = "mozHidden";
            visibilityChange = "mozvisibilitychange";
        }
        else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        }
        function handleVisibilityChange() {
            if (document[hidden]) {
                callback(true);
            }
            else {
                callback(false);
            }
        }
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
});
define("client/src/ImageButton", ["require", "exports", "client/src/GameStage", "client/src/SoundManager"], function (require, exports, GameStage_2, SoundManager_1) {
    "use strict";
    /** 当按下的时候的缩放值 */
    var SCALED_FACTOR = 0.9;
    var ImageButton = (function (_super) {
        __extends(ImageButton, _super);
        function ImageButton(image) {
            var _this = this;
            _super.call(this);
            this.scaledContainer = new createjs.Container();
            this.width = 0;
            this.height = 0;
            this._oldScaleX = 1;
            this._oldScaleY = 1;
            var background = new createjs.Bitmap(image);
            this.width = image.width;
            this.height = image.height;
            background.regX = this.width / 2;
            background.regY = this.height / 2;
            this.hitArea = background;
            this.scaledContainer.addChild(background);
            this.addChild(this.scaledContainer);
            this.addEventListener('mousedown', function (e) { return _this._onMouseDown(e); });
            this.addEventListener('pressup', function (e) { return _this._onPressUp(e); });
            this.addEventListener('click', function (e) { return _this._onClick(e); });
            this._background = background;
        }
        Object.defineProperty(ImageButton.prototype, "image", {
            get: function () { return this._background.image; },
            set: function (image) {
                if (image !== this._background.image) {
                    this._background.image = image;
                    if (image) {
                        this.width = image.width;
                        this.height = image.height;
                        this._background.regX = this.width / 2;
                        this._background.regY = this.height / 2;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        /**返回的Bitmap可以随意修改属性 */
        ImageButton.prototype.addIcon = function (image, offset) {
            var icon = new createjs.Bitmap(image);
            icon.regX = image.width / 2;
            icon.regY = image.height / 2;
            if (offset) {
                icon.x = offset.x || 0;
                icon.y = offset.y || 0;
            }
            this.scaledContainer.addChild(icon);
            return icon;
        };
        ImageButton.prototype.addDisplayObject = function (obj) {
            this.scaledContainer.addChild(obj);
            return obj;
        };
        ImageButton.prototype._onClick = function (e) {
            if (this.onClick)
                this.onClick();
        };
        ImageButton.prototype._onMouseDown = function (e) {
            var cc = this.scaledContainer;
            this._oldScaleX = cc.scaleX;
            this._oldScaleY = cc.scaleY;
            cc.scaleX *= SCALED_FACTOR;
            cc.scaleY *= SCALED_FACTOR;
            GameStage_2.GameStage.instance.makeDirty();
            SoundManager_1.SoundManager.playEffect('click');
        };
        ImageButton.prototype._onPressUp = function (e) {
            var cc = this.scaledContainer;
            cc.scaleX = this._oldScaleX;
            cc.scaleY = this._oldScaleY;
            GameStage_2.GameStage.instance.makeDirty();
        };
        return ImageButton;
    }(createjs.Container));
    exports.ImageButton = ImageButton;
});
//游戏道具定义
//这个文件可能会在服务器端共享的
define("shared/GameItemDefine", ["require", "exports"], function (require, exports) {
    "use strict";
    //1. 游戏结算分数增加10%
    exports.GAME_ITEM_ADD_SCORE = 'ADDSCORE';
    //2. 随机增加金币数量10% --- 50%
    exports.GAME_ITEM_ADD_COIN = 'ADDCOIN';
    //3. 宠物经验增加20%
    exports.GAME_ITEM_ADD_EXP = 'ADDEXP';
    //4. 游戏时间增加(client only)
    exports.GAME_ITEM_ADD_TIME = 'ADDTIME';
    //5. 爆炸点生成需求从7 -> 6(client only)
    exports.GAME_ITEM_DEC_BOMB_REQ = 'DECBOMBREQ';
    //6. 棋子种类5变成4(client only)
    exports.GAME_ITEM_DEC_BALL_TYPE = 'DECBALLTYPE';
    exports.GAME_ITEM_DEFINES = [
        GAME_ITEM('增加分数', exports.GAME_ITEM_ADD_SCORE, 500, 0.1),
        GAME_ITEM('增加金币', exports.GAME_ITEM_ADD_COIN, 500, 0.1, 0.5),
        GAME_ITEM('增加经验', exports.GAME_ITEM_ADD_EXP, 500, 0.2),
        GAME_ITEM('增加时间', exports.GAME_ITEM_ADD_TIME, 1000, 10),
        GAME_ITEM('减少球数量', exports.GAME_ITEM_DEC_BALL_TYPE, 1500),
        GAME_ITEM('减少炸弹需求', exports.GAME_ITEM_DEC_BOMB_REQ, 1800)
    ];
    /** 随机计算一个金币加成的倍率 */
    function calcGameItemAddCoinRate() {
        var define = [
            [35, 1.1],
            [32, 1.3],
            [26, 1.5],
            [4, 2],
            [1, 2.5],
            [1, 5],
            [0.83, 6],
            [0.17, 51]
        ];
        var count = define.length;
        var total = 0;
        for (var i = 0; i < count; ++i) {
            total += define[i][0];
        }
        var x = Math.random() * total;
        var ret = 1;
        for (var i = 0; i < count; ++i) {
            if (x < define[i][0]) {
                ret = define[i][1];
                break;
            }
            x -= define[i][0];
        }
        return ret - 1;
    }
    exports.calcGameItemAddCoinRate = calcGameItemAddCoinRate;
    /**helper function 来创建IGameItemDefine */
    function GAME_ITEM(name, type, price, param1, param2) {
        if (param1 === undefined)
            param1 = 0;
        if (param2 === undefined)
            param2 = 0;
        return { name: name, type: type, price: price, param1: param1, param2: param2 };
    }
});
define("client/src/LoginUI", ["require", "exports"], function (require, exports) {
    "use strict";
    ///<reference path="../typings/tsd.d.ts"/>
    window["loginui"] = this;
    var currentScale = 1;
    function show() {
        $("#login_panel").show();
    }
    exports.show = show;
    function hide() {
        $("#login_panel").hide();
    }
    exports.hide = hide;
    function showInput(bShow) {
        var x = $("#login_input_panel");
        if (bShow)
            x.show();
        else
            x.hide();
    }
    exports.showInput = showInput;
    function setText(text) {
        $("#login_message").text(text);
        $("#login_msg_bg").css({
            display: text ? 'block' : 'none'
        });
    }
    exports.setText = setText;
    function flyTip(text) {
        var px = function (n) { return (n * currentScale).toString() + "px"; };
        var text_margin = 4;
        var text_side_margin = 8;
        $("#login_message").css({
            top: px(443 + text_margin),
            left: px(78 + text_side_margin),
            width: px(457 - text_side_margin * 2),
            height: px(70 - text_margin * 2),
            'text-align': 'center',
            'font-size': px(28)
        });
        $("#login_msg_bg").css({
            top: px(443),
            left: px(78),
            width: px(457),
            height: px(70),
        });
        var div = document.createElement('div');
        var div2 = document.createElement('div');
        var img = document.createElement('img');
        var span = document.createElement('span');
        img.src = 'images/login/错误提示底.png';
        $(span).text(text).css({
            position: 'absolute',
            margin: px(8),
            top: 0,
            left: 0,
        });
        $(img).css({
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0
        });
        $(div2).css({
            width: '100%',
            height: '100%',
            position: 'relative',
        });
        $(div).css({
            position: 'absolute',
            top: px(673),
            left: px(78),
            width: px(457),
            height: px(70),
            'text-align': 'center',
            'font-size': px(28),
            color: 'red'
        });
        div2.appendChild(img);
        div2.appendChild(span);
        div.appendChild(div2);
        var opacity = 0;
        var top = 700;
        var top2 = 673;
        var top3 = 673 - 100;
        var obj = {};
        div.style.opacity = '0';
        Object.defineProperty(obj, 'opacity', {
            get: function () { return opacity; }, set: function (val) {
                opacity = val;
                div.style.opacity = val;
            }
        });
        Object.defineProperty(obj, 'top', {
            get: function () { return top; }, set: function (val) {
                top = val;
                div.style.top = px(val);
            }
        });
        createjs.Tween.get(obj).to({ top: top2, opacity: 1 }, 200).wait(1000).to({ top: top3, opacity: 1 }, 200).call(function () {
            $(div).remove();
        });
        $('#login_panel').append(div);
    }
    exports.flyTip = flyTip;
    window['flytip'] = flyTip;
    function enableInput(bEnable) {
        var arr = [
            $("#login_username"),
            $("#login_password"),
            $("#login_register_button"),
            $("#login_login_button"),
        ];
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var x = arr_1[_i];
            if (!bEnable)
                x.attr('disabled', "true");
            else
                x.removeAttr('disabled');
        }
    }
    exports.enableInput = enableInput;
    function getUsername() {
        return $("#login_username").val();
    }
    exports.getUsername = getUsername;
    function setUsername(text) {
        $("#login_username").val(text);
    }
    exports.setUsername = setUsername;
    function getPassword() {
        return $("#login_password").val();
    }
    exports.getPassword = getPassword;
    function setPassword(text) {
        $("#login_password").val(text);
    }
    exports.setPassword = setPassword;
    function onButtonLogin(func) {
        $("#login_login_button").click(func);
    }
    exports.onButtonLogin = onButtonLogin;
    function onButtonRegister(func) {
        $("#login_register_button").click(func);
    }
    exports.onButtonRegister = onButtonRegister;
    function setScale(scale) {
        currentScale = scale;
        var dialog = $("#login_dialog");
        var px = function (n) { return (n * scale).toString() + "px"; };
        var percent = (scale * 100).toString() + '%';
        dialog.css('top', px(234));
        dialog.css('width', px(608));
        dialog.css('height', px(680));
        $("#login_panel img").each(function (index, elem) {
            //(elem as HTMLElement).draggable = false;
        });
        /*
        $('#login_username_image').css({
            width: px(109),
            height: px(44),
            top: px(168),
            left: px(45)
        });
        $('#login_password_image').css({
            width: px(105),
            height: px(44),
            top: px(236),
            left: px(45)
        });
    */
        $("#login_username").css({
            width: px(296),
            height: px(38),
            top: px(304),
            left: px(200),
            "font-size": px(32)
        });
        $("#login_password").css({
            width: px(296),
            height: px(38),
            top: px(374),
            left: px(200),
            "font-size": px(32)
        });
        $("#login_register_button").css({
            width: px(220),
            height: px(100),
            top: px(537),
            left: px(73)
        });
        $("#login_login_button").css({
            width: px(220),
            height: px(100),
            top: px(537),
            left: px(304)
        });
        var text_margin = 4;
        var text_side_margin = 8;
        $("#login_message").css({
            top: px(443 + text_margin),
            left: px(78 + text_side_margin),
            width: px(457 - text_side_margin * 2),
            height: px(70 - text_margin * 2),
            'text-align': 'center',
            'font-size': px(28)
        });
        $("#login_msg_bg").css({
            top: px(443),
            left: px(78),
            width: px(457),
            height: px(70),
        });
    }
    exports.setScale = setScale;
});
define("shared/PetRules", ["require", "exports"], function (require, exports) {
    "use strict";
    function getPetLevelUpExp(id, lv) {
        if (lv <= 1)
            return 100;
        if (lv === 2)
            return 200;
        if (lv === 3)
            return 400;
        return 400 + (lv - 3) * 200;
    }
    exports.getPetLevelUpExp = getPetLevelUpExp;
    function getPetSkillLevelUpExp(id, skillLv) {
        if (skillLv <= 1)
            return 1;
        return 1 << (skillLv - 1);
    }
    exports.getPetSkillLevelUpExp = getPetSkillLevelUpExp;
    //返回宠物等级对结算分数的加成
    //宠物每增加2级，结算分数增加百分之1.（双数级增加）
    function getPetExtraScorePercent(id, lv) {
        if (lv <= 1)
            return 0;
        return (lv >> 1) / 100;
    }
    exports.getPetExtraScorePercent = getPetExtraScorePercent;
    //返回宠物解锁的信息，如果当前等级能够解锁的话
    //则返回解锁的金额和解锁的下一级等级
    function getPetUnlockData(id, level) {
        var price = [2000, 3000, 4000, 6000, 8000, 10000, 10000, 10000, 10000];
        if (level % 5 === 0 && level > 0 && level < 50) {
            var i = (level / 5 - 1) | 0;
            if (typeof price[i] === 'number') {
                return { price: price[i], nextLevel: level + 5 };
            }
        }
        return null;
    }
    exports.getPetUnlockData = getPetUnlockData;
    exports.PET_MAX_LEVEL = 50;
    exports.MAX_PET_COUNT = 27;
    if (typeof process === 'object') {
        var parse = require("csv-parse/lib/sync");
        var iconv = require("iconv-lite");
        var fs = require('fs');
        var assert = require('assert');
        var records = parse(iconv.decode(fs.readFileSync(__dirname + '/PetRules.csv'), 'gbk'));
        assert(records.length === exports.MAX_PET_COUNT + 1);
        exports.PET_NAMES = [];
        exports.PET_REAL_COLORS = [];
        exports.PET_BASE_SCORE = [];
        exports.PET_UP_SCORE = [];
        exports.PET_SKILL = [];
        for (var i = 0; i < exports.MAX_PET_COUNT; ++i) {
            var line = records[i + 1];
            exports.PET_NAMES.push(line[0]);
            exports.PET_REAL_COLORS.push(line[1]);
            var skill = parseInt(line[2]);
            var baseScore = parseInt(line[3]);
            var upScore = parseInt(line[4]);
            assert(typeof skill === 'number');
            assert(typeof baseScore === 'number');
            assert(typeof upScore === 'number');
            exports.PET_SKILL.push(skill - 1);
            exports.PET_BASE_SCORE.push(baseScore);
            exports.PET_UP_SCORE.push(upScore);
        }
        exports.initConfig = function (config) {
            config.PET_NAMES = exports.PET_NAMES;
            config.PET_REAL_COLORS = exports.PET_REAL_COLORS;
            config.PET_SKILL = exports.PET_SKILL;
            config.PET_BASE_SCORE = exports.PET_BASE_SCORE;
            config.PET_UP_SCORE = exports.PET_UP_SCORE;
        };
    }
    else {
        var config = self.__GET_GAME_CONFIG();
        exports.PET_NAMES = config.PET_NAMES;
        exports.PET_REAL_COLORS = config.PET_REAL_COLORS;
        exports.PET_BASE_SCORE = config.PET_BASE_SCORE;
        exports.PET_UP_SCORE = config.PET_UP_SCORE;
        exports.PET_SKILL = config.PET_SKILL;
    }
});
//按照现在看来，所有日常任务都是可以在服务器端完成的。
//在一局游戏结束的时候，客户端发送所有一局游戏的统计数据就可以了。
//所有日常任务都是一个简单计数器。
define("shared/DailyTaskDefine", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.MAX_DAILY_TASK = 3; //每天最多完成的每日任务
    exports.DailyTaskTemplate = [
        { type: 'game', maxCount: 12, count: 0 },
        { type: 'ball', maxCount: 3200, count: 0 },
        { type: 'exp', maxCount: 600, count: 0 },
        { type: 'bomb', maxCount: 68, count: 0 },
        { type: 'skill', maxCount: 28, count: 0 },
        { type: 'coin', maxCount: 3200, count: 0 },
        { type: 'fever', maxCount: 54, count: 0 },
    ];
    function getDailyTaskText(task) {
        var pre = '';
        var post = '';
        switch (task.type) {
            case 'game':
                pre = '完成';
                post = '局游戏';
                break;
            case 'ball':
                pre = '累计消除';
                post = '个宠物';
                break;
            case 'exp':
                pre = '累计获得';
                post = '经验';
                break;
            case 'bomb':
                pre = '累计引爆';
                post = '个炸弹';
                break;
            case 'skill':
                pre = '累计触发宠物技能';
                post = '次';
                break;
            case 'coin':
                pre = '累计获得';
                post = '金币';
                break;
            case 'fever':
                pre = '累计进入特殊时间';
                post = '次';
                break;
        }
        return pre + " " + task.count + "/" + task.maxCount + " " + post;
    }
    exports.getDailyTaskText = getDailyTaskText;
});
define("client/src/ShareFunctions", ["require", "exports", "client/src/GameLink"], function (require, exports, GameLink_1) {
    "use strict";
    var isAddBaiduScript = false;
    var isAddJiaThisScript = false;
    var shareLink = 'http://www.baidu.com';
    var shareText = '这游戏不错，进来加个好友一起来玩。';
    var defaultShareText = '这游戏不错，进来加个好友一起来玩。';
    function init() {
        $(".arthref").hide();
        $(".arthref").click(function (e) {
            if (e.target && e.target.tagName == 'A')
                return;
            hideBaidu();
        });
        $("#jiathis_share_layer").click(function (e) {
            if (e.target && e.target.tagName == 'A')
                return;
            hideJiaThis();
        });
    }
    exports.init = init;
    function getShareText() {
        return shareText;
    }
    function getShareLink() {
        var url = location.protocol + '//' + location.host + location.pathname;
        url += '?from=' + encodeURIComponent(GameLink_1.GameLink.instance.key);
        return url;
    }
    function getShareImage() {
        return location.protocol + '//' + location.host + location.pathname + '/images/Balls/1.png';
    }
    function shareBaidu() {
        window["_bd_share_config"] = {
            common: {
                bdText: getShareText(),
                bdDesc: getShareText(),
                bdUrl: getShareLink(),
                bdPic: getShareImage(),
                bdSign: "off"
            },
            share: [{
                    tag: "share_1",
                    bdSize: 32
                }]
        };
        $(".arthref").show();
        if (!isAddBaiduScript) {
            isAddBaiduScript = true;
            (document.getElementsByTagName('head')[0] || document.body).appendChild(document.createElement('script'))["src"] = 'http://bdimg.share.baidu.com/static/api/js/share.js?cdnversion=' + ~(-new Date() / 36e5);
        }
    }
    exports.shareBaidu = shareBaidu;
    function hideBaidu() {
        $(".arthref").hide();
    }
    exports.hideBaidu = hideBaidu;
    function shareJiaThis() {
        var jiathis_config = {
            url: getShareLink(),
            title: getShareText(),
            summary: '',
            pic: getShareImage(),
            shortUrl: false,
            hideMore: true
        };
        window['jiathis_config'] = jiathis_config;
        if (!isAddJiaThisScript) {
            isAddJiaThisScript = true;
            var script = document.createElement('script');
            script.src = 'http://v3.jiathis.com/code_mini/jia.js';
            document.head.appendChild(script);
        }
        $('#jiathis_share_layer').show();
        $(".jiathis_style_32x32").css("padding-left", ((window.innerWidth - 500) * 0.5) + "px").css('padding-top', (window.innerHeight * 0.5 - 60) + 'px');
    }
    exports.shareJiaThis = shareJiaThis;
    function hideJiaThis() {
        $('#jiathis_share_layer').hide();
    }
    exports.hideJiaThis = hideJiaThis;
    function share(text) {
        shareText = text || defaultShareText;
        shareJiaThis();
    }
    exports.share = share;
    window["shareBaidu"] = shareBaidu;
    window["hideBaidu"] = hideBaidu;
    try {
        if (self && self['LmbJsBridge']) {
            LmbJsBridge.init();
        }
    }
    catch (e) {
    }
    var isSet = false;
    function regShareWhenLogin() {
        if (isSet)
            return;
        isSet = true;
        try {
            if (self['LmbJsBridge']) {
                var url = 'http://ad.lmbang.com/Business-Thirdservice?url=' + encodeURIComponent(getShareLink());
                LmbJsBridge.onShare({
                    title: getShareText(),
                    content: getShareText() + url,
                    img: getShareImage(),
                    share_type: 'LMBQ,LMBF,QQF,SNS,WCHATF,WCHATQ,SINA',
                    link: url,
                    id: ''
                });
            }
        }
        catch (e) {
        }
    }
    exports.regShareWhenLogin = regShareWhenLogin;
});
define("client/src/GameLink", ["require", "exports", "client/src/GameStage", "client/src/LoginUI", "client/src/hall/HallUI", "shared/PetRules", "client/src/util", "client/src/ShareFunctions"], function (require, exports, GameStage_3, LoginUI, HallUI_2, PetRules, util, share) {
    "use strict";
    var MAX_RECONNECT_COUNT = 3;
    var GameLink = (function () {
        function GameLink() {
            var _this = this;
            //basic info
            this.key = "";
            this.coin = 0;
            this.diamond = 0;
            this.heart = 0;
            this.nextHeartTime = 0;
            this.currentPet = -1;
            this.pets = [];
            this.weekHighScore = 0;
            this.historicalHighScore = 0;
            this.nickname = "";
            this.faceurl = "";
            this.boughtItems = [];
            this.matchPlayers = []; //对战模式时，保存了其它玩家的数据，头像什么的
            this.weekRankPosition = -1; //周排行
            this._logining = false;
            this._logined = false;
            this._requestingStartGame = false;
            this._reconnectCount = 0; //重新连接次数
            this._isReconnecting = false;
            //在link中缓存的mail数据
            this._mailCount = 0;
            this._isBuyingGift = false;
            this._isSearchingFriend = false;
            this._weekRankList = null;
            this._weekRankListQuried = false;
            this._loginType = '';
            GameLink.instance = this;
            window['link'] = this;
            LoginUI.hide();
            LoginUI.setText("");
            LoginUI.enableInput(true);
            var username = localStorage.getItem('loginpanel.username');
            var password = localStorage.getItem('loginpanel.password');
            if (username)
                LoginUI.setUsername(username);
            if (password)
                LoginUI.setPassword(password);
            var onClickButton = function (isReg) {
                var username = LoginUI.getUsername().trim();
                var password = LoginUI.getPassword().trim();
                if (!username) {
                    //alert('请输入用户名');
                    LoginUI.flyTip('请输入用户名');
                    return;
                }
                if (!password) {
                    //alert('请输入密码');
                    LoginUI.flyTip('请输入密码');
                    return;
                }
                LoginUI.enableInput(false);
                LoginUI.setText('正在登陆中...');
                if (isReg)
                    _this.register(username, password);
                else
                    _this.login(username, password);
            };
            LoginUI.onButtonLogin(function () {
                onClickButton(false);
            });
            LoginUI.onButtonRegister(function () { return onClickButton(true); });
        }
        Object.defineProperty(GameLink.prototype, "friendList", {
            get: function () { return this._friendList; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameLink.prototype, "loginType", {
            get: function () { return this._loginType; },
            enumerable: true,
            configurable: true
        });
        GameLink.prototype._getUserAgent = function () {
            return navigator.userAgent + ',' + navigator.appVersion;
        };
        GameLink.prototype.login = function (username, password) {
            this._loginType = 'custom';
            this._logining = true;
            this._logined = false;
            this._loginPacket = {
                cmd: 'login',
                username: username,
                password: password,
                from: util.getParameterByName('from'),
                agent: this._getUserAgent(),
            };
            this._currentUsername = username;
            this._currentPassword = password;
            this._connect();
        };
        GameLink.prototype.loginLaMa = function (enu, face, nickname, type) {
            this._loginType = 'lama';
            this._logining = true;
            this._logined = false;
            this._loginPacket = {
                cmd: 'login',
                enuid: enu,
                face: face,
                nickname: nickname,
                type: type || 'lama',
                from: util.getParameterByName('from'),
                agent: this._getUserAgent()
            };
            this._currentUsername = '';
            this._currentPassword = '';
            LoginUI.showInput(false);
            this._connect();
        };
        GameLink.prototype.register = function (username, password) {
            this._logining = true;
            this._loginPacket = {
                cmd: 'register',
                username: username,
                password: password,
                from: util.getParameterByName('from'),
                agent: this._getUserAgent()
            };
            this._currentUsername = username;
            this._currentPassword = password;
            this._connect();
        };
        GameLink.prototype.sendPacket = function (obj) {
            if (!this._socket)
                return;
            try {
                this._socket.send(JSON.stringify(obj));
            }
            catch (e) {
                console.error('send', e);
            }
        };
        GameLink.prototype.sendSelectPet = function (i) {
            this.sendPacket({
                cmd: 'selectPet',
                id: i
            });
        };
        GameLink.prototype._connect = function () {
            var _this = this;
            if (this._socket) {
                console.error('error,socket alreay created');
                return;
            }
            var host = location.host;
            var hosts = host.split('.');
            if (hosts.length === 4 && isNaN(parseInt(hosts[0]))) {
                hosts[0] = 'ws';
                host = hosts.join('.');
            }
            var socket = this._socket = new WebSocket('ws://' + host + location.pathname + 'game');
            socket.onopen = function (e) { return _this._onOpen(); };
            socket.onclose = function (e) { return _this._onClose(e); };
            socket.onerror = function (e) { return _this._onError(e); };
            socket.onmessage = function (e) { return _this._onMessage(e); };
            this._loginErrorMsg = null;
            this._requestingStartGame = false;
            this._isBuyingGift = false;
            this._mailCount = 0;
            this._mails = null;
            this._isSearchingFriend = false;
            this.weekRankPosition = -1;
            this._weekRankListQuried = false;
        };
        GameLink.prototype._reconnect = function () {
            var _this = this;
            setTimeout(function () {
                _this._logining = true;
                _this._isReconnecting = true;
                _this._connect();
            }, 2000);
        };
        GameLink.prototype._onOpen = function () {
            console.info('WebSocket open');
            this.sendPacket(this._loginPacket);
        };
        GameLink.prototype._onClose = function (e) {
            console.info('WebSocket close', e);
            if (this._logining) {
                this._logining = false;
                this._onLoginError('和服务器连接失败', e);
            }
            else {
                this._onLinkLost(e);
                if (e.reason) {
                    LoginUI.flyTip('和服务器断开了连接:' + e.reason);
                }
            }
            this._socket = null;
        };
        GameLink.prototype._onMessage = function (e) {
            var obj = JSON.parse(e.data);
            var cmd = obj.cmd;
            console.log('message ' + cmd, e.data);
            if (typeof this['_recv_' + cmd] === 'function') {
                this['_recv_' + cmd](obj);
            }
            else {
                console.error("Can't process cmd:" + cmd);
            }
        };
        GameLink.prototype._onError = function (e) {
            console.error('WebSocket error', e);
            /*
            if (this._logining)
            {
                this._logining = false;
                this._onLoginError('服务器断开的连接');
            }
            else
            {
                this._onLinkLost();
            }
            */
        };
        GameLink.prototype._onLoginError = function (msg, e) {
            var wantAutoReconnect = false;
            if (this._isReconnecting && (e && e.code !== 1000) && this._reconnectCount < MAX_RECONNECT_COUNT) {
                wantAutoReconnect = true;
            }
            if (!wantAutoReconnect) {
                this._isReconnecting = false;
                this._reconnectCount = 0;
                LoginUI.show();
                LoginUI.setText('');
                LoginUI.flyTip('登陆失败：' + msg);
                LoginUI.enableInput(true);
                this._loginErrorMsg = msg;
            }
            else {
                console.log('登陆失败：但是在进行第' + this._reconnectCount + '次自动重连');
                this._reconnectCount++;
                this._reconnect();
            }
        };
        GameLink.prototype._onLoginSuccess = function (obj) {
            console.info('登陆成功', obj);
            LoginUI.hide();
            localStorage.setItem('loginpanel.username', this._currentUsername);
            localStorage.setItem('loginpanel.password', this._currentPassword);
            this._processUserInfo(obj);
            HallUI_2.HallUI.instance.hidePaymentMask();
            if (GameStage_3.GameStage.instance._currentGame) {
                GameStage_3.GameStage.instance._currentGame.sendGameResultIfGameOver();
            }
        };
        GameLink.prototype._onLinkLost = function (e) {
            this._logined = false;
            if (this._socket) {
                try {
                    this._socket.close();
                }
                finally { }
                this._socket = null;
            }
            var wantAutoReconnect = true;
            if (e && [1000, 4008].indexOf(e.code) >= 0) {
                wantAutoReconnect = false;
            }
            if (this._reconnectCount >= MAX_RECONNECT_COUNT) {
                wantAutoReconnect = false;
            }
            HallUI_2.HallUI.instance.showMatchingPanel(false);
            if (!wantAutoReconnect) {
                this._isReconnecting = false; //自动重连机制已经停止了
                GameStage_3.GameStage.instance.closeGame();
                LoginUI.show();
                LoginUI.setText('');
                if (!this._loginErrorMsg)
                    LoginUI.flyTip('和服务器的连接断开了');
                LoginUI.enableInput(true);
            }
            else {
                GameStage_3.GameStage.instance.closeMatchGame();
                this._isReconnecting = true;
                this._reconnectCount++;
                console.log('正在进行第' + this._reconnectCount + '次，自动重新连接');
                this._reconnect();
            }
        };
        GameLink.prototype._recv_login = function (obj) {
            this._logining = false;
            if (obj.success) {
                this._logined = true;
                this._isReconnecting = false;
                this._reconnectCount = 0;
                this._onLoginSuccess(obj);
            }
            else {
                this._onLoginError(obj.msg);
            }
        };
        GameLink.prototype._recv_update = function (obj) {
            this._processUserInfo(obj);
        };
        GameLink.prototype._recv_startGameError = function (obj) {
            console.error("\u8BF7\u6C42\u5F00\u59CB\u6E38\u620F\u9519\u8BEF\uFF0Cmsg=" + obj.msg);
            if (obj.nocoin) {
                //HallUI.instance.showNoCoinDialog(obj.msg);
                HallUI_2.HallUI.instance.whenWantCoin(obj.need);
            }
            else if (obj.noheart) {
                //HallUI.instance.showNoHeartDialog(obj.msg);
                HallUI_2.HallUI.instance.whenWantHeart(obj.need);
            }
            else {
                HallUI_2.HallUI.instance.showConfirmDialog(obj.msg);
            }
            this._requestingStartGame = false;
        };
        GameLink.prototype._recv_startGame = function (obj) {
            var _this = this;
            console.info('开始游戏');
            if (obj.tutorial) {
                this._requestingStartGame = false;
                GameStage_3.GameStage.instance.createGame(obj);
            }
            else {
                HallUI_2.HallUI.instance.heartbar.playMinusHeartAnimation(function () {
                    _this._requestingStartGame = false;
                    GameStage_3.GameStage.instance.createGame(obj);
                });
            }
        };
        GameLink.prototype._recv_gameover = function (obj) {
            GameStage_3.GameStage.instance.showGameOver(obj);
        };
        GameLink.prototype._recv_submitGameResultError = function (obj) {
            console.error("\u63D0\u4EA4\u6E38\u620F\u7ED3\u679C\u9519\u8BEF, msg=" + obj.msg);
            GameStage_3.GameStage.instance.closeGame();
        };
        GameLink.prototype._recv_unlockPetError = function (obj) {
            if (obj.nocoin) {
                //HallUI.instance.showNoCoinDialog(obj.msg);
                HallUI_2.HallUI.instance.whenWantCoin(obj.need);
            }
            else {
                HallUI_2.HallUI.instance.showConfirmDialog(obj.msg);
            }
        };
        GameLink.prototype.sendGameResult = function (obj) {
            var obj2 = {};
            for (var key in obj) {
                obj2[key] = obj[key];
            }
            obj2.cmd = 'submitGameResult';
            this.sendPacket(obj2);
        };
        GameLink.prototype._processUserInfo = function (obj) {
            var _this = this;
            if (!obj)
                return;
            var copy = function (name) {
                if (name in obj) {
                    _this[name] = obj[name];
                    return true;
                }
                return false;
            };
            if (copy('key')) {
                share.regShareWhenLogin();
            }
            copy('coin');
            copy('diamond');
            copy('currentPet');
            var bRefreshHeart = copy('heart');
            copy('nextHeartTime');
            var bRefreshFriends = copy('weekHighScore');
            bRefreshFriends = copy('historicalHighScore') || bRefreshFriends;
            copy('nickname');
            if (copy('faceurl')) {
            }
            copy('weekRankPosition');
            if (copy('boughtItems')) {
                HallUI_2.HallUI.instance.refreshPayment();
            }
            HallUI_2.HallUI.instance.updateBasicInfo();
            if (bRefreshHeart) {
                HallUI_2.HallUI.instance.updateHeartInfo();
            }
            if (obj.pets) {
                this.pets.length = 0;
                for (var i = 0; i < obj.pets.length; ++i) {
                    var pet = obj.pets[i];
                    this.pets[pet.id] = pet;
                }
            }
            if (obj.pets || 'currentPet' in obj) {
                HallUI_2.HallUI.instance.updatePetInfo();
            }
            this._processMail(obj);
            this._processDailyTask(obj);
            this._processWeeklyTask(obj);
            this._processFriends(obj);
            if (bRefreshFriends && this._friendList) {
                HallUI_2.HallUI.instance.refreshFriends();
            }
        };
        GameLink.prototype.sendReqMail = function () {
            this.sendPacket({ cmd: 'reqMail' });
        };
        GameLink.prototype.sendReqRecvAllMail = function () {
            if (this._mailCount > 0) {
                this.sendPacket({ cmd: 'reqRecvAllMail' });
            }
        };
        GameLink.prototype.sendReqRecvMail = function (id) {
            this.sendPacket({ cmd: 'reqRecvMail', id: id });
        };
        GameLink.prototype.sendReqRejectMail = function (id) {
            this.sendPacket({ cmd: 'reqRejectMail', id: id });
        };
        //处理mailCount和mails
        GameLink.prototype._processMail = function (obj) {
            if ('mailCount' in obj) {
                if (obj.mailCount !== this._mailCount) {
                    this._mailCount = obj.mailCount;
                    HallUI_2.HallUI.instance.updateMailCount(this._mailCount);
                    //当数量发生改变的时候，且当前没有发送mails的话，则刷新一下
                    if (!('mails' in obj)) {
                        //当count==0的时候，就直接知道mails=[]了，不需要请求了
                        if (obj.mailCount === 0) {
                            this._mails = [];
                            HallUI_2.HallUI.instance.updateMail(this._mails);
                        }
                        else {
                            //只在面板显示的时候立刻刷新
                            if (HallUI_2.HallUI.instance.isMailPanelShowing()) {
                                this.sendReqMail();
                            }
                        }
                    }
                }
            }
            if ('mails' in obj) {
                this._mails = obj.mails;
                HallUI_2.HallUI.instance.updateMail(this._mails);
            }
        };
        //服务器请求删除一封邮件
        GameLink.prototype._recv_delMail = function (obj) {
            var success = false;
            var id = obj.id;
            if (Array.isArray(this._mails)) {
                for (var i = 0; i < this._mails.length; ++i) {
                    if (this._mails[i].id === id) {
                        this._mails.splice(i, 1);
                        success = true;
                        break;
                    }
                }
            }
            if (success) {
                HallUI_2.HallUI.instance.updateMail(this._mails);
                --this._mailCount;
                HallUI_2.HallUI.instance.updateMailCount(this._mailCount);
            }
            else {
                if (HallUI_2.HallUI.instance.isMailPanelShowing()) {
                    this.sendReqMail();
                }
            }
        };
        /**返回null表示，你没有这个宠物 */
        GameLink.prototype.getPetInfo = function (i) {
            var pets = this.pets;
            var pet = this.pets[i];
            if (!pet)
                return null;
            return {
                idx: i,
                skill: pet.skillLv,
                skillExp: pet.skillExp,
                skillExpTotal: PetRules.getPetSkillLevelUpExp(pet.id, pet.skillLv),
                level: pet.level,
                maxLevel: pet.lockedLv,
                exp: pet.exp,
                expTotal: PetRules.getPetLevelUpExp(pet.id, pet.level),
                unlockPrice: pet.unlockPrice
            };
        };
        /**和getPetInfo()类似 但是总会返回一个初始的宠物给你的*/
        GameLink.prototype.getFakePetInfo = function (i) {
            if (i < 0)
                return null;
            if (i >= PetRules.MAX_PET_COUNT)
                return null;
            return {
                idx: i,
                skill: 1,
                skillExp: 0,
                skillExpTotal: PetRules.getPetSkillLevelUpExp(i, 1),
                level: 1,
                maxLevel: 5,
                exp: 0,
                expTotal: PetRules.getPetLevelUpExp(i, 1),
                //unlockPrice: 0,
                fake: true
            };
        };
        /**宠物基础分数 */
        GameLink.prototype.getPetScore = function (i) {
            var pi = this.getPetInfo(i);
            var lv = pi ? pi.level : 1;
            return this.getPetScoreByLevel(i, lv);
        };
        GameLink.prototype.getPetScoreByLevel = function (petid, lv) {
            return PetRules.PET_BASE_SCORE[petid] + PetRules.PET_UP_SCORE[petid] * (lv - 1);
        };
        GameLink.prototype.sendReqStartGame = function (obj) {
            if (this._requestingStartGame)
                return;
            this._requestingStartGame = true;
            this.sendPacket({
                cmd: 'reqStartGame',
                items: obj.items
            });
        };
        GameLink.prototype.sendReqWeeklyTask = function () {
            this.sendPacket({
                cmd: 'reqWeeklyTask'
            });
        };
        GameLink.prototype.sendReqEndWeeklyTask = function () {
            this.sendPacket({
                cmd: 'reqEndWeeklyTask'
            });
        };
        GameLink.prototype._processDailyTask = function (obj) {
            /*
            let ui = HallUI.instance.dailyTaskBar;
            if ('dailyTaskCount' in obj)
            {
                ui.setFinishedCount(obj.dailyTaskCount);
            }
            if ('dailyTask' in obj)
            {
                if (obj.dailyTask)
                {
                    ui.setDailyTaskPercent(obj.dailyTask.count / obj.dailyTask.maxCount);
                    ui.setDailyTaskText(DT.getDailyTaskText(obj.dailyTask));
                }
                else
                {
                    ui.setDailyTaskPercent(0);
                    ui.setDailyTaskText('任务没啦，明天请赶早！');
                }
            }
            */
        };
        GameLink.prototype._processWeeklyTask = function (obj) {
            if (Array.isArray(obj.weeklyTasks)) {
                for (var _i = 0, _a = obj.weeklyTasks; _i < _a.length; _i++) {
                    var task = _a[_i];
                    if (typeof task.param === 'number' && task.desc.indexOf('{果冻X}') >= 0) {
                        task.desc = task.desc.toString().replace('{果冻X}', PetRules.PET_NAMES[task.param]);
                    }
                }
                HallUI_2.HallUI.instance.updateWeeklyTask(obj.weeklyTasks, obj.weeklyTaskCount, obj);
                this._weeklyTasks = obj.weeklyTasks;
            }
        };
        GameLink.prototype.getCurrentWeeklyTask = function () {
            if (this._weeklyTasks) {
                return this._weeklyTasks[this._weeklyTasks.length - 1];
            }
            return null;
        };
        GameLink.prototype.sendUnlockPet = function (idx) {
            this.sendPacket({ cmd: 'unlockPet', idx: idx });
        };
        GameLink.prototype.sendBuyGift = function (idx) {
            if (this._isBuyingGift)
                return;
            this._isBuyingGift = true;
            this.sendPacket({ cmd: 'buyGift', idx: idx });
        };
        GameLink.prototype._recv_buyGiftSuccess = function (obj) {
            console.info("\u6210\u529F\u8D2D\u4E70\u793C\u5305");
            this._isBuyingGift = false;
            HallUI_2.HallUI.instance.showBuyGiftSuccess(obj);
        };
        GameLink.prototype._recv_buyGiftError = function (obj) {
            console.info('购买礼包失败：' + obj.msg);
            this._isBuyingGift = false;
            //alert('购买礼包失败：' + obj.msg);
            if (obj.nocoin) {
                //HallUI.instance.showNoCoinDialog(obj.msg);
                HallUI_2.HallUI.instance.whenWantCoin(obj.need);
            }
            else {
                HallUI_2.HallUI.instance.showConfirmDialog(obj.msg);
            }
        };
        GameLink.prototype.sendCancelGame = function () {
            this.sendPacket({ cmd: 'cancelGame' });
        };
        GameLink.prototype._processFriends = function (obj) {
            if (obj && Array.isArray(obj.friends)) {
                this._friendList = obj.friends;
                HallUI_2.HallUI.instance.refreshFriends();
            }
        };
        GameLink.prototype._recv_updateFriend = function (obj) {
            if (obj.friend && obj.friend.key && this._friendList) {
                var updated = false;
                for (var i = 0; i < this._friendList.length; ++i) {
                    if (this._friendList[i].key === obj.friend.key) {
                        this._friendList[i] = obj.friend;
                        updated = true;
                        break;
                    }
                }
                if (!updated) {
                    this._friendList.push(obj.friend);
                }
                HallUI_2.HallUI.instance.refreshFriends();
            }
        };
        GameLink.prototype._recv_removeFriend = function (obj) {
            if (obj.key && this._friendList) {
                for (var i = 0; i < this._friendList.length; ++i) {
                    if (this._friendList[i].key === obj.key) {
                        this._friendList.splice(i, 1);
                        HallUI_2.HallUI.instance.refreshFriends();
                        return;
                    }
                }
            }
        };
        GameLink.prototype.getFriendList = function (sortOn) {
            var _this = this;
            var arr = [];
            arr.push({
                key: this.key,
                name: this.nickname,
                score: this[sortOn],
                currentPet: this.currentPet,
                faceurl: this.faceurl
            });
            Object.defineProperty(arr[0], 'currentPet', { get: function () { return _this.currentPet; } });
            for (var _i = 0, _a = this.friendList; _i < _a.length; _i++) {
                var f = _a[_i];
                if (f.key === this.key) {
                    f.weekHighScore = this.weekHighScore;
                    f.historicalHighScore = this.historicalHighScore;
                }
                arr.push({
                    key: f.key,
                    name: f.nickname,
                    score: f[sortOn],
                    canSendHeart: f.canSendHeart,
                    currentPet: f.currentPet,
                    faceurl: f.faceurl
                });
            }
            sortOnKey(arr, 'score');
            for (var i = 0; i < arr.length; ++i) {
                arr[i]['index'] = i;
            }
            return arr;
        };
        //输入，我的分数变化，如果排名提升了，则返回变化的数据. 否则返回null
        GameLink.prototype.genScorePositionChangeInfo = function (oldScore, newScore) {
            var _this = this;
            if (!(newScore > oldScore))
                return null;
            var appendFriendInfo = function (arr) {
                for (var _i = 0, _a = _this.friendList; _i < _a.length; _i++) {
                    var f = _a[_i];
                    if (f.key === _this.key)
                        continue;
                    arr.push({
                        key: f.key,
                        name: f.nickname,
                        score: f.weekHighScore,
                        currentPet: f.currentPet,
                        faceurl: f.faceurl
                    });
                }
            };
            var self = {
                key: this.key,
                name: this.nickname,
                score: oldScore,
                currentPet: this.currentPet,
                faceurl: this.faceurl
            };
            var arr = [];
            arr.push(self);
            appendFriendInfo(arr);
            sortOnKey(arr, 'score');
            var oldIndex = arr.indexOf(self);
            arr = [];
            self.score = newScore;
            arr.push(self);
            appendFriendInfo(arr);
            sortOnKey(arr, 'score');
            var newIndex = arr.indexOf(self);
            if (newIndex < oldIndex && arr[newIndex + 1]) {
                return {
                    me: self,
                    friend: arr[newIndex + 1],
                    oldScore: oldScore,
                    newScore: newScore,
                    oldIndex: oldIndex,
                    newIndex: newIndex
                };
            }
            return null;
        };
        GameLink.prototype.sendQueryFriend = function (key) {
            this.sendPacket({ cmd: 'queryFriend', key: key });
        };
        GameLink.prototype.sendRemoveFriend = function (key) {
            this.sendPacket({ cmd: 'removeFriend', key: key });
        };
        GameLink.prototype._recv_queryFriend = function (obj) {
            if (this._friendList) {
                for (var _i = 0, _a = this._friendList; _i < _a.length; _i++) {
                    var f = _a[_i];
                    if (f.key === obj.key) {
                        obj.canSendHeart = f.canSendHeart;
                        obj.showRemoveFriend = true;
                    }
                }
            }
            HallUI_2.HallUI.instance.recvFriendInfo(obj);
        };
        //送给好友一个体力
        GameLink.prototype.sendFriendHeart = function (key) {
            this.sendPacket({ cmd: 'sendFriendHeart', key: key });
            //把自己缓存的好友信息中的，可不可以发送红心，设置成false
            if (this._friendList) {
                for (var _i = 0, _a = this._friendList; _i < _a.length; _i++) {
                    var f = _a[_i];
                    if (f.key === key) {
                        f.canSendHeart = false;
                        HallUI_2.HallUI.instance.refreshFriends();
                        break;
                    }
                }
            }
        };
        GameLink.prototype._recv_sendHeartError = function (obj) {
            console.log(obj.msg);
            var text = new createjs.Text(obj.msg, '42px SimHei', '#ff1469');
            text.textAlign = 'center';
            text.x = 320;
            text.y = 600;
            text.alpha = 1;
            HallUI_2.HallUI.instance.spr.addChild(text);
            createjs.Tween.get(text).to({ alpha: 0, y: 350 }, 1000).call(function () {
                if (text.parent)
                    text.parent.removeChild(text);
            });
        };
        GameLink.prototype.sendBuyCoin = function (id) {
            HallUI_2.HallUI.instance.showPaymentMask();
            this.sendPacket({ cmd: 'buyCoin', item: id });
        };
        GameLink.prototype.sendBuyHeart = function (id) {
            HallUI_2.HallUI.instance.showPaymentMask();
            this.sendPacket({ cmd: 'buyHeart', item: id });
        };
        GameLink.prototype.sendBuyDiamond = function (id) {
            HallUI_2.HallUI.instance.showPaymentMask();
            this.sendPacket({ cmd: 'buyDiamond', item: id, backUrl: getBackUrl() });
        };
        GameLink.prototype._recv_buyEnd = function (obj) {
            HallUI_2.HallUI.instance.hidePaymentMask();
        };
        GameLink.prototype._recv_buyCoinError = function (obj) {
            HallUI_2.HallUI.instance.hidePaymentMask();
            var msg = obj.msg;
            if (obj.nodiamond) {
                //HallUI.instance.showNoDiamondDialog(msg);
                HallUI_2.HallUI.instance.whenWantDiamond(obj.need);
            }
            else {
                HallUI_2.HallUI.instance.showConfirmDialog(msg);
            }
        };
        GameLink.prototype._recv_buyHeartError = function (obj) {
            HallUI_2.HallUI.instance.hidePaymentMask();
            var msg = obj.msg;
            if (obj.nodiamond) {
                //HallUI.instance.showNoDiamondDialog(msg);
                HallUI_2.HallUI.instance.whenWantDiamond(obj.need);
            }
            else {
                HallUI_2.HallUI.instance.showConfirmDialog(msg);
            }
        };
        GameLink.prototype._recv_buyDiamond = function (obj) {
            //HallUI.instance.hidePaymentMask();
            location.href = obj.url;
        };
        GameLink.prototype._recv_buyDiamondError = function (obj) {
            var msg = '购买钻石失败：' + obj.msg;
            if (obj.nodiamond) {
                //HallUI.instance.showNoDiamondDialog(msg);
                HallUI_2.HallUI.instance.whenWantDiamond(obj.need);
            }
            else {
                HallUI_2.HallUI.instance.showConfirmDialog(msg);
            }
        };
        GameLink.prototype.sendRefresh = function () {
            this.sendPacket({ cmd: 'refresh' });
        };
        GameLink.prototype.sendSearchFriend = function (name) {
            if (this._isSearchingFriend)
                return;
            this._isSearchingFriend = true;
            this.sendPacket({ cmd: 'searchFriend', name: name });
        };
        GameLink.prototype._recv_searchFriendResult = function (obj) {
            this._isSearchingFriend = false;
            HallUI_2.HallUI.instance.recvSearchFriendResult(obj.friends);
        };
        GameLink.prototype.sendReqAddFriend = function (key) {
            this.sendPacket({ cmd: 'reqAddFriend', key: key });
        };
        GameLink.prototype.sendUseDiamond = function (count, reason) {
            this.sendPacket({ cmd: 'useDiamond', count: count, reason: reason });
        };
        GameLink.prototype._recv_animation = function (obj) {
            HallUI_2.HallUI.instance.recvPlayAnimation(obj);
        };
        //是不是有免费的买宠物可以用，这个包装一下'firstFreeGift'字符串
        GameLink.prototype.hasFreeGift = function () {
            return !this.boughtItems || this.boughtItems.indexOf('firstFreeGift') < 0;
        };
        GameLink.prototype.sendTriggerEvent = function (type) {
            this.sendPacket({ cmd: 'triggerEvent', type: type });
        };
        //加入匹配
        GameLink.prototype.sendEnterMatch = function (type) {
            this.lastEnterMatch = type;
            this.sendPacket({ cmd: 'reqEnterMatch', type: type });
        };
        //取消匹配
        GameLink.prototype.sendLeaveMatch = function () {
            this.sendPacket({ cmd: 'reqLeaveMatch' });
        };
        //对战游戏，加载完成
        GameLink.prototype.sendMatchReady = function () {
            this.sendPacket({ cmd: 'match_ready' });
        };
        //对战游戏，通知自己的分数
        GameLink.prototype.sendMatchScore = function (score, leftTime) {
            this.sendPacket({ cmd: 'match_score', gameScore: score, gameLeftGame: leftTime });
        };
        GameLink.prototype._recv_enter_match = function (obj) {
            HallUI_2.HallUI.instance.showMatchingPanel(true, obj.count, obj.type);
            this.matchPlayers.length = 0;
        };
        GameLink.prototype._recv_match_start = function (obj) {
            console.log('匹配成功：开始加载游戏');
            HallUI_2.HallUI.instance.showMatchingPanel(false);
            GameStage_3.GameStage.instance.createGame(obj.gameStartObject);
        };
        GameLink.prototype._recv_match_go = function (obj) {
            console.log('对战开始，go');
            var game = GameStage_3.GameStage.instance._currentGame;
            if (game) {
                game.matchGameStart();
            }
        };
        GameLink.prototype._recv_match_playerStatus = function (obj) {
            var game = GameStage_3.GameStage.instance._currentGame;
            if (game) {
                game.setMatchPlayerScore(obj);
            }
        };
        GameLink.prototype._recv_match_player = function (obj) {
            this.matchPlayers.push(obj);
            HallUI_2.HallUI.instance.updateMatchPanel(this.matchPlayers);
        };
        GameLink.prototype._recv_cancel_match_game = function (obj) {
            GameStage_3.GameStage.instance.closeMatchGame();
            this.matchPlayers.length = 0;
        };
        GameLink.prototype._recv_enter_match_error = function (obj) {
            if (obj.nocoin) {
                HallUI_2.HallUI.instance.showNoCoinDialog(obj.msg);
                return;
            }
            HallUI_2.HallUI.instance.showConfirmDialog(obj.msg);
        };
        GameLink.prototype._recv_weekRankList = function (obj) {
            this._weekRankList = obj.list;
            HallUI_2.HallUI.instance.refreshRankListPanel();
        };
        GameLink.prototype.getWeekRankList = function () {
            var me = {
                key: this.key,
                index: this.weekRankPosition - 1,
                name: this.nickname,
                score: this.weekHighScore,
                faceurl: this.faceurl
            };
            var arr = [me];
            if (this._weekRankList) {
                for (var i = 0; i < this._weekRankList.length; ++i) {
                    var p = this._weekRankList[i];
                    p.index = i;
                    p.name = p.nickname;
                    arr.push(p);
                }
            }
            else {
                if (!this._weekRankListQuried) {
                    this.sendPacket({ cmd: 'queryWeekRankList' });
                    this._weekRankListQuried = true;
                }
            }
            return arr;
        };
        GameLink.prototype.sendReqTutorialPlay = function () {
            this.sendPacket({ cmd: 'reqTutorialPlay' });
        };
        return GameLink;
    }());
    exports.GameLink = GameLink;
    //稳定的排序，总是降序的
    function sortOnKey(arr, key) {
        var count = arr.length;
        var swapped = false;
        do {
            swapped = false;
            for (var i = 0; i < count - 1; ++i) {
                if (arr[i][key] < arr[i + 1][key]) {
                    var tmp = arr[i];
                    arr[i] = arr[i + 1];
                    arr[i + 1] = tmp;
                    swapped = true;
                }
            }
        } while (swapped);
    }
    function getBackUrl() {
        var white_qs = ['enuid', 'nickname', 'face', 'type'];
        var qs = util.getQueryString();
        var qs2 = {};
        for (var _i = 0, white_qs_1 = white_qs; _i < white_qs_1.length; _i++) {
            var key = white_qs_1[_i];
            if (key in qs) {
                qs2[key] = qs[key];
            }
        }
        var url = location.protocol + "//" + location.host + location.pathname + '?' + util.encodeQueryString(qs2);
        return url;
    }
});
define("client/src/hall/HeadBarUI", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/GameLink"], function (require, exports, HallUI_3, ImageButton_1, GameLink_2) {
    "use strict";
    var HeadBarUI = (function () {
        function HeadBarUI() {
            var _this = this;
            this.spr = new createjs.Container();
            var background = new createjs.Bitmap(HallUI_3.HallUI.instance.getImage('hall/headbar_background'));
            //background.set({ x: 18, y: 14 });
            var taskProgress = this._taskProgress = new createjs.Bitmap(HallUI_3.HallUI.getImage('hall/headbar_exp_progress'));
            taskProgress.set({ x: 60, y: 86 });
            //taskProgress.maxWidth = 149;
            //taskProgress.percent = 0.5;
            taskProgress.scaleX = 0.8;
            //text
            var taskNumberText = this._taskNumberText = new createjs.Text('0%', '22px SimHei', 'white');
            taskNumberText.set({ x: 166, y: 97 });
            taskNumberText.textAlign = 'right';
            var coinNumberText = this._coinNumberText = new createjs.Text('0000', '22px SimHei', 'white');
            coinNumberText.set({ x: 356, y: 97 });
            coinNumberText.textAlign = 'right';
            var diamondNumberText = this._diamondNumberText = new createjs.Text('0000', '22px SimHei', 'white');
            diamondNumberText.set({ x: 572, y: 97 });
            diamondNumberText.textAlign = 'right';
            diamondNumberText.shadow = coinNumberText.shadow = taskNumberText.shadow = new createjs.Shadow('#e61c65', 2, 2, 1);
            //let star = new createjs.Bitmap(HallUI.instance.getImage('hall/star'));
            //star.set({ x: 19, y: 13 });
            this._petIcon = new createjs.Bitmap(null);
            this._petIcon.set({ x: 51, y: 104 });
            //buttons
            var btnAddCoin = this._btnAddCoin = new ImageButton_1.ImageButton(HallUI_3.HallUI.instance.getImage('hall/plus'));
            btnAddCoin.set({ x: 382, y: 108 });
            var btnAddDiamond = this._btnAddDiamond = new ImageButton_1.ImageButton(HallUI_3.HallUI.instance.getImage('hall/plus'));
            btnAddDiamond.set({ x: 599, y: 108 });
            btnAddCoin.onClick = function () { return _this._onClickAddCoin(); };
            btnAddDiamond.onClick = function () { return _this._onClickAddDiamond(); };
            //let levelText = this._levelText = new createjs.Text('99', '22px SimHei', 'white');
            //levelText.textAlign = 'center';
            //levelText.x = 54;
            //levelText.y = 37;
            //levelText.shadow = new createjs.Shadow('black', 2, 2, 1);
            //下面开始各种addChild，注意层次。
            this.spr.addChild(background);
            this.spr.addChild(taskProgress);
            this.spr.addChild(this._petIcon);
            this.spr.addChild(taskNumberText);
            this.spr.addChild(coinNumberText);
            this.spr.addChild(diamondNumberText);
            this.spr.addChild(btnAddCoin);
            this.spr.addChild(btnAddDiamond);
            //this.spr.addChild(levelText);
            this.setTaskProgress(0.23);
        }
        HeadBarUI.prototype.setTaskProgress = function (percent) {
            //this._taskProgress.percent = percent;
            if (!this._taskProgress.mask) {
                this._taskProgress.mask = new createjs.Shape();
            }
            var g = this._taskProgress.mask.graphics;
            var image = this._taskProgress.image;
            g.clear();
            g.beginFill('white');
            g.drawRect(this._taskProgress.x, this._taskProgress.y, image.width * percent, image.height);
            g.endFill();
            var n = ((percent * 100) | 0).toString() + '%';
            this._taskNumberText.text = n;
        };
        HeadBarUI.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            this.spr.visible = isShow;
        };
        HeadBarUI.prototype.refresh = function () {
            var link = GameLink_2.GameLink.instance;
            this._coinNumberText.text = link.coin.toString();
            this._diamondNumberText.text = link.diamond.toString();
            var pet = link.getPetInfo(link.currentPet);
            if (pet) {
                this.setTaskProgress(pet.exp / pet.expTotal);
            }
            else {
                this.setTaskProgress(0);
            }
            var petImage = HallUI_3.HallUI.instance.getPetImage(link.currentPet);
            if (petImage) {
                this._petIcon.image = petImage;
                this._petIcon.regX = petImage.width / 2;
                this._petIcon.regY = petImage.height / 2;
            }
        };
        HeadBarUI.prototype._onClickAddCoin = function () {
            HallUI_3.HallUI.instance.showBuyCoin();
        };
        HeadBarUI.prototype._onClickAddDiamond = function () {
            HallUI_3.HallUI.instance.showBuyDiamond();
        };
        return HeadBarUI;
    }());
    exports.HeadBarUI = HeadBarUI;
});
define("client/src/hall/shared/VerticalScrollPanel", ["require", "exports", "client/src/GameStage"], function (require, exports, GameStage_4) {
    "use strict";
    //todo: 惯性
    var VerticalScrollPanel = (function () {
        function VerticalScrollPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this.container = new createjs.Container();
            this._hitArea = new createjs.Shape();
            this._mask = new createjs.Shape();
            this._width = 0;
            this._height = 0;
            this._contentHeight = 0;
            this._lastX = 0;
            this._lastY = 0;
            this._isDragging = false;
            /**一个设置选项，是否允许在拖动的过程中，临时拖出限制的范围 */
            this._allowDragOutside = true;
            //this.spr.addChild(this._mask);
            //this._mask.visible = false;
            this.spr.addChild(this._hitArea);
            this.spr.addChild(this.container);
            this._hitArea.hitArea = new createjs.Shape(this._mask.graphics);
            this.spr.mask = this._mask;
            this._mask.transformMatrix = this.spr.transformMatrix;
            this.spr.addEventListener('mousedown', function (e) { return _this.onMouseDown(e); });
            this.spr.addEventListener('pressmove', function (e) { return _this.onPressMove(e); });
            this.spr.addEventListener('pressup', function (e) { return _this.onPressUp(e); });
        }
        Object.defineProperty(VerticalScrollPanel.prototype, "height", {
            get: function () { return this._height; },
            enumerable: true,
            configurable: true
        });
        VerticalScrollPanel.prototype.setVisualizeMask = function (x) {
            this._hitArea.graphics = x ? this._mask.graphics : null;
        };
        VerticalScrollPanel.prototype.addChild = function (c) {
            this.container.addChild(c);
        };
        VerticalScrollPanel.prototype.removeChild = function (c) {
            this.container.removeChild(c);
        };
        VerticalScrollPanel.prototype._checkVisible = function (c) {
            var bounds = c.getBounds();
            var y0 = c.y + bounds.y;
            var y1 = y0 + bounds.height;
            var pos = this.position;
            var pos2 = pos + this._height;
            return (pos <= y0 && y0 <= pos2) || (pos <= y1 && y1 <= pos2);
        };
        VerticalScrollPanel.prototype._updateVisibility = function () {
            var children = this.container.children;
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var c = children_1[_i];
                c.visible = this._checkVisible(c);
            }
        };
        VerticalScrollPanel.prototype.setPos = function (pos) {
            this.spr.set(pos);
            this._mask.set(pos);
            //this._hitArea.set(pos);
        };
        VerticalScrollPanel.prototype.setSize = function (width, height) {
            if (this._width != width || this._height != width) {
                this._width = width;
                this._height = height;
                var g = this._mask.graphics;
                g.clear();
                g.beginFill('rgba(0,0,0,0.2)');
                g.drawRect(0, 0, width, height);
                g.endFill();
            }
        };
        Object.defineProperty(VerticalScrollPanel.prototype, "contentHeight", {
            get: function () { return this._contentHeight; },
            set: function (val) {
                if (this._contentHeight !== val) {
                    this._contentHeight = val;
                    if (!this._isDragging || !this._allowDragOutside) {
                        this._constrainPosition();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VerticalScrollPanel.prototype, "position", {
            get: function () { return -this.container.y; },
            /**设置position的时候，不会限制position的取值范围 */
            set: function (val) {
                if (this.container.y !== -val) {
                    this.container.y = -val;
                    this._updateVisibility();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VerticalScrollPanel.prototype, "maxPosition", {
            get: function () {
                if (this._height >= this._contentHeight)
                    return 0;
                return this._contentHeight - this._height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VerticalScrollPanel.prototype, "minPosition", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        //events
        VerticalScrollPanel.prototype.onMouseDown = function (e) {
            this._lastX = e.stageX;
            this._lastY = e.stageY;
        };
        VerticalScrollPanel.prototype.onPressMove = function (e) {
            this._isDragging = true;
            var dy = e.stageY - this._lastY;
            if (dy !== 0) {
                this.position -= dy;
                if (!this._allowDragOutside) {
                    this._constrainPosition();
                }
                GameStage_4.GameStage.instance.makeDirty();
            }
            this._lastX = e.stageX;
            this._lastY = e.stageY;
        };
        VerticalScrollPanel.prototype.onPressUp = function (e) {
            this._isDragging = false;
            this._constrainPosition();
        };
        VerticalScrollPanel.prototype._constrainPosition = function () {
            if (this.position < this.minPosition)
                this.position = this.minPosition;
            else if (this.position > this.maxPosition)
                this.position = this.maxPosition;
        };
        return VerticalScrollPanel;
    }());
    exports.VerticalScrollPanel = VerticalScrollPanel;
});
/// <refrernce path="../typings/tsd.d.ts"/>
define("client/src/FixSizeBitmap", ["require", "exports"], function (require, exports) {
    "use strict";
    function MakeSuitableSize(bitmap, width, height, defaultImage) {
        var getImage = function () { return bitmap.image; };
        var _scaleX = 1;
        var _scaleY = 1;
        function getScale() {
            var image = getImage();
            if (image && image.width > 0 && image.height > 0) {
                var sx = width / image.width;
                var sy = height / image.height;
                return Math.min(sx, sy);
            }
            return 0;
        }
        function setScaleX(val) { _scaleX = val; }
        function setScaleY(val) { _scaleY = val; }
        function getScaleX() { return getScale() * _scaleX; }
        function getScaleY() { return getScale() * _scaleY; }
        if (defaultImage) {
            var _image = bitmap.image;
            getImage = function () {
                if (_image && _image.width > 0)
                    return _image;
                return defaultImage;
            };
            Object.defineProperty(bitmap, 'image', {
                get: getImage, set: function (val) { _image = val; }
            });
        }
        Object.defineProperty(bitmap, 'scaleX', { get: getScaleX, set: setScaleX });
        Object.defineProperty(bitmap, 'scaleY', { get: getScaleY, set: setScaleY });
        Object.defineProperty(bitmap, 'regX', {
            get: function () {
                var image = getImage();
                if (image && image.width > 0)
                    return image.width / 2;
                return 0;
            }
        });
        Object.defineProperty(bitmap, 'regY', {
            get: function () {
                var image = getImage();
                if (image && image.width > 0)
                    return image.height / 2;
                return 0;
            }
        });
    }
    exports.MakeSuitableSize = MakeSuitableSize;
});
define("client/src/hall/friend/OneFriendEntry", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/GameLink", "client/src/util", "client/src/FixSizeBitmap"], function (require, exports, HallUI_4, ImageButton_2, GameLink_3, util, FixSizeBitmap) {
    "use strict";
    var OneFriendEntry = (function () {
        //private _selfIconFrame: createjs.Bitmap;
        function OneFriendEntry() {
            var _this = this;
            this.spr = new createjs.Container();
            this.width = 0;
            this.height = 0;
            var background = new createjs.Bitmap(HallUI_4.HallUI.instance.getImage('hall/friend_background'));
            this.width = background.image.width;
            this.height = background.image.height;
            this.spr.setBounds(0, 0, this.width, this.height);
            //let iconFrame = new createjs.Bitmap(HallUI.instance.getImage('hall/friend_icon_background'));
            //iconFrame.set({ x: 100, y: 7 });
            //this._petBitmap = new createjs.Bitmap(null);
            //this._petBitmap.set({ x: 190, y: 95 });
            //this._petBitmap.set({ regX: 40, regY: 40 });
            //this._petBitmap.set({ scaleX: 0.5, scaleY: 0.5 });
            this._posIcon = new createjs.Bitmap(null);
            this._posIcon.set({ x: 60, y: 50 });
            //this._indexBitmap0 = new createjs.Bitmap(null);
            //this._indexBitmap0.set({ x: 30, y: 60 });
            //this._indexBitmap1 = new createjs.Bitmap(null);
            //this._indexBitmap1.set({ x: 75, y: 60 });
            //iconFrame.addEventListener('click', () =>
            //{
            //	if (this._obj && this._obj.key)
            //	{
            //		HallUI.instance.showFriendInfoPanel(this._obj.key)
            //	}
            //})
            //this._selfIconFrame = new createjs.Bitmap(HallUI.getImage('hall/friend_self_frame'));
            //this._selfIconFrame.set({ x: 100, y: 7 });
            this._faceIcon = new createjs.Bitmap(null);
            FixSizeBitmap.MakeSuitableSize(this._faceIcon, 68, 68, HallUI_4.HallUI.getImage('hall/default_user_headicon'));
            this._faceIcon.set({ x: 154, y: 12 + 40 + 1 });
            this._faceIcon.hitArea = new createjs.Shape();
            this._faceIcon.mouseEnabled = false;
            var hitShape = new createjs.Shape();
            hitShape.x = this._faceIcon.x;
            hitShape.y = this._faceIcon.y;
            {
                var g = hitShape.graphics;
                g.beginFill('rgba(0,0,0,0.03)');
                g.drawRect(-34, -34, 68, 68);
                g.endFill();
            }
            hitShape.addEventListener('click', function () {
                if (_this._obj && _this._obj.key) {
                    HallUI_4.HallUI.instance.showFriendInfoPanel(_this._obj.key);
                }
            });
            //{
            //let face_mask = new createjs.Bitmap(HallUI.getImage('hall/face_mask'));
            //face_mask.set({
            //	x: 100, y: 7,
            //});
            //this._firstOneIcon = new createjs.Bitmap(HallUI.getImage('hall/friend_first_icon'));
            //this._firstOneIcon.set({ x: 170, y: -10 });
            var nameText = this._nameText = new createjs.Text('名字名字名字', '20px SimHei', 'white');
            nameText.set({ x: 224, y: 22 });
            //this._nameTextOutline = new createjs.Text('', nameText.font, 'white');
            //this._nameTextOutline.outline = 2;
            //this._nameTextOutline.x = nameText.x;
            //this._nameTextOutline.y = nameText.y;
            var _btnHeart = this._btnHeart = new ImageButton_2.ImageButton(HallUI_4.HallUI.instance.getImage('hall/btn_send_heart'));
            _btnHeart.onClick = function () { return _this._onClickHeart(); };
            _btnHeart.set({ x: 460, y: 55 });
            this._scoreText = new createjs.Text('998,122,222', '30px Arial', 'white');
            this._scoreText.textAlign = 'left';
            this._scoreText.set({ x: 224, y: 60 });
            this.spr.addChild(this._faceIcon);
            this.spr.addChild(background);
            this.spr.addChild(hitShape);
            //this.spr.addChild(iconFrame);
            //this.spr.addChild(face_mask);
            //this.spr.addChild(this._selfIconFrame);
            //this.spr.addChild(this._petBitmap);
            //this.spr.addChild(this._indexBitmap0);
            //this.spr.addChild(this._indexBitmap1);
            this.spr.addChild(this._posIcon);
            //this.spr.addChild(this._firstOneIcon);
            //this.spr.addChild(this._nameTextOutline);
            this.spr.addChild(nameText);
            this.spr.addChild(this._scoreText);
            this.spr.addChild(_btnHeart);
            //this.spr.cache(0, 0, this.width, this.height);
        }
        OneFriendEntry.prototype.setFriendInfo = function (obj) {
            this._obj = obj;
            var name = obj.name || "";
            if (name.length > 9) {
                name = name.substr(0, 9) + "...";
            }
            this._nameText.text = name;
            //this._firstOneIcon.visible = obj.index === 0;
            var posImage = null;
            switch (obj.index) {
                case 0:
                    posImage = HallUI_4.HallUI.getImage('hall/friend_pos1');
                    break;
                case 1:
                    posImage = HallUI_4.HallUI.getImage('hall/friend_pos2');
                    break;
                case 2:
                    posImage = HallUI_4.HallUI.getImage('hall/friend_pos3');
                    break;
                default:
                    posImage = null;
                    break;
            }
            this._posIcon.image = posImage;
            if (posImage) {
                this._posIcon.regX = posImage.width / 2;
                this._posIcon.regY = posImage.height / 2;
            }
            //this._selfIconFrame.visible = obj.key === GameLink.instance.key;
            /*
            let index = (obj.index | 0) + 1;
            let d1 = (index / 10) | 0;
            let d0 = (index % 10);
            if (d1 >= 0 && d1 <= 9)
            {
                let image = this._indexBitmap0.image = HallUI.getImage('hall/friend_' + d1);
                this._indexBitmap0.set({
                    regX: image.width / 2,
                    regY: image.height / 2
                });
            }
            else
            {
                this._indexBitmap0.image = null;
            }
            if (d0 >= 0 && d0 <= 9)
            {
                let image = this._indexBitmap1.image = HallUI.getImage('hall/friend_' + d0);
                this._indexBitmap1.set({
                    regX: image.width / 2,
                    regY: image.height / 2
                });
            }
            else
            {
                this._indexBitmap1.image = null;
            }*/
            if (!obj.faceurl) {
                this._faceIcon.visible = true;
                this._faceIcon.image = null;
            }
            else {
                var image = new Image();
                image.src = obj.faceurl;
                this._faceIcon.image = image;
                this._faceIcon.visible = true;
            }
            this._scoreText.text = util.intToString((obj.score | 0));
            this._btnHeart.image = !!obj.canSendHeart ? HallUI_4.HallUI.getImage('hall/btn_send_heart') : HallUI_4.HallUI.getImage('hall/btn_send_heart_invalid');
            //this._petBitmap.image = HallUI.instance.getPetImage(obj.currentPet);
            //Object.defineProperty(this._petBitmap, 'image', { get: () => HallUI.instance.getPetImage(obj.currentPet) });
            //this.spr.updateCache();
        };
        OneFriendEntry.prototype._onClickHeart = function () {
            if (this._obj && typeof this._obj.key === 'string' &&
                this._btnHeart.image === HallUI_4.HallUI.getImage('hall/btn_send_heart')) {
                this._playFlyHeartAnimation();
                this._btnHeart.image = HallUI_4.HallUI.getImage('hall/btn_send_heart_invalid');
                GameLink_3.GameLink.instance.sendFriendHeart(this._obj.key);
            }
        };
        OneFriendEntry.prototype._playFlyHeartAnimation = function () {
            var from = this.spr.localToGlobal(460, 66);
            var to1 = this._faceIcon.localToGlobal(0, 0), to2 = { x: 436, y: 135 };
            to1.x += 20;
            to1.y += 20;
            var bitmap1 = new createjs.Bitmap(HallUI_4.HallUI.instance.getImage('hall/full_heart'));
            bitmap1.x = from.x;
            bitmap1.y = from.y;
            bitmap1.regX = bitmap1.image.width / 2;
            bitmap1.regY = bitmap1.image.height / 2;
            var bitmap2 = bitmap1.clone();
            HallUI_4.HallUI.instance.spr.addChild(bitmap1);
            HallUI_4.HallUI.instance.spr.addChild(bitmap2);
            createjs.Tween.get(bitmap1).to({ y: from.y + 70 }, 300).to(to1, 300).call(function () { return HallUI_4.HallUI.instance.spr.removeChild(bitmap1); });
            createjs.Tween.get(bitmap2).to({ x: from.x + 70 }, 300).to(to2, 300).call(function () { return HallUI_4.HallUI.instance.spr.removeChild(bitmap2); });
        };
        return OneFriendEntry;
    }());
    exports.OneFriendEntry = OneFriendEntry;
});
define("client/src/hall/friend/HelpPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton"], function (require, exports, HallUI_5, resource_2, ImageButton_3) {
    "use strict";
    var HelpPanel = (function () {
        function HelpPanel(titleImageId) {
            var _this = this;
            this.spr = new createjs.Container();
            //black mask
            {
                var bgMask = new createjs.Shape();
                var g = bgMask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_2.GraphicConstant.SCREEN_WIDTH, resource_2.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
                this.spr.addChild(bgMask);
                bgMask.addEventListener('mousedown', function () { });
            }
            //background
            {
                var bg = new createjs.Bitmap(HallUI_5.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 35, y: 89 });
                this.spr.addChild(bg);
            }
            /*{
                let bitmap = new createjs.Bitmap(HallUI.getImage('hall/game_item_help_title'));
                bitmap.set({ x: 240, y: 198 });
                this.spr.addChild(bitmap);
            }*/
            //text
            {
                var image = HallUI_5.HallUI.getImage(titleImageId);
                var bitmap = new createjs.Bitmap(image);
                bitmap.set({ x: 320, y: 188, regX: image.width / 2 });
                this.spr.addChild(bitmap);
            }
            //close button
            {
                var btnClose = new ImageButton_3.ImageButton(HallUI_5.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: resource_2.GraphicConstant.SCREEN_WIDTH / 2, y: 885 });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    if (_this.spr.parent) {
                        _this.spr.parent.removeChild(_this.spr);
                    }
                };
            }
        }
        return HelpPanel;
    }());
    exports.HelpPanel = HelpPanel;
});
define("client/src/hall/friend/FriendPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/hall/shared/VerticalScrollPanel", "client/src/hall/friend/OneFriendEntry", "client/src/ImageButton"], function (require, exports, HallUI_6, VerticalScrollPanel_1, OneFriendEntry_1, ImageButton_4) {
    "use strict";
    /** 面板的位置 */
    var BASE_POS = { x: 17, y: 202 - 14 };
    var FRIEND_ENTRY_X = 10;
    var FRIEND_ENTRY_Y = 10;
    var FRIEND_ENTRY_Y_GAP = 18;
    var FriendPanel = (function () {
        function FriendPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this._friendEntries = [];
            var background = new createjs.Bitmap(HallUI_6.HallUI.instance.getImage('hall/friend_panel_background'));
            background.set(BASE_POS);
            //let title = new createjs.Bitmap(HallUI.getImage('hall/friend_title_text'));
            //title.set({ x: 30 + BASE_POS.x, y: 95 + BASE_POS.y })
            var _btnInviteFriends = this._btnInviteFriends = new ImageButton_4.ImageButton(HallUI_6.HallUI.instance.getImage('hall/friend_invite'));
            /*
                    this._btnToggleFriendSort = new ImageButton(HallUI.getImage('hall/btn_weekScore'));
                    this._btnToggleFriendSort.set({ x: 490, y: 316 });
                    this._btnToggleFriendSort.onClick = () =>
                    {
                        HallUI.instance.toggleFriendSort();
                        this._btnToggleFriendSort.image = HallUI.instance._currentFriendSort === "weekHighScore" ? HallUI.getImage('hall/btn_weekScore') : HallUI.getImage('hall/btn_historicalScore');
                    };
            */
            var sortButtonBgImage = HallUI_6.HallUI.getImage('hall/sort_btn_bg');
            this._btnWeekSort = {
                image1: HallUI_6.HallUI.getImage('hall/week_sort_btn_sel'),
                image2: HallUI_6.HallUI.getImage('hall/week_sort_btn'),
                bg: new createjs.Bitmap(sortButtonBgImage),
                btn: new ImageButton_4.ImageButton(HallUI_6.HallUI.getImage('hall/week_sort_btn_sel'))
            };
            this._btnHistoricalSort = {
                image1: HallUI_6.HallUI.getImage('hall/historical_sort_btn_sel'),
                image2: HallUI_6.HallUI.getImage('hall/historical_sort_btn'),
                bg: new createjs.Bitmap(sortButtonBgImage),
                btn: new ImageButton_4.ImageButton(HallUI_6.HallUI.getImage('hall/historical_sort_btn_sel'))
            };
            this._btnWeekSort.btn.set({ x: 389, y: 325 });
            this._btnWeekSort.bg.set({
                x: 389, y: 325,
                regX: sortButtonBgImage.width / 2,
                regY: sortButtonBgImage.height / 2
            });
            this._btnHistoricalSort.btn.set({ x: 508, y: 325 });
            this._btnHistoricalSort.bg.set({
                x: 508, y: 325,
                regX: sortButtonBgImage.width / 2,
                regY: sortButtonBgImage.height / 2
            });
            this.refreshSortButton();
            this._btnWeekSort.btn.onClick = function () {
                HallUI_6.HallUI.instance.setFriendSort('weekHighScore');
                _this.refreshSortButton();
            };
            this._btnHistoricalSort.btn.onClick = function () {
                HallUI_6.HallUI.instance.setFriendSort('historicalHighScore');
                _this.refreshSortButton();
            };
            //this._imageLamaTip = new createjs.Bitmap(HallUI.getImage('hall/lama_tip_text'));
            var friendListPanel = this._friendListPanel = new VerticalScrollPanel_1.VerticalScrollPanel();
            friendListPanel.setPos({ x: 33 + BASE_POS.x, y: 157 + BASE_POS.y });
            friendListPanel.setSize(540, 450);
            friendListPanel.setVisualizeMask(false);
            friendListPanel.addChild(_btnInviteFriends);
            //friendListPanel.addChild(this._imageLamaTip);
            //let helpButton = new ImageButton(HallUI.getImage('hall/game_item_help_button'));
            //helpButton.set({ x: 569, y: 219 });
            //helpButton.onClick = () => { this.onClickHelp(); }
            this.spr.addChild(background);
            //this.spr.addChild(title);
            this.spr.addChild(this._btnWeekSort.bg, this._btnWeekSort.btn);
            this.spr.addChild(this._btnHistoricalSort.bg, this._btnHistoricalSort.btn);
            this.spr.addChild(friendListPanel.spr);
            //this.spr.addChild(this._btnToggleFriendSort);
            //this.spr.addChild(helpButton);
            _btnInviteFriends.onClick = function () { return _this._onClickInviteFriend(); };
            //sample data
            var ff = [];
            for (var i = 0; i < 10; ++i) {
                ff.push({ name: "\u540D\u5B57\u540D\u5B57:" + i, index: i });
            }
            this.setFriends(ff);
        }
        /*
        private onClickHelp()
        {
            let id = '';
            if (HallUI.instance._currentFriendSort === "weekHighScore")
            {
                id = 'hall/help_text_weekly_highscore_award'
            }
            else
            {
                id = 'hall/help_text_historical_highscore_award'
            }
            let helpPanel = new HelpPanel(id);
            HallUI.instance.spr.addChild(helpPanel.spr);
        }*/
        FriendPanel.prototype.refreshSortButton = function () {
            var setup = function (obj, str) {
                if (HallUI_6.HallUI.instance.currentFriendSort === str) {
                    obj.btn.image = obj.image1;
                    obj.bg.visible = true;
                }
                else {
                    obj.btn.image = obj.image2;
                    obj.bg.visible = false;
                }
            };
            setup(this._btnWeekSort, 'weekHighScore');
            setup(this._btnHistoricalSort, 'historicalHighScore');
        };
        FriendPanel.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            this.spr.visible = isShow;
        };
        FriendPanel.prototype.setFriends = function (friends) {
            this._setFriendCount(friends.length);
            for (var i = 0; i < friends.length; ++i) {
                this._friendEntries[i].setFriendInfo(friends[i]);
            }
        };
        FriendPanel.prototype._onClickInviteFriend = function () {
            HallUI_6.HallUI.instance.showAddFriend();
        };
        FriendPanel.prototype._setFriendCount = function (n) {
            var someEntry;
            if (n < this._friendEntries.length) {
                for (var i = n; i < this._friendEntries.length; ++i) {
                    var entry = this._friendEntries[i];
                    this._friendListPanel.removeChild(entry.spr);
                    someEntry = entry;
                }
            }
            else if (n > this._friendEntries.length) {
                for (var i = this._friendEntries.length; i < n; ++i) {
                    var entry = new OneFriendEntry_1.OneFriendEntry();
                    entry.spr.x = FRIEND_ENTRY_X;
                    entry.spr.y = FRIEND_ENTRY_Y + i * (FRIEND_ENTRY_Y_GAP + entry.height);
                    this._friendListPanel.addChild(entry.spr);
                    this._friendEntries.push(entry);
                    someEntry = entry;
                }
            }
            this._friendEntries.length = n;
            var friendContentHeight = 0;
            if (n > 0 && someEntry) {
                friendContentHeight = FRIEND_ENTRY_Y + n * (FRIEND_ENTRY_Y_GAP + someEntry.height);
                this._btnInviteFriends.x = 540 / 2;
                this._btnInviteFriends.y = friendContentHeight + this._btnInviteFriends.image.height / 2;
                //this._imageLamaTip.x = 16;
                //this._imageLamaTip.y = this._btnInviteFriends.y + 50;
                this._friendListPanel.contentHeight = friendContentHeight + 63 + 40; //+ this._imageLamaTip.image.height;
            }
        };
        return FriendPanel;
    }());
    exports.FriendPanel = FriendPanel;
});
///<reference path="../../typings/tsd.d.ts"/>
define("client/src/game/GameUtil", ["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * 非负整数n，转换成图片,剧中排列
     * digits保存了图片，需要11个 0123456789,
     * 返回的bitmap已经调整好位置了，使得原点在整个字的中下。
     */
    function createDigitBitmap(n, digits, useComma) {
        var ret = [];
        if (n < 0)
            n = 0;
        var str = (n | 0).toString();
        if (useComma) {
            var arr = [];
            var arr2 = [];
            for (var _i = 0, str_2 = str; _i < str_2.length; _i++) {
                var c = str_2[_i];
                arr.push(c);
            }
            arr = arr.reverse();
            for (var i = 0; i < arr.length; ++i) {
                if (i > 0 && i % 3 == 0)
                    arr2.push(',');
                arr2.push(arr[i]);
            }
            str = arr2.reverse().join('');
        }
        //暂时只考虑所有图片大小都是相同的情况
        var width = digits[0].width;
        var height = digits[0].height;
        var x = -(width * str.length) / 2;
        var y = -height;
        for (var i = 0; i < str.length; ++i) {
            var c = str[i];
            var image = void 0;
            if (c == ',') {
                image = digits[10];
            }
            else {
                image = digits[c | 0];
            }
            if (image) {
                var bitmap = new createjs.Bitmap(image);
                bitmap.x = x;
                bitmap.y = y;
                x += width;
                ret.push(bitmap);
            }
        }
        return ret;
    }
    exports.createDigitBitmap = createDigitBitmap;
    /**
     * TweenJs用的辅助函数
     */
    function removeSelfCallback(obj) {
        if (obj && obj.parent) {
            obj.parent.removeChild(obj);
        }
    }
    exports.removeSelfCallback = removeSelfCallback;
    function intToString(n) {
        n = n | 0;
        var str = n.toString();
        var arr = [];
        var arr2 = [];
        for (var _i = 0, str_3 = str; _i < str_3.length; _i++) {
            var c = str_3[_i];
            arr.push(c);
        }
        for (var i = arr.length - 1, j = 0; i >= 0; --i, ++j) {
            if (j > 0 && j % 3 == 0 && arr[i] != '-') {
                arr2.push(',');
            }
            arr2.push(arr[i]);
        }
        return arr2.reverse().join('');
    }
    exports.intToString = intToString;
    function circleSegmentIntersect(segmentP0, segmentP1, center, radius) {
        var dot = function (a, b) { return a.x * b.x + a.y * b.y; };
        var d = {
            x: segmentP1.x - segmentP0.x,
            y: segmentP1.y - segmentP0.y
        };
        var f = {
            x: segmentP0.x - center.x,
            y: segmentP0.y - center.y
        };
        var r = radius;
        var a = dot(d, d);
        var b = 2 * dot(f, d);
        var c = dot(f, f) - r * r;
        var discriminant = b * b - 4 * a * c;
        if (discriminant < 0)
            return false;
        discriminant = Math.sqrt(discriminant);
        var t1 = (-b - discriminant) / (2 * a);
        var t2 = (-b + discriminant) / (2 * a);
        if (t1 >= 0 && t1 <= 1)
            return true;
        if (t2 >= 0 && t2 <= 1)
            return true;
        return false;
    }
    exports.circleSegmentIntersect = circleSegmentIntersect;
    /**
     * 用来辅助做tween的obj
     * 因为createjs.Tween只支持设置属性，所以ScoreTweenHelper将set value变成回掉函数
     *
     * obj = new ScoreTweenHelper(初始数值, function(intValue){
     * 		//当调用obj.value = xxx的时候，调用这个回掉函数
     * })
     *
     * Tween.get(obj).to({value: 目标数值 })
     *
     */
    var ScoreTweenHelper = (function () {
        function ScoreTweenHelper(value, setter) {
            this._value = 0;
            this._value = value;
            this._setter = setter;
        }
        Object.defineProperty(ScoreTweenHelper.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (val) {
                var iVal = val | 0;
                if (iVal !== (this._value | 0)) {
                    this._setter(iVal);
                }
                this._value = val;
            },
            enumerable: true,
            configurable: true
        });
        return ScoreTweenHelper;
    }());
    exports.ScoreTweenHelper = ScoreTweenHelper;
});
define("client/src/hall/friend/FriendInfoPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton", "client/src/GameLink", "client/src/util", "client/src/FixSizeBitmap"], function (require, exports, HallUI_7, resource_3, ImageButton_5, GameLink_4, util, FixSizeBitmap) {
    "use strict";
    var ADD_TO_Y = 120;
    var FriendInfoPanel = (function () {
        function FriendInfoPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this._digits = util.cutRowImages(HallUI_7.HallUI.getImage('hall/week_score_number_digit'), 11);
            //black mask
            {
                var bgMask = new createjs.Shape();
                var g = bgMask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_3.GraphicConstant.SCREEN_WIDTH, resource_3.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
                this.spr.addChild(bgMask);
                bgMask.addEventListener('mousedown', function () { });
            }
            //background
            {
                var bg = new createjs.Bitmap(HallUI_7.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 35, y: 89 + ADD_TO_Y });
                this.spr.addChild(bg);
            }
            //head frame
            {
            }
            this._faceIcon = new createjs.Bitmap(null);
            FixSizeBitmap.MakeSuitableSize(this._faceIcon, 90, 90, HallUI_7.HallUI.getImage('hall/default_user_headicon'));
            this._faceIcon.set({ x: 35 + 48 + 4 + 45, y: 89 + 161 + 3 + 45 + ADD_TO_Y });
            this._faceIcon.mouseEnabled = false;
            this._faceIcon.hitArea = new createjs.Shape();
            this.spr.addChild(this._faceIcon);
            var facemask = this._faceIcon.mask = new createjs.Shape();
            {
                var g = facemask.graphics;
                g.beginFill('white');
                g.drawRoundRect(this._faceIcon.x - 45, this._faceIcon.y - 45, 90, 90, 10);
                g.endFill();
            }
            //let face_mask = new createjs.Bitmap(HallUI.getImage('hall/face_mask2'));
            //face_mask.set({
            //	x: 35 + 48, y: 89 + 161 + ADD_TO_Y,
            //});
            //this.spr.addChild(face_mask);
            //title
            {
                var title = new createjs.Bitmap(HallUI_7.HallUI.getImage('hall/friend_info_title'));
                title.set({ x: 239 + 35, y: 108 + 89 + ADD_TO_Y });
                this.spr.addChild(title);
            }
            //text bg
            {
                var bgbg = new createjs.Bitmap(HallUI_7.HallUI.getImage('hall/friend_info_bg'));
                bgbg.set({ x: 35 + 47, y: 89 + 274 + ADD_TO_Y });
                this.spr.addChild(bgbg);
            }
            //text lines
            {
                this._textLines = [];
                for (var i = 0; i < 7; ++i) {
                    var t = new createjs.Text('99998', '28px SimHei', 'white');
                    t.x = 221 + 35;
                    t.y = 273 + i * 38 + 89 + ADD_TO_Y;
                    this._textLines.push(t);
                    {
                    }
                    this.spr.addChild(t);
                }
            }
            //name text
            {
                var nameText = this._nameText = new createjs.Text('aaaa', '28px SimHei', 'white');
                nameText.x = 35 + 194;
                nameText.y = 89 + 17 + ADD_TO_Y + 160;
                {
                }
                this.spr.addChild(nameText);
            }
            {
                var weekScoreText = this._weekScoreText = new createjs.Text('9999', '28px Arial', 'white');
                weekScoreText.x = 35 + 194;
                weekScoreText.y = 89 + 221 + ADD_TO_Y;
                this.spr.addChild(weekScoreText);
            }
            //button
            {
                this._btnRemoveFriend = new ImageButton_5.ImageButton(HallUI_7.HallUI.getImage('hall/btn_remove_friend'));
                this._btnRemoveFriend.set({ x: 35 + 145, y: 89 + 574 + ADD_TO_Y });
                this.spr.addChild(this._btnRemoveFriend);
                this._btnRemoveFriend.onClick = function () {
                    HallUI_7.HallUI.instance.showConfirmDialog('是否确认解除好友关系', function () {
                        HallUI_7.HallUI.instance.closeConfirmDialog();
                        GameLink_4.GameLink.instance.sendRemoveFriend(_this.key);
                        _this.show(false);
                    });
                };
                this._btnAddHeart = new ImageButton_5.ImageButton(HallUI_7.HallUI.getImage('hall/btn_add_heart'));
                this._btnAddHeart.set({ x: 35 + 429, y: 89 + 574 + ADD_TO_Y });
                this.spr.addChild(this._btnAddHeart);
                this._btnAddHeart.onClick = function () {
                    GameLink_4.GameLink.instance.sendFriendHeart(_this.key);
                    _this.show(false);
                };
            }
            //close button
            {
                var btnClose = new ImageButton_5.ImageButton(HallUI_7.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: resource_3.GraphicConstant.SCREEN_WIDTH / 2, y: 885 + ADD_TO_Y });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    _this.show(false);
                };
            }
            this.spr.visible = false;
        }
        FriendInfoPanel.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            this.spr.visible = isShow;
        };
        //	_numbers: any[] = [];
        FriendInfoPanel.prototype.setInfo = function (obj) {
            if (obj.key === this.key) {
                this._textLines[0].text = obj.selPet;
                this._textLines[1].text = obj.highScore;
                this._textLines[2].text = obj.maxCombo;
                this._textLines[3].text = obj.maxLink;
                this._textLines[4].text = obj.petCount;
                this._textLines[5].text = obj.petTotalLevel;
                this._textLines[6].text = obj.totalKill;
                var name_2 = obj.nickname;
                if (name_2.length > 12) {
                    name_2 = name_2.substr(0, 12) + "...";
                }
                this._nameText.text = name_2;
                this._weekScoreText.visible = true;
                this._weekScoreText.text = obj.weekScore;
                this._btnAddHeart.visible = !!obj.canSendHeart;
                this._btnRemoveFriend.visible = !!obj.showRemoveFriend;
                if (obj.faceurl) {
                    this._faceIcon.visible = true;
                    var image = new Image();
                    image.src = obj.faceurl;
                    this._faceIcon.image = image;
                }
                else {
                    this._faceIcon.image = null;
                    this._faceIcon.visible = true;
                }
            }
        };
        FriendInfoPanel.prototype.clear = function () {
            this._nameText.text = '';
            this._weekScoreText.text = '';
            for (var _i = 0, _a = this._textLines; _i < _a.length; _i++) {
                var t = _a[_i];
                t.text = '';
            }
            this._btnAddHeart.visible = false;
            this._btnRemoveFriend.visible = false;
        };
        return FriendInfoPanel;
    }());
    exports.FriendInfoPanel = FriendInfoPanel;
});
define("client/src/hall/HeartBarUI", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/GameLink"], function (require, exports, HallUI_8, ImageButton_6, GameLink_5) {
    "use strict";
    var HeartBarUI = (function () {
        function HeartBarUI() {
            var _this = this;
            this.spr = new createjs.Container();
            this.FULL_HEART = HallUI_8.HallUI.instance.getImage('hall/full_heart');
            this.EMPTY_HEART = HallUI_8.HallUI.instance.getImage('hall/empty_heart');
            this._heartBitmaps = [];
            this._isClock = false;
            this._clockStartTime = 0;
            this._countDownTime = 0;
            this._refreshSent = false;
            //create hearts
            {
                var x = 0;
                var y = -3;
                var HEART_SPAN = 60; //this.FULL_HEART.width + 10;
                for (var i = 0; i < 5; ++i) {
                    var bitmap = new createjs.Bitmap(this.EMPTY_HEART);
                    bitmap.x = x + HEART_SPAN * i;
                    bitmap.y = y;
                    this._heartBitmaps.push(bitmap);
                    this.spr.addChild(bitmap);
                }
            }
            //some bg
            //let bg_panel = new createjs.Bitmap(HallUI.instance.getImage('hall/heart_text_bg'));
            //bg_panel.set({ x: 317, y: 0 });
            //this.spr.addChild(bg_panel);
            var _heartText = this._heartText = new createjs.Text('00:00', '22px SimHei', 'white');
            _heartText.set({ x: 377, y: 10 });
            _heartText.textAlign = 'right';
            this.spr.addChild(_heartText);
            var _btnAddHeart = this._btnAddHeart = new ImageButton_6.ImageButton(HallUI_8.HallUI.instance.getImage('hall/add_heart_btn'));
            _btnAddHeart.set({ x: 479 - 80, y: 20 });
            this.spr.addChild(_btnAddHeart);
            _btnAddHeart.onClick = function () {
                HallUI_8.HallUI.instance.showBuyHeart();
            };
            var _btnMail = this._btnMail = new ImageButton_6.ImageButton(HallUI_8.HallUI.instance.getImage('hall/mail'));
            _btnMail.set({ x: 457, y: 23 });
            this.spr.addChild(_btnMail);
            _btnMail.onClick = function () {
                HallUI_8.HallUI.instance.showMailPanel();
            };
            //mail count tip
            {
                var mailTip = this._mailTip = new createjs.Bitmap(HallUI_8.HallUI.getImage('hall/mail/tip'));
                mailTip.set({ x: 5, y: -40 });
                mailTip.scaleX = mailTip.scaleY = 0.9;
                mailTip.mouseEnabled = false;
                _btnMail.addChild(mailTip);
                var mailCount = this._mailCount = new createjs.Text('88', '22px SimHei', 'white');
                mailCount.set({ x: 23, y: -33 });
                mailCount.textAlign = 'center';
                _btnMail.addChild(mailCount);
            }
            this.spr.set({ x: 80, y: 222 });
            this.spr.addEventListener('tick', function () { return _this.tick(); });
            this.setHeartCount(3);
            this.setCountDown(2 * 3600 * 1000);
            this.setMailCount(0);
        }
        HeartBarUI.prototype.setMailCount = function (n) {
            if (n > 0) {
                this._mailTip.visible = true;
                this._mailCount.visible = true;
                this._mailCount.text = n.toString();
            }
            else {
                this._mailTip.visible = false;
                this._mailCount.visible = false;
            }
        };
        HeartBarUI.prototype.setHeartCount = function (n) {
            for (var i = 0; i < 5; ++i) {
                this._heartBitmaps[i].image = i < n ? this.FULL_HEART : this.EMPTY_HEART;
            }
        };
        //一个心往上飘的动画。游戏开始的时候放一下，表示失去了一颗心
        HeartBarUI.prototype.playMinusHeartAnimation = function (callback) {
            var heart;
            if (GameLink_5.GameLink.instance.heart > 5) {
                heart = new createjs.Bitmap(this.FULL_HEART);
                heart.set({
                    x: 390, y: 17,
                    regX: this.FULL_HEART.width / 2,
                    regY: this.FULL_HEART.height / 2
                });
            }
            else if (GameLink_5.GameLink.instance.heart > 0) {
                heart = this._heartBitmaps[GameLink_5.GameLink.instance.heart - 1].clone();
                this._heartBitmaps[GameLink_5.GameLink.instance.heart - 1].image = this.EMPTY_HEART;
            }
            this.spr.addChild(heart);
            heart.alpha = 1;
            var pt = this.spr.globalToLocal(326, 892);
            createjs.Tween.get(heart).to({ y: heart.y - 50 }, 300).to({
                x: pt.x, y: pt.y
            }, 500, createjs.Ease.cubicIn).wait(200).call(function () {
                heart.parent.removeChild(heart);
                if (callback)
                    callback();
            });
        };
        HeartBarUI.prototype.setExtraHeartCount = function (n) {
            this._isClock = false;
            this._heartText.text = n;
        };
        /**设置倒计时，单位：毫秒*/
        HeartBarUI.prototype.setCountDown = function (n) {
            this._isClock = true;
            this._countDownTime = n;
            this._clockStartTime = Date.now();
        };
        HeartBarUI.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            this.spr.visible = isShow;
        };
        HeartBarUI.prototype.refresh = function () {
            var link = GameLink_5.GameLink.instance;
            this.setHeartCount(link.heart);
            if (link.nextHeartTime > 0) {
                this.setCountDown(link.nextHeartTime);
            }
            else {
                this.setExtraHeartCount(link.heart >= 5 ? link.heart - 5 : 0);
            }
        };
        HeartBarUI.prototype.tick = function () {
            if (this._isClock) {
                var now = Date.now();
                var remainTime = this._clockStartTime + this._countDownTime - now;
                if (remainTime <= 0) {
                    this._heartText.text = '00:00';
                    if (remainTime < -2000 && !this._refreshSent) {
                        GameLink_5.GameLink.instance.sendRefresh();
                        this._refreshSent = true;
                    }
                }
                else {
                    this._refreshSent = false;
                    var seconds = (remainTime / 1000) | 0;
                    var minutes = (seconds / 60) | 0;
                    var hours = (minutes / 60) | 0;
                    minutes = minutes % 60;
                    seconds = seconds % 60;
                    if (minutes < 10)
                        minutes = '0' + minutes.toString();
                    if (seconds < 10)
                        seconds = '0' + seconds.toString();
                    var mm = remainTime % 1000;
                    var mark = (mm >= 500 && mm < 1000) ? ':' : ' ';
                    this._heartText.text = (minutes + mark + seconds);
                }
            }
        };
        return HeartBarUI;
    }());
    exports.HeartBarUI = HeartBarUI;
});
define("client/src/hall/confirm_dialog/DownloadAppConfirm", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton"], function (require, exports, HallUI_9, resource_4, ImageButton_7) {
    "use strict";
    var DownloadAppConfirm = (function () {
        function DownloadAppConfirm(config) {
            var _this = this;
            this.spr = new createjs.Container();
            //black mask
            {
                var bgMask = new createjs.Shape();
                var g = bgMask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_4.GraphicConstant.SCREEN_WIDTH, resource_4.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
                this.spr.addChild(bgMask);
                bgMask.addEventListener('mousedown', function () { });
            }
            //background
            {
                var bg = new createjs.Bitmap(HallUI_9.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 35, y: 89 + 110 });
                this.spr.addChild(bg);
            }
            //title
            {
                var image = HallUI_9.HallUI.getImage('hall/dialog_title');
                var bitmap = new createjs.Bitmap(image);
                bitmap.set({
                    x: 320, y: 210 + 110,
                    regX: image.width / 2, regY: image.height / 2
                });
                this.spr.addChild(bitmap);
            }
            //text
            var text = '将游戏下载到手机轻松快捷进\n入游戏！初次下载游戏将获得\n20000金币奖励！';
            var text2 = new createjs.Text(text, '30px SimHei', '#142d3e');
            text2.set({ x: 100, y: 300 + 110, lineHeight: 30 });
            this.spr.addChild(text2);
            {
                var okButton = new ImageButton_7.ImageButton(HallUI_9.HallUI.getImage('hall/mail/btngetmail'));
                okButton.set({ x: 320, y: 622 + 110 });
                okButton.onClick = function () {
                    if (config.onOk)
                        config.onOk();
                    if (!config.noAutoClose)
                        _this.close();
                };
                this.spr.addChild(okButton);
            }
            {
                var btnClose = new ImageButton_7.ImageButton(HallUI_9.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: resource_4.GraphicConstant.SCREEN_WIDTH / 2, y: 885 + 140 });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    if (config.onCancel)
                        config.onCancel();
                    if (!config.noAutoClose)
                        _this.close();
                };
            }
        }
        DownloadAppConfirm.prototype.close = function () {
            if (this.spr.parent)
                this.spr.parent.removeChild(this.spr);
        };
        return DownloadAppConfirm;
    }());
    exports.DownloadAppConfirm = DownloadAppConfirm;
});
define("client/src/hall/DailyTaskBarUI", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/hall/shared/ProgressBarControl", "client/src/SoundManager", "client/src/hall/confirm_dialog/DownloadAppConfirm", "client/src/GameLink"], function (require, exports, HallUI_10, ImageButton_8, ProgressBarControl_1, SoundManager_2, DownloadAppConfirm_1, GameLink_6) {
    "use strict";
    var BASE_POS = { x: 50, y: 704 };
    //每日任务的UI
    var DailyTaskBarUI = (function () {
        function DailyTaskBarUI() {
            this.spr = new createjs.Container();
            this.width = 534;
            this.height = 88;
            this.EMPTY_STAR_IMAGE = HallUI_10.HallUI.getImage('hall/task_star0');
            this.FULL_STAR_IMAGE = HallUI_10.HallUI.getImage('hall/task_star1');
            this._starBitmap = [];
            this.spr.set(BASE_POS);
            var btnConfig = this._btnConfig = new ImageButton_8.ImageButton(HallUI_10.HallUI.getImage('hall/gear'));
            btnConfig.set({ x: 45, y: 45 });
            var text = new createjs.Bitmap(HallUI_10.HallUI.getImage('hall/daily_task_text'));
            text.set({ x: 100, y: 6 });
            for (var i = 0; i < 3; ++i) {
                var bitmap = new createjs.Bitmap(this.EMPTY_STAR_IMAGE);
                bitmap.set({
                    x: 337 + i * 33,
                    y: 6
                });
                this._starBitmap.push(bitmap);
            }
            //progress bar bg
            var PROGRESS_CENTER = { x: 275, y: 59 };
            var progress_background = new createjs.Bitmap(HallUI_10.HallUI.getImage('hall/daily_task_progress_bg'));
            progress_background.set(PROGRESS_CENTER);
            progress_background.set({
                regX: progress_background.image.width / 2,
                regY: progress_background.image.height / 2
            });
            //progress bar
            var PROGRESS_BAR_WIDTH = 328;
            var _progressBar = this._progressBar = new ProgressBarControl_1.ProgressBarControl();
            _progressBar.set({
                x: PROGRESS_CENTER.x - PROGRESS_BAR_WIDTH / 2,
                y: PROGRESS_CENTER.y - 13
            });
            _progressBar.maxWidth = PROGRESS_BAR_WIDTH;
            _progressBar.percent = 0.5;
            //progress text
            var _progressText = this._progressText = new createjs.Text('222/333', '25px SimHei', 'white');
            _progressText.set(PROGRESS_CENTER);
            _progressText.y -= 12;
            _progressText.textAlign = 'center';
            _progressText.shadow = new createjs.Shadow('#f0266f', 1, 2, 1);
            var downloadButton = new ImageButton_8.ImageButton(HallUI_10.HallUI.instance.getImage('hall/download_button_image'));
            downloadButton.set({ x: 500, y: 50 });
            downloadButton.onClick = function () {
                var dlg = new DownloadAppConfirm_1.DownloadAppConfirm({
                    onOk: function () {
                        GameLink_6.GameLink.instance.sendTriggerEvent('DOWNLOAD_APP_AWARD');
                    }
                });
                HallUI_10.HallUI.instance.spr.addChild(dlg.spr);
            };
            this.spr.addChild(text);
            this.spr.addChild(btnConfig);
            for (var _i = 0, _a = this._starBitmap; _i < _a.length; _i++) {
                var x = _a[_i];
                this.spr.addChild(x);
            }
            this.spr.addChild(progress_background);
            this.spr.addChild(_progressBar);
            this.spr.addChild(_progressText);
            this.spr.addChild(downloadButton);
            this.setDailyTask({
                progress: 100,
                progressTotal: 200,
                finishedTaskCount: 1
            });
            btnConfig.image = SoundManager_2.SoundManager.muted ? HallUI_10.HallUI.getImage('hall/sound_off') : HallUI_10.HallUI.getImage('hall/sound_on');
            btnConfig.onClick = function () {
                SoundManager_2.SoundManager.muted = !SoundManager_2.SoundManager.muted;
                btnConfig.image = SoundManager_2.SoundManager.muted ? HallUI_10.HallUI.getImage('hall/sound_off') : HallUI_10.HallUI.getImage('hall/sound_on');
            };
        }
        DailyTaskBarUI.prototype.setDailyTask = function (obj) {
            if (obj.progressTotal === 0) {
                this._progressText.text = '';
                this._progressBar.percent = 1;
            }
            else {
                this._progressText.text = obj.progress + "/" + obj.progressTotal;
                this._progressBar.percent = +(obj.progress / obj.progressTotal);
            }
            for (var i = 0; i < 3; ++i) {
                this._starBitmap[i].image = i < obj.finishedTaskCount ? this.FULL_STAR_IMAGE : this.EMPTY_STAR_IMAGE;
            }
        };
        DailyTaskBarUI.prototype.setDailyTaskText = function (text) {
            this._progressText.text = text;
        };
        DailyTaskBarUI.prototype.setDailyTaskPercent = function (p) {
            this._progressBar.percent = p;
        };
        DailyTaskBarUI.prototype.setFinishedCount = function (n) {
            for (var i = 0; i < 3; ++i) {
                this._starBitmap[i].image = i < n ? this.FULL_STAR_IMAGE : this.EMPTY_STAR_IMAGE;
            }
        };
        DailyTaskBarUI.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            this.spr.visible = isShow;
        };
        return DailyTaskBarUI;
    }());
    exports.DailyTaskBarUI = DailyTaskBarUI;
});
define("client/src/hall/weekly_task/TaskLine", ["require", "exports", "client/src/hall/HallUI"], function (require, exports, HallUI_11) {
    "use strict";
    var TaskLine = (function () {
        function TaskLine() {
            var _this = this;
            this.spr = new createjs.Container();
            this.width = 0;
            this.height = 0;
            this.idx = -1;
            //images
            this.NORMAL_BACKGROUND = HallUI_11.HallUI.getImage('hall/weekly_task_item_bg');
            this.SATISFIED_BACKGROUND = HallUI_11.HallUI.getImage('hall/weekly_task_item_bg(satisfied)');
            this.UNKNOWN_BACKGROUND = HallUI_11.HallUI.getImage('hall/weekly_task_item_bg(unknown)');
            this.FINISHED_MASK = HallUI_11.HallUI.getImage('hall/weekly_task_item_bg(finish mask)');
            this.UNFINISH_POINT = HallUI_11.HallUI.getImage('hall/weekly_task_item_point_empty');
            this.FINISH_POINT = HallUI_11.HallUI.getImage('hall/weekly_task_item_point_full');
            this.PRIZE_DIAMOND = HallUI_11.HallUI.getImage('hall/new_weekly_task_prize1');
            this.PRIZE_COIN = HallUI_11.HallUI.getImage('hall/new_weekly_task_prize0');
            this.PRIZE_HEART = HallUI_11.HallUI.getImage('hall/new_weekly_task_prize2');
            this._scaleContainer = new createjs.Container();
            var cc = this._scaleContainer;
            var background = this._background = new createjs.Bitmap(this.NORMAL_BACKGROUND);
            this.width = background.image.width;
            this.height = background.image.height;
            cc.addChild(background);
            //task name
            this._taskName = new createjs.Text('', '27px SimHei', 'white');
            this._taskName.set({ x: 27, y: 21 });
            cc.addChild(this._taskName);
            //points
            this._points = [];
            for (var i = 0; i < 5; ++i) {
                var pp = new createjs.Bitmap(null);
                pp.set({ x: 246 + 37 * i, y: 22 });
                cc.addChild(pp);
                this._points.push(pp);
            }
            //progress text
            this._taskProgessText = new createjs.Text('', '20px SimHei', 'white');
            this._taskProgessText.set({ x: 332, y: 28, textAlign: 'center' });
            cc.addChild(this._taskProgessText);
            //get prize text
            this._getPrizeText = new createjs.Bitmap(HallUI_11.HallUI.getImage('hall/weekly_task_get_prize_text'));
            this._getPrizeText.set({ x: 259, y: 19 });
            cc.addChild(this._getPrizeText);
            //prizeIcon
            this._prizeIcon = new createjs.Bitmap(null);
            this._prizeIcon.set({ x: 475, y: 35 });
            cc.addChild(this._prizeIcon);
            //finish mask
            this._finishedMask = new createjs.Bitmap(this.FINISHED_MASK);
            cc.addChild(this._finishedMask);
            this._scaleContainer.regX = this.width / 2;
            this._scaleContainer.regY = this.height / 2;
            this.spr.addChild(this._scaleContainer);
            var hitArea = new createjs.Bitmap(this.NORMAL_BACKGROUND);
            hitArea.regX = this.width / 2;
            hitArea.regY = this.height / 2;
            this.spr.hitArea = hitArea;
            this.spr.addEventListener('mousedown', function (e) {
                _this._setScale(0.9);
            });
            this.spr.addEventListener('pressup', function (e) {
                _this._setScale(1);
            });
            this.spr.addEventListener('click', function (e) {
                if (_this.onClick)
                    _this.onClick(_this);
            });
            this.spr.setBounds(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        TaskLine.prototype._hideAllExcept = function (arr) {
            var cc = this._scaleContainer;
            for (var i = 0; i < cc.children.length; ++i) {
                var spr = cc.children[i];
                if (spr === this._background || arr.indexOf(spr) >= 0) {
                    spr.visible = true;
                }
                else {
                    spr.visible = false;
                }
            }
        };
        TaskLine.prototype.setNoTask = function () {
            this.task = null;
            this._hideAllExcept([]);
            this._background.image = this.UNKNOWN_BACKGROUND;
        };
        TaskLine.prototype.setUnknownTask = function (showText, prizeType, prizeCount) {
            this._hideAllExcept([]);
            this._background.image = this.UNKNOWN_BACKGROUND;
            this._setPrize(prizeType);
        };
        TaskLine.prototype.setFinishedTask = function (name) {
            this._hideAllExcept([this._taskName]);
            this._taskName.text = name;
            this._background.image = this.NORMAL_BACKGROUND;
            this._finishedMask.visible = true;
        };
        TaskLine.prototype.setSatisfisedTask = function (name) {
            this._hideAllExcept([this._taskName, this._getPrizeText]);
            this._taskName.text = name;
            this._background.image = this.SATISFIED_BACKGROUND;
        };
        TaskLine.prototype.setPointTask = function (name, pointCount, maxPointCount, prizeType) {
            this._hideAllExcept([this._taskName]);
            this._taskName.text = name;
            this._background.image = this.NORMAL_BACKGROUND;
            for (var i = 0; i < this._points.length; ++i) {
                var pp = this._points[i];
                if (i >= maxPointCount) {
                    pp.visible = false;
                    continue;
                }
                pp.visible = true;
                pp.image = i < pointCount ? this.FINISH_POINT : this.UNFINISH_POINT;
            }
            this._setPrize(prizeType);
        };
        TaskLine.prototype.setProgressTask = function (name, progress, totalProgress, prizeType) {
            this._hideAllExcept([this._taskName, this._taskProgessText]);
            this._background.image = this.NORMAL_BACKGROUND;
            this._taskName.text = name;
            this._taskProgessText.text = (progress | 0) + "/" + (totalProgress | 0);
            this._setPrize(prizeType);
        };
        TaskLine.prototype._setPrize = function (prizeType, prizeCount) {
            var image = null;
            switch (prizeType) {
                case 'diamond':
                    image = this.PRIZE_DIAMOND;
                    break;
                case 'coin':
                    image = this.PRIZE_COIN;
                    break;
                case 'heart':
                    image = this.PRIZE_HEART;
                    break;
            }
            if (!image) {
                this._prizeIcon.visible = false;
                return;
            }
            this._prizeIcon.visible = true;
            this._prizeIcon.image = image;
            this._prizeIcon.regX = image.width / 2;
            this._prizeIcon.regY = image.height / 2;
        };
        TaskLine.prototype._setScale = function (s) {
            this._scaleContainer.scaleX = s;
            this._scaleContainer.scaleY = s;
        };
        return TaskLine;
    }());
    exports.TaskLine = TaskLine;
});
define("client/src/hall/shared/CutStyleProgressBar", ["require", "exports"], function (require, exports) {
    "use strict";
    ///<reference path="../../../typings/tsd.d.ts"/>
    var CutStyleProgressBar = (function (_super) {
        __extends(CutStyleProgressBar, _super);
        function CutStyleProgressBar(image) {
            _super.call(this, image);
            this.percent = 1;
        }
        Object.defineProperty(CutStyleProgressBar.prototype, "sourceRect", {
            get: function () {
                if (this.image) {
                    return new createjs.Rectangle(0, 0, this.image.width * this.percent, this.image.height);
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        return CutStyleProgressBar;
    }(createjs.Bitmap));
    exports.CutStyleProgressBar = CutStyleProgressBar;
});
define("client/src/hall/weekly_task/WeeklyTaskPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/hall/shared/VerticalScrollPanel", "client/src/hall/weekly_task/TaskLine", "client/src/GameLink", "client/src/hall/shared/CutStyleProgressBar"], function (require, exports, HallUI_12, VerticalScrollPanel_2, TaskLine_1, GameLink_7, CutStyleProgressBar_1) {
    "use strict";
    /** 面板的位置 */
    var BASE_POS = { x: 23, y: 204 - 46 };
    var WeeklyTaskPanel = (function () {
        function WeeklyTaskPanel() {
            this.spr = new createjs.Container();
            this._taskLines = [];
            this._prizeIcons = [];
            this.iconTweens = [];
            var background = new createjs.Bitmap(HallUI_12.HallUI.getImage('hall/weekly_task_background'));
            background.set(BASE_POS);
            /*let title = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_title'));
            title.set({
                x: BASE_POS.x + 24,
                y: BASE_POS.y + 25
            });*/
            /*
                    let task_desc = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_desc'));
                    task_desc.set({ x: BASE_POS.x + 23, y: BASE_POS.y + 100 });
            */
            var taskPanel = this._taskPanel = new VerticalScrollPanel_2.VerticalScrollPanel();
            taskPanel.setPos({ x: 60, y: 428 - 46 });
            taskPanel.setSize(530, 416);
            //taskPanel.setVisualizeMask(true);
            //text
            //let progressTextBitmap = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_progress_text'))
            //progressTextBitmap.x = 77;
            //progressTextBitmap.y = 716;
            //text
            var taskProgressText = this._taskProgressText = new createjs.Text('0/100', '22px SimHei', 'white');
            taskProgressText.textAlign = 'center';
            taskProgressText.x = 119;
            taskProgressText.y = 860;
            //progress bg
            //let taskProgressBg = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_progress_bg'));
            //taskProgressBg.x = 208;
            //taskProgressBg.y = 716;
            var taskProgress = this._taskProgress = new CutStyleProgressBar_1.CutStyleProgressBar(HallUI_12.HallUI.getImage('hall/weekly_task_progress'));
            taskProgress.x = 207;
            taskProgress.y = 834;
            taskProgress.percent = 1;
            var petIcon = this._petIcon = new createjs.Bitmap(null);
            petIcon.visible = false;
            petIcon.regX = 40;
            petIcon.regY = 40;
            petIcon.scaleX = 0.5;
            petIcon.scaleY = 0.5;
            Object.defineProperty(petIcon, 'image', {
                get: function () {
                    return HallUI_12.HallUI.instance.getPetImage(GameLink_7.GameLink.instance.currentPet);
                }
            });
            this.spr.addChild(background);
            this.spr.addChild(taskPanel.spr);
            this.spr.addChild(taskProgressText);
            this.spr.addChild(taskProgress);
            this.spr.addChild(petIcon);
            this._setTaskCount(1);
            this._taskLines[0].setNoTask();
            this.spr.visible = false;
        }
        Object.defineProperty(WeeklyTaskPanel.prototype, "taskLines", {
            get: function () { return this._taskLines; },
            enumerable: true,
            configurable: true
        });
        WeeklyTaskPanel.prototype.setProgress = function (n, total) {
            this._taskProgressText.text = n + "/" + total;
            if (total != 0)
                this._taskProgress.percent = n / total;
            else
                this._taskProgress.percent = 0;
        };
        WeeklyTaskPanel.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            if (!this.spr.visible && isShow) {
                //GameLink.instance.sendReqWeeklyTask();
                this._shakePetIcon();
            }
            this.spr.visible = isShow;
        };
        WeeklyTaskPanel.prototype.setTaskCount = function (n) {
            this._setTaskCount(n);
        };
        WeeklyTaskPanel.prototype.setPetProgress = function (pp) {
            var y = 849;
            var x0 = 222;
            var x1 = x0 + 337;
            var lastvisible = this._petIcon.visible;
            this._petIcon.visible = true;
            this._petIcon.x = x0 + (x1 - x0) * pp;
            this._petIcon.y = y;
            if (!lastvisible) {
                this._shakePetIcon();
            }
        };
        WeeklyTaskPanel.prototype._shakePetIcon = function () {
            if (this._petIcon.visible) {
                createjs.Tween.removeTweens(this._petIcon);
                var y = 849;
                createjs.Tween.get(this._petIcon).to({ y: y - 10 }, 100).to({ y: y }, 1000, createjs.Ease.getElasticOut(1, 0.2));
            }
        };
        WeeklyTaskPanel.prototype.setTaskPrize = function (prizeTypes) {
            for (var _i = 0, _a = this.iconTweens; _i < _a.length; _i++) {
                var t = _a[_i];
                t.setPaused(true);
            }
            this.iconTweens.length = 0;
            var y = 849;
            var x0 = 222;
            var x1 = x0 + 327;
            var icons = this._prizeIcons;
            if (prizeTypes.length === 0) {
                for (var _b = 0, icons_1 = icons; _b < icons_1.length; _b++) {
                    var bmp = icons_1[_b];
                    this.spr.removeChild(bmp);
                }
                icons.length = 0;
                return;
            }
            while (icons.length > prizeTypes.length) {
                this.spr.removeChild(icons.pop());
            }
            while (icons.length < prizeTypes.length) {
                var bmp = new createjs.Bitmap(null);
                icons.push(bmp);
                this.spr.addChildAt(bmp, this.spr.getChildIndex(this._petIcon));
            }
            var span = 0;
            if (prizeTypes.length >= 2)
                span = (x1 - x0) / (prizeTypes.length - 1);
            for (var i = 0; i < icons.length; ++i) {
                var bitmap = icons[i];
                var type = prizeTypes[i];
                var image = void 0;
                bitmap.set({ x: x0 + span * (i + 1), y: y });
                switch (type) {
                    case 'coin':
                        image = HallUI_12.HallUI.getImage('hall/new_weekly_task_prize1');
                        break;
                    case 'diamond':
                        image = HallUI_12.HallUI.getImage('hall/new_weekly_task_prize0');
                        break;
                    case 'heart':
                        image = HallUI_12.HallUI.getImage('hall/new_weekly_task_prize2');
                        break;
                    default:
                        image = null;
                }
                if (icons.length - 1 === i) {
                    image = HallUI_12.HallUI.getImage('hall/new_weekly_task_prize_final');
                }
                bitmap.image = image;
                if (image) {
                    bitmap.scaleX = 0.8;
                    bitmap.scaleY = 0.8;
                    bitmap.regX = image.width / 2;
                    bitmap.regY = image.height / 2;
                    if (icons.length - 1 !== i) {
                        bitmap.y = y - 5;
                        var t = createjs.Tween.get(bitmap, { loop: true }).to({ y: y + 5 }, 1000).to({ y: y - 5 }, 1000);
                        t.setPosition(Math.random() * 1000, createjs.Tween.NONE);
                        this.iconTweens.push(t);
                    }
                }
                else {
                    bitmap.visible = false;
                }
            }
        };
        WeeklyTaskPanel.prototype.makeTaskVisible = function (idx) {
            var EACH_HEIGHT = 63;
            var SPAN = 10;
            var y0 = idx * (EACH_HEIGHT + SPAN) + SPAN;
            var y1 = y0 + EACH_HEIGHT;
            var panelHeight = this._taskPanel.height;
            var pos = this._taskPanel.position;
            var pos2 = pos + panelHeight;
            var newpos;
            if (y1 > pos2) {
                newpos = y1 + 10 - panelHeight;
            }
            else if (pos > y0) {
                newpos = y0 - 10;
            }
            else {
                return;
            }
            this._taskPanel.position = newpos;
        };
        WeeklyTaskPanel.prototype._setTaskCount = function (n) {
            var _this = this;
            var EACH_HEIGHT = 70;
            var SPAN = 10;
            if (this._taskLines.length > n) {
                for (var i = n; i < this._taskLines.length; ++i) {
                    this._taskPanel.removeChild(this._taskLines[i].spr);
                }
            }
            else if (this._taskLines.length < n) {
                for (var i = this._taskLines.length; i < n; ++i) {
                    var task = new TaskLine_1.TaskLine();
                    task.setUnknownTask(false);
                    task.spr.set({
                        x: 10 + task.width / 2,
                        y: i * (EACH_HEIGHT + SPAN) + SPAN + task.height / 2
                    });
                    task.idx = this._taskLines.length;
                    this._taskLines.push(task);
                    this._taskPanel.addChild(task.spr);
                    task.onClick = function (item) {
                        _this._onClickItem(item);
                    };
                }
            }
            this._taskPanel.contentHeight = n * (EACH_HEIGHT + SPAN) + SPAN;
            this._taskLines.length = n;
        };
        WeeklyTaskPanel.prototype._onClickItem = function (line) {
            if (line.task && line.task.status === 'satisfied') {
                GameLink_7.GameLink.instance.sendReqEndWeeklyTask();
            }
            else if (!line.task && this.taskLines.length === 1) {
                GameLink_7.GameLink.instance.sendReqWeeklyTask();
            }
            else if (line.task && line.task.status === 'running') {
                HallUI_12.HallUI.instance.showGameReadyPanel();
            }
            else {
                var text_1 = new createjs.Text('完成上个冒险解锁', '42px SimHei', '#142d3e');
                text_1.textAlign = 'center';
                text_1.x = 320;
                text_1.y = 600;
                text_1.alpha = 1;
                HallUI_12.HallUI.instance.spr.addChild(text_1);
                createjs.Tween.get(text_1).to({ alpha: 0, y: 350 }, 1000).call(function () {
                    if (text_1.parent)
                        text_1.parent.removeChild(text_1);
                });
            }
        };
        return WeeklyTaskPanel;
    }());
    exports.WeeklyTaskPanel = WeeklyTaskPanel;
});
define("client/src/hall/shared/HorizontalPagePanel", ["require", "exports", "client/src/hall/HallUI"], function (require, exports, HallUI_13) {
    "use strict";
    var EXTRA_HEIGHT = 40;
    var HorizontalPagePanel = (function () {
        function HorizontalPagePanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this._hitArea = new createjs.Shape();
            this._pageWidth = 0;
            this._pageHeight = 0;
            this._pages = [];
            //currentPage 决定了当前是哪一页，offsetPosition决定了偏移多少像素。
            //offsetPosition > 0表示向右拖动
            this._currentPage = 0;
            this._offsetPosition = 0;
            this._lastX = 0;
            this._pointer = [];
            this.EMPTY_POINT = HallUI_13.HallUI.getImage('hall/new_pager_point_empty');
            this.FULL_POINT = HallUI_13.HallUI.getImage('hall/new_pager_point_full');
            //当mousedown事件中判断到，点击的point，则禁止当前的拖移操作
            this._forbidDragThisTime = false;
            this._hitArea.hitArea = new createjs.Shape();
            this.spr.addChild(this._hitArea);
            this.spr.addEventListener('mousedown', function (e) { return _this._onMouseDown(e); });
            this.spr.addEventListener('pressup', function (e) { return _this._onPressUp(e); });
            this.spr.addEventListener('pressmove', function (e) { return _this._onPressDrag(e); });
        }
        HorizontalPagePanel.prototype.setPos = function (x, y) {
            this.spr.x = x;
            this.spr.y = y;
            this._repaintMyMask();
        };
        HorizontalPagePanel.prototype.setPageSize = function (width, height) {
            if (width !== this._pageWidth || height !== this._pageHeight) {
                this._pageWidth = width;
                this._pageHeight = height;
                var g = this._hitArea.hitArea["graphics"];
                g.clear();
                g.beginFill('rgba(0,0,0,0.2)');
                g.drawRect(0, 0, width, height + EXTRA_HEIGHT);
                g.endFill();
                this._repaintMyMask();
            }
        };
        HorizontalPagePanel.prototype._repaintMyMask = function () {
            var mask = this.spr.mask;
            if (!mask) {
                mask = this.spr.mask = new createjs.Shape();
            }
            var g = mask.graphics;
            g.clear();
            g.beginFill('white');
            g.drawRect(this.spr.x, this.spr.y, this._pageWidth, this._pageHeight + 50);
            g.endFill();
        };
        /**
         * 加入的page假定，bounds是 {0,0,pageWdith,pageHeight}
         */
        HorizontalPagePanel.prototype.addPage = function (page) {
            page.y = 0;
            this.spr.addChild(page);
            this._pages.push(page);
            this._updateLayout();
            this._setPointCount(this._pages.length);
        };
        HorizontalPagePanel.prototype._setPointCount = function (n) {
            var HALF_SIZE = 10;
            //if (n == this._pointer.length) return;
            if (this._pointer.length < n) {
                for (var i = this._pointer.length; i < n; ++i) {
                    var bitmap = new createjs.Bitmap(this.EMPTY_POINT);
                    bitmap.regX = HALF_SIZE;
                    bitmap.regY = HALF_SIZE;
                    this.spr.addChild(bitmap);
                    this._pointer.push(bitmap);
                }
            }
            if (this._pointer.length > n) {
                for (var i = n; i < this._pointer.length; ++i) {
                    this.spr.removeChild(this._pointer[i]);
                }
                this._pointer.length = n;
            }
            //layer
            var center = {
                x: this._pageWidth / 2,
                y: this._pageHeight + 20
            };
            var MAX_SPAN = 55;
            var span = MAX_SPAN;
            var x = center.x - (n - 1) / 2 * span;
            for (var i = 0; i < this._pointer.length; ++i) {
                this._pointer[i].x = x;
                this._pointer[i].y = center.y;
                x += span;
            }
        };
        HorizontalPagePanel.prototype._hitTestPoint = function (x, y) {
            if (y >= this._pageHeight) {
                var minDx = 9999;
                var cc = -1;
                for (var i = 0; i < this._pointer.length; ++i) {
                    var pt = this._pointer[i];
                    var dx = Math.abs(x - pt.x);
                    if (dx < minDx) {
                        minDx = dx;
                        cc = i;
                    }
                }
                return cc;
            }
            return -1;
        };
        HorizontalPagePanel.prototype._onMouseDown = function (e) {
            this._lastX = e.stageX;
            var ptIndex = this._hitTestPoint(e.localX, e.localY);
            if (ptIndex >= 0 && ptIndex < this._pages.length) {
                this._forbidDragThisTime = true;
                if (ptIndex != this._currentPage) {
                    this._stopTween();
                    this._tweenToPage(ptIndex);
                }
                else {
                }
            }
            else {
                this._forbidDragThisTime = false;
            }
        };
        HorizontalPagePanel.prototype._onPressDrag = function (e) {
            if (this._forbidDragThisTime)
                return;
            if (createjs.Tween.hasActiveTweens(this)) {
                this._lastX = e.stageX;
                return;
            }
            var dx = e.stageX - this._lastX;
            if (Math.abs(dx) >= 100) {
                this._lastX = e.stageX;
                var newpage = this._currentPage;
                if (dx > 0)
                    newpage = newpage - 1;
                else
                    newpage = newpage + 1;
                if (newpage >= 0 && newpage < this._pages.length) {
                    this._tweenToPage(newpage);
                }
            }
        };
        HorizontalPagePanel.prototype._onPressUp = function (e) {
            if (this._forbidDragThisTime)
                return;
            /*
            if (this._offsetPosition != 0)
            {
                let newPage = this._calcNewPage();
                this._tweenToPage(newPage);
                //this._currentPage = newPage;
                //this._offsetPosition = 0;
                this._updateLayout();
                GameStage.instance.makeDirty();
            }
            */
        };
        HorizontalPagePanel.prototype._stopTween = function () {
            if (this._moveTween) {
                this._moveTween.setPaused(true);
                this._moveTween = null;
            }
        };
        HorizontalPagePanel.prototype._tweenToPage = function (n) {
            var _this = this;
            if (this._moveTween) {
                this._moveTween.setPaused(true);
                this._moveTween = null;
            }
            var DURATION = 500;
            if (n == this._currentPage && this._offsetPosition == 0)
                return;
            this._offsetPosition = this._calcOffsetWithNewCurrent(n);
            this._currentPage = n;
            this._updateLayout();
            this._moveTween = createjs.Tween.get(this).to({ _offsetPosition: 0 }, DURATION, createjs.Ease.cubicOut);
            this._moveTween.addEventListener('change', function () {
                _this._updateLayout();
            });
        };
        /** 计算，当n变成currentPage，要保持当前界面位置的时候，需要把offsetPosition设置成什么值 */
        HorizontalPagePanel.prototype._calcOffsetWithNewCurrent = function (n) {
            if (n == this._currentPage)
                return this._offsetPosition;
            var offset = this._offsetPosition;
            //x == this._page[n] 当前应该的x坐标
            var x = offset + (n - this._currentPage) * this._pageWidth;
            return x;
        };
        /** 根据当前currentPage和offsetPosition，计算出是否要切换page */
        HorizontalPagePanel.prototype._calcNewPage = function () {
            //下面的算法没什么效率，但是比较直观
            //选择一个页面，切换到它所需要移动的距离最小（移动就是把offsetPosition变成0）。
            var idx = this._currentPage;
            var m = Math.abs(this._offsetPosition);
            if (!this._pages[idx])
                return idx;
            for (var i = 0; i < this._pages.length; ++i) {
                if (i != idx) {
                    var mm = Math.abs(this._calcOffsetWithNewCurrent(i));
                    if (mm < m) {
                        m = mm;
                        idx = i;
                    }
                }
            }
            return idx;
        };
        /** 无论何时，当offsetPosition或currentPage改变的时候，调用这个改变布局 */
        HorizontalPagePanel.prototype._updateLayout = function () {
            if (!this._pages[this._currentPage])
                return;
            var offsetPosition = this._offsetPosition;
            if (offsetPosition === 0) {
                this._pages[this._currentPage].x = 0;
                for (var i = 0; i < this._pages.length; ++i) {
                    this._pages[i].visible = i === this._currentPage;
                    if (i < this._pointer.length) {
                        this._pointer[i].image = i === this._currentPage ? this.FULL_POINT : this.EMPTY_POINT;
                    }
                }
                return;
            }
            //drag left
            var pageWidth = this._pageWidth;
            if (offsetPosition < 0) {
                var n = ((-offsetPosition / pageWidth) + 1) | 0; //除了current额外需要显示的page个数
                for (var i = 0; i < this._pages.length; ++i) {
                    var page = this._pages[i];
                    var dist = i - this._currentPage;
                    if (dist <= n && dist >= 0) {
                        page.visible = true;
                        page.x = offsetPosition + dist * pageWidth;
                    }
                    else {
                        page.visible = false;
                    }
                }
            }
            //drag right
            if (this._offsetPosition > 0) {
                var n = (offsetPosition / pageWidth + 1) | 0;
                for (var i = 0; i < this._pages.length; ++i) {
                    var page = this._pages[i];
                    var dist = this._currentPage - i;
                    if (dist <= n && dist >= 0) {
                        page.visible = true;
                        page.x = offsetPosition - dist * pageWidth;
                    }
                    else {
                        page.visible = false;
                    }
                }
            }
        };
        return HorizontalPagePanel;
    }());
    exports.HorizontalPagePanel = HorizontalPagePanel;
});
define("client/src/hall/pet/PetIcon", ["require", "exports", "client/src/hall/HallUI", "client/src/hall/shared/CutStyleProgressBar"], function (require, exports, HallUI_14, CutStyleProgressBar_2) {
    "use strict";
    var PetIcon = (function () {
        function PetIcon() {
            var _this = this;
            this.spr = new createjs.Container();
            this.UNSELECTED_BACKGROUND = HallUI_14.HallUI.getImage('hall/pet_icon_background_unselected');
            this.SELEDTED_BACKGROUND = HallUI_14.HallUI.getImage('hall/pet_icon_background_selected');
            this.width = 0;
            this.height = 0;
            this.id = -1; /**由外部程序随便设置 */
            this._background = new createjs.Bitmap(this.UNSELECTED_BACKGROUND);
            this.spr.addChild(this._background);
            this.width = this.UNSELECTED_BACKGROUND.width;
            this.height = this.SELEDTED_BACKGROUND.height;
            this._petOutlineIcon = new createjs.Bitmap(null);
            this._petOutlineIcon.set({
                x: 55,
                y: 72
            });
            this.spr.addChild(this._petOutlineIcon);
            this._petIcon = new createjs.Bitmap(null);
            this._petIcon.set({
                x: 55,
                y: 72
            });
            this.spr.addChild(this._petIcon);
            var qmImage = HallUI_14.HallUI.getImage('hall/pet_question_mark_2');
            this._questionMark = new createjs.Bitmap(qmImage);
            this._questionMark.set({
                x: 55, y: 72,
                regX: qmImage.width / 2,
                regY: qmImage.height / 2
            });
            this.spr.addChild(this._questionMark);
            this._progressBg = new createjs.Bitmap(HallUI_14.HallUI.getImage('hall/pet_progress_small_bg'));
            this._progressBg.set({ x: -1, y: 139 });
            this.spr.addChild(this._progressBg);
            this._progress = new CutStyleProgressBar_2.CutStyleProgressBar(HallUI_14.HallUI.getImage('hall/pet_progress_small'));
            this._progress.set({
                x: 1, y: 141
            });
            this.spr.addChild(this._progress);
            this._notGetText = new createjs.Bitmap(HallUI_14.HallUI.getImage('hall/pet_not_get_text'));
            this._notGetText.set({ x: 23, y: 136 });
            this.spr.addChild(this._notGetText);
            this._currentPetTip = new createjs.Bitmap(HallUI_14.HallUI.getImage('hall/pet_icon_current_tip'));
            this._currentPetTip.set({ x: 64, y: 83 });
            this.spr.addChild(this._currentPetTip);
            this.spr.addEventListener('click', function () {
                if (_this.onClick)
                    _this.onClick(_this.id);
            });
        }
        //等级已经被限制
        PetIcon.prototype.setLockIcon = function (show) {
        };
        PetIcon.prototype.setPetUnknown = function () {
            this._petIcon.visible = false;
            this._petOutlineIcon.visible = false;
            this._questionMark.visible = true;
            this._progressBg.visible = false;
            this._progress.visible = false;
            this._notGetText.visible = false;
        };
        PetIcon.prototype.setPetNotGet = function (iconId) {
            this._petIcon.visible = false;
            this._petOutlineIcon.visible = true;
            this._questionMark.visible = true;
            this._progressBg.visible = false;
            this._progress.visible = false;
            this._notGetText.visible = true;
            var icon = HallUI_14.HallUI.getImage('pet_outline_' + iconId);
            this._petOutlineIcon.image = icon;
            if (icon) {
                this._petOutlineIcon.set({
                    regX: icon.width / 2,
                    regY: icon.height / 2,
                });
            }
        };
        PetIcon.prototype.setPet = function (iconId, expPercent) {
            this._petIcon.visible = true;
            this._petOutlineIcon.visible = false;
            this._questionMark.visible = false;
            this._progressBg.visible = true;
            this._progress.visible = true;
            this._notGetText.visible = false;
            var icon = HallUI_14.HallUI.instance.getPetImage(iconId);
            this._petIcon.image = icon;
            if (icon) {
                this._petIcon.set({
                    regX: icon.width / 2,
                    regY: icon.height / 2,
                });
            }
            this._progress.percent = expPercent;
        };
        PetIcon.prototype.setSelected = function (isSelected) {
            this._background.image = isSelected ? this.SELEDTED_BACKGROUND : this.UNSELECTED_BACKGROUND;
        };
        PetIcon.prototype.setCarry = function (isCarry) {
            this._currentPetTip.visible = isCarry;
        };
        return PetIcon;
    }());
    exports.PetIcon = PetIcon;
});
define("shared/PetSkillDesc", ["require", "exports"], function (require, exports) {
    "use strict";
    function genLevelDesc(str, x0, dx, n) {
        var arr = new Array(n);
        for (var i = 0; i < n; ++i) {
            arr[i] = str.replace('{x}', (x0 + dx * i).toString());
        }
        return arr;
    }
    exports.PetSkillDesc = [
        {
            id: 0,
            desc: '将线型范围的精灵转化成自己',
            levelDesc: ['范围：C', '范围：B', '范围：A', '范围：S', '范围：SS', '范围：SSS'],
            maxLevel: 6,
            energy: 12,
            skillParam1: 160,
            skillParam2: 160,
            skillParamGrown: 20,
            upgradeDesc: '效果范围增大',
        },
        {
            id: 1,
            desc: '将画面中央的精灵转化成自己',
            levelDesc: ['范围：C', '范围：B', '范围：A', '范围：S', '范围：SS', '范围：SSS'],
            maxLevel: 6,
            energy: 12,
            skillParam1: 320,
            skillParam2: 320,
            skillParamGrown: 15,
            upgradeDesc: '效果范围增大',
        },
        {
            id: 2,
            desc: '随即消除一种精灵',
            levelDesc: genLevelDesc('充能数量：{x}个', 16, -1, 6),
            maxLevel: 6,
            energy: 16,
            skillParam1: 16,
            skillParam2: 16,
            skillParamGrown: -1,
            upgradeDesc: '消除数量增加',
        },
        {
            id: 3,
            desc: genLevelDesc('随机消除{x}个精灵', 14, 2, 6),
            levelDesc: genLevelDesc('消除数量：{x}个', 14, 1, 6),
            maxLevel: 6,
            energy: 12,
            skillParam1: 14,
            skillParam2: 14,
            skillParamGrown: 1,
            upgradeDesc: '消除数量增加',
        },
        {
            id: 4,
            desc: '消除画面中央的精灵',
            levelDesc: ['范围：C', '范围：B', '范围：A', '范围：S', '范围：SS', '范围：SSS'],
            maxLevel: 6,
            energy: 12,
            skillParam1: 300,
            skillParam2: 300,
            skillParamGrown: 15,
            upgradeDesc: '效果范围增大',
        },
        {
            id: 5,
            desc: '消除画面两列精灵',
            levelDesc: ['范围：C', '范围：B', '范围：A', '范围：S', '范围：SS', '范围：SSS'],
            maxLevel: 6,
            energy: 12,
            skillParam1: 70,
            skillParam2: 70,
            skillParamGrown: 8,
            upgradeDesc: '效果范围增大',
        },
        {
            id: 6,
            desc: '消除线状范围的精灵',
            levelDesc: ['范围：C', '范围：B', '范围：A', '范围：S', '范围：SS', '范围：SSS'],
            maxLevel: 6,
            energy: 12,
            skillParam1: 150,
            skillParam2: 150,
            skillParamGrown: 15,
            upgradeDesc: '效果范围增大',
        },
        {
            id: 7,
            desc: '消除×形状范围的精灵',
            levelDesc: ['范围：C', '范围：B', '范围：A', '范围：S', '范围：SS', '范围：SSS'],
            maxLevel: 6,
            energy: 12,
            skillParam1: 60,
            skillParam2: 60,
            skillParamGrown: 7,
            upgradeDesc: '效果范围增大',
        },
        {
            id: 8,
            desc: genLevelDesc('延长{x}秒倒计时', 3, 0.5, 6),
            levelDesc: genLevelDesc('延长时间：{x}秒', 3, 0.5, 4),
            maxLevel: 4,
            energy: 16,
            skillParam1: 3,
            skillParam2: 3,
            skillParamGrown: 0.5,
            upgradeDesc: '延长时间增长',
        },
        {
            id: 9,
            desc: ['随机转化出2~3个炸弹', '随机转化出3~4个炸弹', '随机转化出4~5个炸弹', '随机转化出5~6个炸弹', '随机转化出6~7个炸弹', '随机转化出7~8个炸弹'],
            levelDesc: ['转化数量：2~3个', '转化数量：3~4个', '转化数量：4~5个', '转化数量：5~6个', '转化数量：6~7个', '转化数量：7~8个'],
            maxLevel: 6,
            energy: 12,
            skillParam1: 2,
            skillParam2: 3,
            skillParamGrown: 1,
            upgradeDesc: '转化数量增加',
        },
        {
            id: 10,
            desc: genLevelDesc('{x}秒内最低连接精灵数量降为1', 4, 0.5, 6),
            levelDesc: genLevelDesc('持续时间：{x}秒', 4, 0.5, 6),
            maxLevel: 6,
            energy: 12,
            skillParam1: 4,
            skillParam2: 4,
            skillParamGrown: 0.5,
            upgradeDesc: '持续时间增长',
        },
        {
            id: 11,
            desc: '下次连接无视精灵种类',
            levelDesc: genLevelDesc('最高长度：{x}个', 14, 1, 6),
            maxLevel: 6,
            energy: 12,
            skillParam1: 14,
            skillParam2: 14,
            skillParamGrown: 1,
            upgradeDesc: '连接上限增加',
        },
        {
            id: 12,
            desc: '消除指定列的精灵',
            levelDesc: ['范围：C', '范围：B', '范围：A', '范围：S', '范围：SS', '范围：SSS'],
            maxLevel: 6,
            energy: 12,
            skillParam1: 160,
            skillParam2: 160,
            skillParamGrown: 20,
            upgradeDesc: '效果范围增大',
        },
        {
            id: 13,
            desc: 'todotodotodo',
            levelDesc: genLevelDesc('最高长度：{x}个', 14, 1, 6),
            maxLevel: 6,
            energy: 12,
            skillParam1: 14,
            skillParam2: 14,
            skillParamGrown: 1,
            upgradeDesc: '',
        },
        {
            id: 14,
            desc: genLevelDesc('减缓{x}秒时间', 3, 0.5, 6),
            levelDesc: genLevelDesc('持续时间：{x}个', 4, 1, 6),
            maxLevel: 6,
            energy: 12,
            skillParam1: 3,
            skillParam2: 3,
            skillParamGrown: 0.5,
            upgradeDesc: '持续时间增长',
        },
        {
            id: 15,
            desc: '随机将一种精灵抓到最上方',
            levelDesc: genLevelDesc('充能数量：{x}个', 16, -1, 6),
            maxLevel: 6,
            energy: 12,
            skillParam1: 16,
            skillParam2: 16,
            skillParamGrown: -1,
            upgradeDesc: '激活所需精灵减少',
        },
        {
            id: 16,
            desc: genLevelDesc('{x}秒内所获金币翻倍', 6, 1, 6),
            levelDesc: genLevelDesc('持续时间：{x}秒', 6, 1, 6),
            maxLevel: 6,
            energy: 12,
            skillParam1: 6,
            skillParam2: 6,
            skillParamGrown: 1,
            upgradeDesc: '持续时间增长',
        },
        {
            id: 17,
            desc: '消除画面下方精灵',
            levelDesc: ['范围：C', '范围：B', '范围：A', '范围：S', '范围：SS', '范围：SSS'],
            maxLevel: 6,
            energy: 12,
            skillParam1: 150,
            skillParam2: 150,
            skillParamGrown: 15,
            upgradeDesc: '效果范围增大',
        },
        {
            id: 18,
            desc: genLevelDesc('{x}秒内连线周围的果冻会被一并消除', 3, 0.5, 6),
            levelDesc: genLevelDesc('持续时间：{x}秒', 3, 0.5, 6),
            maxLevel: 6,
            energy: 12,
            skillParam1: 3,
            skillParam2: 3,
            skillParamGrown: 0.5,
            upgradeDesc: '持续时间增长',
        },
        {
            id: 19,
            desc: '充能fever条',
            levelDesc: genLevelDesc('充能数量：{x}个', 16, -1, 6),
            maxLevel: 6,
            energy: 12,
            skillParam1: 16,
            skillParam2: 16,
            skillParamGrown: -1,
            upgradeDesc: '激活所需精灵减少',
        },
        {
            id: 20,
            desc: '转化出可以引爆的爆蛋',
            levelDesc: genLevelDesc('出现数量：{x}个', 2, 1, 6),
            maxLevel: 6,
            energy: 12,
            skillParam1: 2,
            skillParam2: 2,
            skillParamGrown: 1,
            upgradeDesc: '转化数量增加',
        }
    ];
});
///<reference path="../../../typings/tsd.d.ts"/>
define("client/src/hall/shared/BitmapText", ["require", "exports"], function (require, exports) {
    "use strict";
    var BitmapText = (function (_super) {
        __extends(BitmapText, _super);
        function BitmapText(defines) {
            _super.call(this);
            this._align = 'left';
            this._charDefines = {};
            this._bitmaps = [];
            if (defines) {
                for (var _i = 0, defines_1 = defines; _i < defines_1.length; _i++) {
                    var d = defines_1[_i];
                    this.addChar(d.char, d.image, d.sourceRect);
                }
            }
        }
        BitmapText.buildCharDefines = function (chars, image, width, height) {
            var charDefines = [];
            var x = 0;
            for (var _i = 0, chars_1 = chars; _i < chars_1.length; _i++) {
                var c = chars_1[_i];
                charDefines.push({
                    char: c,
                    image: image,
                    sourceRect: new createjs.Rectangle(x, 0, width, height)
                });
                x += width;
            }
            return charDefines;
        };
        Object.defineProperty(BitmapText.prototype, "align", {
            get: function () { return this._align; },
            set: function (val) { this._align = val; },
            enumerable: true,
            configurable: true
        });
        BitmapText.prototype.addChars = function (defines) {
            for (var _i = 0, defines_2 = defines; _i < defines_2.length; _i++) {
                var d = defines_2[_i];
                this.addChar(d.char, d.image, d.sourceRect);
            }
        };
        BitmapText.prototype.addChar = function (char, image, sourceRect) {
            this._charDefines[char] = { image: image, sourceRect: sourceRect };
        };
        Object.defineProperty(BitmapText.prototype, "text", {
            get: function () { return this._text; },
            set: function (val) {
                if (val !== this._text) {
                    this._text = val;
                    this.repaint();
                }
            },
            enumerable: true,
            configurable: true
        });
        BitmapText.prototype.repaint = function () {
            this.removeChild.apply(this, this._bitmaps);
            this._bitmaps.length = 0;
            var totalwidth = 0;
            for (var _i = 0, _a = this._text; _i < _a.length; _i++) {
                var c = _a[_i];
                var define = this._charDefines[c];
                if (define) {
                    var bmp = new createjs.Bitmap(define.image);
                    bmp.sourceRect = define.sourceRect;
                    if (bmp.sourceRect) {
                        totalwidth += bmp.sourceRect.width;
                    }
                    else {
                        totalwidth += bmp.image.width;
                    }
                    this._bitmaps.push(bmp);
                }
            }
            var x = 0;
            var align = this._align;
            if (align === 'center') {
                x = -totalwidth / 2;
            }
            else if (align === 'right') {
                x = -totalwidth;
            }
            for (var _b = 0, _c = this._bitmaps; _b < _c.length; _b++) {
                var bmp = _c[_b];
                var width = bmp.sourceRect ? bmp.sourceRect.width : bmp.image.width;
                bmp.x = x;
                x += width;
            }
            this.addChild.apply(this, this._bitmaps);
        };
        return BitmapText;
    }(createjs.Container));
    exports.BitmapText = BitmapText;
});
define("client/src/hall/pet/PetPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/hall/shared/HorizontalPagePanel", "client/src/hall/pet/PetIcon", "client/src/GameLink", "shared/PetSkillDesc", "shared/PetRules", "client/src/hall/shared/CutStyleProgressBar", "client/src/hall/shared/BitmapText"], function (require, exports, HallUI_15, HorizontalPagePanel_1, PetIcon_1, GameLink_8, PetSkillDesc_1, PetRules, CutStyleProgressBar_3, BitmapText_1) {
    "use strict";
    var PAGER_HEIGHT = 340;
    var PAGER_WIDTH = 475;
    var MAX_PET_COUNT = PetRules.MAX_PET_COUNT;
    var PetPanel = (function () {
        function PetPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this._icons = [];
            this._selected = -1;
            this._unlockPetIdx = -1;
            //add background
            var background = new createjs.Bitmap(HallUI_15.HallUI.getImage('hall/pet_panel_background'));
            background.set({
                x: 31 - 15, y: 201 - 15
            });
            this.spr.addChild(background);
            var pager = this._pager = new HorizontalPagePanel_1.HorizontalPagePanel();
            pager.setPageSize(PAGER_WIDTH, PAGER_HEIGHT);
            pager.setPos(80, 472);
            this._createIcons();
            for (var i = 0; i < PetRules.MAX_PET_COUNT; ++i) {
                this._icons[i].setPet(i, 0);
            }
            for (var i = PetRules.MAX_PET_COUNT; i < this._icons.length; ++i) {
                this._icons[i].setPetUnknown();
            }
            this._petIcon = new createjs.Bitmap(null);
            this._petIcon.set({ x: 160, y: 314 });
            this.spr.addChild(this._petIcon);
            this._petName = new createjs.Bitmap(null);
            this._petName.set({ x: 160, y: 365 });
            this.spr.addChild(this._petName);
            var petExpBarBg = new createjs.Bitmap(HallUI_15.HallUI.getImage('hall/pet_progress_big_bg'));
            petExpBarBg.set({ x: 269, y: 289 });
            this.spr.addChild(petExpBarBg);
            this._petExpBar = new CutStyleProgressBar_3.CutStyleProgressBar(HallUI_15.HallUI.getImage('hall/pet_progress_big'));
            this._petExpBar.set({ x: 271, y: 291 });
            this.spr.addChild(this._petExpBar);
            var petSkillExpBarBg = new createjs.Bitmap(HallUI_15.HallUI.getImage('hall/pet_progress_big_bg'));
            petSkillExpBarBg.set({ x: 269, y: 350 + 14 });
            this.spr.addChild(petSkillExpBarBg);
            this._petSkillExpBar = new CutStyleProgressBar_3.CutStyleProgressBar(HallUI_15.HallUI.getImage('hall/pet_progress_big'));
            this._petSkillExpBar.set({ x: 271, y: 352 + 14 });
            this.spr.addChild(this._petSkillExpBar);
            this._skillDescText = new createjs.Text('', '20px SimHei', 'black');
            this._skillDescText.textAlign = 'center';
            this._skillDescText.set({ x: 320, y: 398 });
            this.spr.addChild(this._skillDescText);
            var text1 = new createjs.Text('宠物等级：', '21px SimHei', '#364f61');
            text1.set({
                x: 277, y: 265
            });
            this.spr.addChild(text1);
            var text2 = new createjs.Text('技能等级：', '21px SimHei', '#364f61');
            text2.set({
                x: 277, y: 321
            });
            this.spr.addChild(text2);
            var text3 = new createjs.Text('升级效果：', '21px SimHei', '#364f61');
            text3.set({ x: 277, y: 342 });
            this.spr.addChild(text3);
            this._skillUpgradeText = new createjs.Text('', '21px SimHei', '#af0000');
            this._skillUpgradeText.set({
                x: 379, y: 342
            });
            this.spr.addChild(this._skillUpgradeText);
            var buildCharDefines = function (chars, image, width, height) {
                var charDefines = [];
                var x = 0;
                for (var _i = 0, chars_2 = chars; _i < chars_2.length; _i++) {
                    var c = chars_2[_i];
                    charDefines.push({
                        char: c,
                        image: image,
                        sourceRect: new createjs.Rectangle(x, 0, width, height)
                    });
                    x += width;
                }
                return charDefines;
            };
            //
            var lv_charDefines = buildCharDefines('0123456789/Lv', HallUI_15.HallUI.getImage('hall/pet_panel_lv_chars'), 18, 25);
            var exp_charDefines = buildCharDefines('0123456789%', HallUI_15.HallUI.getImage('hall/pet_panel_exp_chars'), 19, 19);
            this._petLvText = new BitmapText_1.BitmapText(lv_charDefines);
            this._petLvText.set({ x: 380, y: 264 });
            this.spr.addChild(this._petLvText);
            this._petExpPercentText = new BitmapText_1.BitmapText(exp_charDefines);
            this._petExpPercentText.set({ x: 396, y: 294 });
            this._petExpPercentText.align = 'center';
            this.spr.addChild(this._petExpPercentText);
            this._petSkillLvText = new BitmapText_1.BitmapText(lv_charDefines);
            this._petSkillLvText.set({ x: 380, y: 320 });
            this.spr.addChild(this._petSkillLvText);
            this._petSkillExpPercentText = new BitmapText_1.BitmapText(exp_charDefines);
            this._petSkillExpPercentText.set({ x: 396, y: 357 + 14 });
            this._petSkillExpPercentText.align = 'center';
            this.spr.addChild(this._petSkillExpPercentText);
            //“未获得” mask
            {
                var mask = new createjs.Shape();
                var g = mask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRoundRect(46, 251, 551, 182, 20);
                g.endFill();
                this.spr.addChild(mask);
                var isVisible = function () { return !_this._currentPet || _this._currentPet.fake; };
                Object.defineProperty(mask, 'visible', {
                    get: isVisible
                });
                var text = new createjs.Text('暂未获得', '20px SimHei', '#d4cd0c');
                text.set({ textAlign: 'center', x: 520, y: 391 });
                this.spr.addChild(text);
                Object.defineProperty(text, 'visible', {
                    get: isVisible
                });
                Object.defineProperty(text, 'text', {
                    get: function () {
                        if (!_this._currentPet)
                            return '暂未开放';
                        if (_this._currentPet.fake)
                            return '暂未获得';
                        return '';
                    }
                });
            }
            this.spr.addChild(pager.spr);
            this.setSelect(0);
            this.setCarry(0);
        }
        PetPanel.prototype.onClickPetUnlock = function () {
            var _this = this;
            if (typeof this._currentPet.unlockPrice === 'number') {
                this._unlockPetIdx = this._currentPet.idx;
                HallUI_15.HallUI.instance.showConfirmDialog("\u662F\u5426\u82B1\u8D39" + this._currentPet.unlockPrice + "\u91D1\u5E01\u89E3\u9501\u5BA0\u7269\u7684\u7B49\u7EA7", function () {
                    GameLink_8.GameLink.instance.sendUnlockPet(_this._unlockPetIdx);
                    HallUI_15.HallUI.instance.closeConfirmDialog();
                });
            }
        };
        PetPanel.prototype.setSelect = function (idx) {
            var pet = GameLink_8.GameLink.instance.getPetInfo(idx) || GameLink_8.GameLink.instance.getFakePetInfo(idx);
            var icons = this._icons;
            for (var i = 0; i < icons.length; ++i) {
                icons[i].setSelected(i === idx);
            }
            this._selected = idx;
            this._currentPet = pet;
            this._currentPetSkillDesc = PetSkillDesc_1.PetSkillDesc[PetRules.PET_SKILL[idx]];
            this._refreshCurrentPet();
        };
        PetPanel.prototype.getSelect = function () {
            return this._selected;
        };
        PetPanel.prototype.setCarry = function (idx) {
            var icons = this._icons;
            for (var i = 0; i < icons.length; ++i) {
                icons[i].setCarry(i === idx);
            }
        };
        PetPanel.prototype._refreshCurrentPet = function () {
            var pet = this._currentPet;
            var bpet = !!pet;
            var uiToSetVisible = [
                this._petIcon,
                this._petName,
                this._petExpBar,
                this._petSkillExpBar,
                this._skillDescText,
                this._petLvText,
                this._petExpPercentText,
                this._petSkillLvText,
                this._petSkillExpPercentText,
                this._skillUpgradeText
            ];
            for (var _i = 0, uiToSetVisible_1 = uiToSetVisible; _i < uiToSetVisible_1.length; _i++) {
                var ui = uiToSetVisible_1[_i];
                ui.visible = bpet;
            }
            var toPercentText = function (n) {
                return ((n * 100) | 0) + "%";
            };
            if (pet) {
                var petIconImage = HallUI_15.HallUI.instance.getPetImage(pet.idx);
                this._petIcon.image = petIconImage;
                this._petIcon.regX = petIconImage.width / 2;
                this._petIcon.regY = petIconImage.height / 2;
                var petNameImage = HallUI_15.HallUI.instance.getImage('pet_name_' + pet.idx);
                this._petName.image = petNameImage;
                this._petName.regX = petNameImage.width / 2;
                this._petExpBar.percent = pet.exp / pet.expTotal;
                this._petSkillExpBar.percent = pet.skillExp / pet.skillExpTotal;
                var desc = this._currentPetSkillDesc.desc;
                if (typeof desc === 'string') {
                    this._skillDescText.text = desc;
                }
                else {
                    this._skillDescText.text = desc[(pet.skill - 1) | 0];
                }
                this._petLvText.text = pet.level + "/" + pet.maxLevel;
                this._petExpPercentText.text = toPercentText(pet.exp / pet.expTotal);
                this._petSkillLvText.text = pet.skill + "/" + this._currentPetSkillDesc.maxLevel;
                this._petSkillExpPercentText.text = toPercentText(pet.skillExp / pet.skillExpTotal);
                this._skillUpgradeText.text = this._currentPetSkillDesc.upgradeDesc;
            }
        };
        /**创建所有宠物的icon */
        PetPanel.prototype._createIcons = function () {
            var _this = this;
            var id = 0;
            var onclick = function (id) { return _this._onClickPet(id); };
            for (var i = 0; i < 8; ++i) {
                var page = new createjs.Container();
                //icon 的初始位置
                var X = 0;
                var Y = 0;
                var X_SPAN = 122;
                var Y_SPAN = 175;
                for (var i_1 = 0; i_1 < 8; ++i_1) {
                    var petIcon = new PetIcon_1.PetIcon();
                    petIcon.id = id++;
                    petIcon.spr.set({
                        x: X + (i_1 % 4) * X_SPAN,
                        y: Y + (i_1 >= 4 ? Y_SPAN : 0)
                    });
                    petIcon.onClick = onclick;
                    this._icons.push(petIcon);
                    page.addChild(petIcon.spr);
                }
                this._pager.addPage(page);
            }
        };
        PetPanel.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            if (isShow && !this.spr.visible) {
                this.setSelect(GameLink_8.GameLink.instance.currentPet);
            }
            this.spr.visible = isShow;
        };
        /** 由HallUI调用，当用户点击的携带按钮 */
        PetPanel.prototype.onClickCarry = function () {
            var sel = this.getSelect();
            if (GameLink_8.GameLink.instance.getPetInfo(sel)) {
                GameLink_8.GameLink.instance.sendSelectPet(sel);
            }
        };
        PetPanel.prototype.refresh = function () {
            var link = GameLink_8.GameLink.instance;
            this.setCarry(link.currentPet);
            for (var i = 0; i < this._icons.length; ++i) {
                var pet = link.getPetInfo(i);
                var canUnlock = false;
                if (!pet) {
                    if (i < PetRules.MAX_PET_COUNT) {
                        this._icons[i].setPetNotGet(i);
                    }
                    else {
                        this._icons[i].setPetUnknown();
                    }
                }
                else {
                    if (typeof pet.unlockPrice === 'number') {
                        canUnlock = true;
                    }
                    this._icons[i].setPet(i, pet.exp / pet.expTotal);
                }
                this._icons[i].setLockIcon(canUnlock);
            }
            this.setSelect(this.getSelect());
        };
        PetPanel.prototype._onClickPet = function (id) {
            //if (id < PetRules.MAX_PET_COUNT)
            {
                this.setSelect(id);
            }
        };
        return PetPanel;
    }());
    exports.PetPanel = PetPanel;
});
define("client/src/GameItemDefine", ["require", "exports", "shared/GameItemDefine"], function (require, exports, GameItemDefine_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    __export(GameItemDefine_1);
});
define("client/src/hall/ready_game/ReadyGamePanel", ["require", "exports", "client/src/hall/HallUI", "client/src/GameItemDefine", "client/src/ImageButton"], function (require, exports, HallUI_16, GameItemDefine, ImageButton_9) {
    "use strict";
    var BASE_POS = { x: 17, y: 202 - 14 };
    var ReadyGamePanel = (function () {
        function ReadyGamePanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this._items = [];
            var background = new createjs.Bitmap(HallUI_16.HallUI.getImage('hall/friend_panel_background'));
            background.set(BASE_POS);
            this.spr.addChild(background);
            var title_text = new createjs.Bitmap(HallUI_16.HallUI.getImage('hall/game_item_title_text'));
            title_text.set({
                regX: title_text.image.width / 2,
                x: 320,
                y: 302
            });
            this.spr.addChild(title_text);
            var bg2 = new createjs.Bitmap(HallUI_16.HallUI.getImage('hall/game_ready_item_bg'));
            bg2.set({ x: 44, y: 341 });
            this.spr.addChild(bg2);
            var cover = new createjs.Bitmap(HallUI_16.HallUI.getImage('hall/panel_conver'));
            cover.set({ x: 44, y: 293 });
            this.spr.addChild(cover);
            //let readyTextImage = new createjs.Bitmap(HallUI.getImage('hall/ready_text'));
            //readyTextImage.set({
            //	x: BASE_POS.x + 214,
            //	y: BASE_POS.y + 95
            //});
            //this.spr.addChild(readyTextImage);
            //let bgbg = new createjs.Bitmap(HallUI.getImage('hall/friend_background'));
            //bgbg.set({
            //	x: BASE_POS.x + 24,
            //	y: BASE_POS.y + 162
            //});
            //this.spr.addChild(bgbg);
            //let text2 = new createjs.Bitmap(HallUI.getImage('hall/game_item_sel_text'));
            //text2.set({
            //	x: BASE_POS.x + 180,
            //	y: BASE_POS.y + 200
            //});
            //this.spr.addChild(text2);
            var _loop_1 = function(i) {
                var item = this_1._createItem(i, GameItemDefine.GAME_ITEM_DEFINES[i]);
                this_1._items.push(item);
                this_1.spr.addChild(item);
                item.onClick = function () {
                    _this._onClickItem(i);
                    _this._save();
                };
            };
            var this_1 = this;
            for (var i = 0; i < 8; ++i) {
                _loop_1(i);
            }
            //let btn = new ImageButton(HallUI.getImage('hall/game_item_help_button'));
            //btn.set({ x: 459, y: 316 });
            //this.spr.addChild(btn);
            //btn.onClick = () => HallUI.instance.showGameItemHelp();
        }
        ReadyGamePanel.prototype._onClickItem = function (idx) {
            this._items[idx].setSelect(!this._items[idx].isSelected);
        };
        ReadyGamePanel.prototype._save = function () {
            localStorage.setItem('__selected_game_item', JSON.stringify(this.getSelectItems()));
        };
        ReadyGamePanel.prototype._load = function () {
            var arr;
            try {
                arr = JSON.parse(localStorage.getItem('__selected_game_item'));
            }
            catch (e) {
            }
            if (Array.isArray(arr)) {
                for (var i = 0; i < this._items.length; ++i) {
                    var obj = GameItemDefine.GAME_ITEM_DEFINES[i];
                    if (obj && arr.indexOf(obj.type) >= 0) {
                        this._items[i].setSelect(true);
                    }
                    else {
                        this._items[i].setSelect(false);
                    }
                }
            }
        };
        ReadyGamePanel.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            if ((isShow && !this.spr.visible) || !isShow) {
                //this.clearSelect();
                this._load();
            }
            this.spr.visible = isShow;
        };
        ReadyGamePanel.prototype.clearSelect = function () {
            this._items.forEach(function (item) {
                item.setSelect(false);
            });
        };
        ReadyGamePanel.prototype.getSelectItems = function () {
            var ret = [];
            for (var i = 0; i < this._items.length; ++i) {
                if (this._items[i].isSelected) {
                    var obj = GameItemDefine.GAME_ITEM_DEFINES[i];
                    if (obj) {
                        ret.push(obj.type);
                    }
                }
            }
            return ret;
        };
        ReadyGamePanel.prototype._createItem = function (i, obj) {
            /*
            let c = new createjs.Container();
            let bgImage = obj ? HallUI.getImage('hall/game_item_background') : HallUI.getImage('hall/game_item_empty_background');
            let selBgImage = obj ? HallUI.getImage('hall/game_item_background_sel') : null;
            let background = new createjs.Bitmap(bgImage);
            let icon;
            if (obj)
            {
                icon = new createjs.Bitmap(HallUI.getImage('hall/game_item_' + i));
            }
            let price_bg = new createjs.Bitmap(HallUI.getImage('hall/game_item_price_background'))
            price_bg.set({ x: -20, y: 106 });
    
            let price_text = new createjs.Text('11', '28px SimHei', 'white');
            price_text.textAlign = 'center';
            price_text.text = obj ? obj.price : '';
            price_text.set({ x: 62, y: 120 });
    
            c.addChild(background);
            if (icon) c.addChild(icon);
            c.addChild(price_bg);
            c.addChild(price_text);
    
            if (obj)
            {
                let mark = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_prize1'));
                mark.x = -15;
                mark.y = 108;
                c.addChild(mark);
            }
    
            c['isSelected'] = false;
            c['setSelect'] = function (sel)
            {
                if (obj)
                {
                    background.image = sel ? selBgImage : bgImage;
                }
                this.isSelected = sel;
            }
    
            const X = 77;
            const Y = 375;
            const X_SPAN = 135;
            const Y_SPAN = 163;
            c.x = X + (i % 4) * X_SPAN;
            c.y = Y + (i > 3 ? Y_SPAN : 0);
            */
            var c = new createjs.Container();
            if (obj) {
                var image_sel = HallUI_16.HallUI.getImage('hall/game_item_' + i + '_sel');
                var image_blur = HallUI_16.HallUI.getImage('hall/game_item_' + i);
                var button = new ImageButton_9.ImageButton(image_blur);
                button.onClick = function () {
                    if (c['onClick']) {
                        c['onClick']();
                    }
                };
                c['isSelected'] = false;
                c['setSelect'] = function (sel) {
                    button.image = sel ? image_sel : image_blur;
                    this.isSelected = sel;
                };
                button.x = image_sel.width / 2;
                button.y = image_sel.height / 2;
                c.addChild(button);
            }
            else {
                c['isSelected'] = false;
                c['setSelect'] = function (sel) {
                    //this.isSelected = sel;
                };
                var lockBitmap = new createjs.Bitmap(HallUI_16.HallUI.getImage('hall/game_item_locked'));
                c.addChild(lockBitmap);
            }
            var price_bg = new createjs.Bitmap(HallUI_16.HallUI.getImage('hall/game_item_price_bg'));
            price_bg.set({ x: 0, y: 146 });
            c.addChild(price_bg);
            if (obj) {
                var price_icon = new createjs.Bitmap(HallUI_16.HallUI.getImage('hall/game_item_price_icon'));
                price_icon.set({ x: 4, y: 139 });
                c.addChild(price_icon);
                var price_text_image = HallUI_16.HallUI.getImage('hall/game_item_price_' + obj.price);
                if (price_text_image) {
                    var price_text = new createjs.Bitmap(price_text_image);
                    price_text.set({ x: 64, y: 156, regX: price_text_image.width / 2 });
                    c.addChild(price_text);
                }
            }
            var X = 88;
            var Y = 380;
            var X_SPAN = 122;
            var Y_SPAN = 208;
            c.x = X + (i % 4) * X_SPAN;
            c.y = Y + (i > 3 ? Y_SPAN : 0);
            return c;
        };
        return ReadyGamePanel;
    }());
    exports.ReadyGamePanel = ReadyGamePanel;
});
define("client/src/hall/pet_levelup/PetLevelUpEntry", ["require", "exports", "client/src/hall/HallUI", "client/src/hall/shared/CutStyleProgressBar", "client/src/hall/shared/BitmapText"], function (require, exports, HallUI_17, CutStyleProgressBar_4, BitmapText_2) {
    "use strict";
    var PetLevelUpEntry = (function () {
        function PetLevelUpEntry(define) {
            this.spr = new createjs.Container();
            this.width = 0;
            this.height = 0;
            this._progress = 0;
            this._define = define;
            var background = new createjs.Bitmap(HallUI_17.HallUI.getImage('pet/levelup_background'));
            this.width = background.image.width;
            this.height = background.image.height;
            this.spr.addChild(background);
            var hw = this.width / 2;
            var hh = this.height / 2;
            background.set({ x: -hw, y: -hh });
            //icon
            {
                var icon = new createjs.Bitmap(HallUI_17.HallUI.instance.getPetImage(define.pet));
                this.spr.addChild(icon);
                icon.set({ x: 74 - hw - icon.image.width / 2, y: 60 - hh - icon.image.height / 2 });
            }
            //XX消
            {
                var text = new createjs.Text(define.num + "\u6D88", '24px SimHei', 'white');
                text.textAlign = 'right';
                text.x = 289 - hw;
                text.y = 22 - hh;
                this.spr.addChild(text);
            }
            if (define.from < 0) {
                var text = new createjs.Bitmap(HallUI_17.HallUI.getImage('hall/pet_lvup_not_get_text'));
                text.set({ x: 165 - hw, y: 64 - hh });
                this.spr.addChild(text);
            }
            else {
                this._lvTextBar = new BitmapText_2.BitmapText(BitmapText_2.BitmapText.buildCharDefines('LV:0123456789', HallUI_17.HallUI.getImage('hall/pet_lvup_lv_text'), 12, 14));
                this._lvTextBar.align = 'center';
                this._lvTextBar.set({ x: 154 - hw, y: 26 - hh });
                this.spr.addChild(this._lvTextBar);
                //progress bg
                //let pro_bg = new createjs.Bitmap(HallUI.getImage('pet/levelup_progress_background'));
                //pro_bg.set({ x: 143 - hw, y: 73 - hh });
                //this.spr.addChild(pro_bg);
                //progress bar
                var _expProgressBar = this._expProgressBar = new CutStyleProgressBar_4.CutStyleProgressBar(HallUI_17.HallUI.getImage('hall/pet_lvup_progress'));
                _expProgressBar.set({ x: 117 - hw, y: 58 - hh });
                _expProgressBar.percent = 1;
                this.spr.addChild(_expProgressBar);
                var progressText = new BitmapText_2.BitmapText(BitmapText_2.BitmapText.buildCharDefines('0123456789%', HallUI_17.HallUI.getImage('hall/pet_lvup_progress_chars'), 14, 19));
                progressText.set({ x: 260 - hw, y: 62 - hh });
                progressText.align = 'center';
                this.spr.addChild(progressText);
                this._progressText = progressText;
                this.progress = define.from;
                if (define.to !== define.from) {
                    createjs.Tween.get(this).wait(define.delay * 1000).to({ progress: define.to }, Math.abs(define.to - define.from) / define.speed * 1000);
                }
            }
        }
        Object.defineProperty(PetLevelUpEntry.prototype, "progress", {
            //为了动画方便，使用一个变量来控制，等级和经验
            //例如： 4.5表示，lv4和经验50%
            get: function () { return this._progress; },
            set: function (val) {
                if (this._progress === val)
                    return;
                var lv = Math.floor(val);
                var p = val - lv;
                this._lvTextBar.text = "LV:" + lv;
                this._expProgressBar.percent = p;
                this._progressText.text = ((p * 100) | 0) + "%";
                var lvOld = Math.floor(this._progress);
                if (this._progress !== 0 && lv !== lvOld) {
                    this._showLvUp();
                }
                this._progress = val;
            },
            enumerable: true,
            configurable: true
        });
        PetLevelUpEntry.prototype._showLvUp = function () {
            var _this = this;
            var x0 = 365 - this.width / 2, x1 = 155 - this.width / 2;
            var image = HallUI_17.HallUI.getImage('pet/levelup_text');
            var text = new createjs.Bitmap(image);
            text.set({
                regX: image.width / 2,
                regY: image.height / 2
            });
            text.set({ x: x0 + text.regX, y: 58 + text.regY - this.height / 2 });
            text.alpha = 0;
            createjs.Tween.get(text)
                .to({
                x: x1 + text.regX, alpha: 1
            }, 300, createjs.Ease.cubicOut)
                .wait(300)
                .to({
                alpha: 0,
                scaleY: 0
            }, 100)
                .call(function () {
                _this.spr.removeChild(text);
            });
            this.spr.addChild(text);
        };
        return PetLevelUpEntry;
    }());
    exports.PetLevelUpEntry = PetLevelUpEntry;
});
define("client/src/hall/pet_levelup/PetScoreChangeScene", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/util"], function (require, exports, HallUI_18, resource_5, util) {
    "use strict";
    var digit_images;
    var PetScoreChangeScene = (function () {
        function PetScoreChangeScene(petid, score1, score2) {
            var _this = this;
            this.spr = new createjs.Container();
            this._score2Image = [];
            this._current_score2 = 0;
            this._canClickToClose = false;
            if (!digit_images) {
                digit_images = util.cutRowImages(HallUI_18.HallUI.getImage('hall/petlv/num_digits'), 10);
            }
            this._score1 = score1 < 0 ? 0 : (score1 | 0);
            this._score2 = score2 < 0 ? 0 : (score2 | 0);
            var mask = new createjs.Shape();
            {
                var g = mask.graphics;
                g.beginFill('rgba(0,0,0,0.5)');
                g.drawRect(0, 0, resource_5.GraphicConstant.SCREEN_WIDTH, resource_5.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
            }
            mask.addEventListener('mousedown', function () { return _this._onClick(); });
            this.spr.addChild(mask);
            var icon = new createjs.Bitmap(HallUI_18.HallUI.instance.getPetImage(petid));
            icon.set({
                regX: icon.image.width / 2,
                regY: icon.image.height / 2,
                x: 320,
                y: 422
            });
            this.spr.addChild(icon);
            var ICON_SHOW_DURATION = 400;
            var SCORE_CHANGE_DURATION = 1000;
            //宠物放大动画
            var iconScaleAnimation = createjs.Tween.get(icon).to({ scaleX: 2.5, scaleY: 2.5 }, ICON_SHOW_DURATION, createjs.Ease.elasticOut);
            //数字变化动画
            var scoreChangeAnimation = createjs.Tween.get(this)
                .wait(iconScaleAnimation.duration) //等宠物放大结束
                .call(function () {
                _this._showText();
                _this.score2 = _this._score1;
            })
                .to({ score2: this._score2 }, SCORE_CHANGE_DURATION) //数字动画过程
                .call(function () {
                _this._canClickToClose = true;
            }).wait(3000).call(function () { return _this._close(); }); //3秒后自动结束
        }
        PetScoreChangeScene.prototype._showText = function () {
            var xx = 77;
            var yy = 574;
            var text = new createjs.Bitmap(HallUI_18.HallUI.getImage('hall/petlv/text'));
            text.set({ x: xx, y: yy });
            this.spr.addChild(text);
            xx += text.image.width;
            // 第一个数字
            for (var _i = 0, _a = this._score1.toString(); _i < _a.length; _i++) {
                var c = _a[_i];
                var bmp = new createjs.Bitmap(digit_images[parseInt(c)]);
                bmp.set({ x: xx, y: yy + 5 });
                this.spr.addChild(bmp);
                xx += bmp.image.width;
            }
            //→
            var right_arrow = new createjs.Bitmap(HallUI_18.HallUI.getImage('hall/petlv/right_arrow'));
            right_arrow.set({ x: xx, y: yy + 12 });
            this.spr.addChild(right_arrow);
            xx += right_arrow.image.width;
            this._score2StartX = xx;
            this._score2StartY = yy;
        };
        Object.defineProperty(PetScoreChangeScene.prototype, "score2", {
            get: function () { return this._current_score2; },
            set: function (val) {
                this._current_score2 = val;
                this._setScore2(val);
            },
            enumerable: true,
            configurable: true
        });
        PetScoreChangeScene.prototype._setScore2 = function (n) {
            if (typeof this._score2StartX === 'undefined')
                return;
            var ss = n < 0 ? '0' : (n | 0).toString();
            var arr = this._score2Image;
            if (ss.length !== arr.length) {
                for (var _i = 0, arr_2 = arr; _i < arr_2.length; _i++) {
                    var c = arr_2[_i];
                    this.spr.removeChild(c);
                }
                arr.length = 0;
                for (var i = 0; i < ss.length; ++i) {
                    var c = new createjs.Bitmap(null);
                    arr.push(c);
                    this.spr.addChild(c);
                }
            }
            var xx = this._score2StartX;
            var yy = this._score2StartY;
            for (var i = 0; i < arr.length; ++i) {
                arr[i].image = digit_images[parseInt(ss[i])];
                arr[i].x = xx;
                arr[i].y = yy + 5;
                xx += arr[i].image.width;
            }
            if (!this._upArrow) {
                this._upArrow = new createjs.Bitmap(HallUI_18.HallUI.getImage('hall/petlv/up_arrow'));
                this.spr.addChild(this._upArrow);
            }
            this._upArrow.x = xx;
            this._upArrow.y = yy;
        };
        PetScoreChangeScene.prototype._onClick = function () {
            if (this._canClickToClose) {
                this._close();
            }
        };
        PetScoreChangeScene.prototype._close = function () {
            if (this.spr.parent) {
                this.spr.parent.removeChild(this.spr);
                if (this.onAnimationEnd)
                    this.onAnimationEnd();
                this.onAnimationEnd = null;
            }
        };
        return PetScoreChangeScene;
    }());
    exports.PetScoreChangeScene = PetScoreChangeScene;
    window['testme'] = function () {
        window['stage'].stage.addChild(new PetScoreChangeScene(0, 567, 1024).spr);
    };
});
define("client/src/hall/pet_levelup/PetLevelUpPanel", ["require", "exports", "client/src/hall/pet_levelup/PetLevelUpEntry", "client/src/GameLink", "client/src/hall/pet_levelup/PetScoreChangeScene"], function (require, exports, PetLevelUpEntry_1, GameLink_9, PetScoreChangeScene_1) {
    "use strict";
    var PROGRESS_ANIM_TIME = 2; //涨经验动画时间的长度
    var PetLevelUpPanel = (function () {
        function PetLevelUpPanel(petLevelUpInfo) {
            var _this = this;
            this.spr = new createjs.Container();
            this.delay = 6; //这个东西显示时间多长（秒）
            this._pendingScoreChangeAnimation = [];
            this._entries = [];
            var i = 0;
            var maxProgress = 0;
            var speed = 1;
            for (var _i = 0, petLevelUpInfo_1 = petLevelUpInfo; _i < petLevelUpInfo_1.length; _i++) {
                var info = petLevelUpInfo_1[_i];
                if (info.from >= 0) {
                    var pp = Math.abs(info.to - info.from);
                    if (pp > maxProgress)
                        maxProgress = pp;
                }
            }
            if (maxProgress > 0) {
                speed = maxProgress / PROGRESS_ANIM_TIME;
            }
            for (var _a = 0, petLevelUpInfo_2 = petLevelUpInfo; _a < petLevelUpInfo_2.length; _a++) {
                var info = petLevelUpInfo_2[_a];
                var e = this._create(i, info, speed);
                this.spr.addChild(e.spr);
                this._entries.push(e);
                ++i;
                if (info.from >= 1 && info.to >= 1 && (info.from | 0) !== (info.to | 0)) {
                    this._pendingScoreChangeAnimation.push({
                        petid: info.pet,
                        score1: GameLink_9.GameLink.instance.getPetScoreByLevel(info.pet, info.from | 0),
                        score2: GameLink_9.GameLink.instance.getPetScoreByLevel(info.pet, info.to | 0),
                    });
                }
            }
            window.setTimeout(function () { return _this._checkScoreChangeAnimation(); }, this.delay * 1000);
        }
        //往上收起的动画开始播放
        PetLevelUpPanel.prototype._startHide = function () {
            for (var _i = 0, _a = this._entries; _i < _a.length; _i++) {
                var c = _a[_i];
                c['_startHideAnimation']();
            }
        };
        //检查是否还有，升级动画
        PetLevelUpPanel.prototype._checkScoreChangeAnimation = function () {
            var _this = this;
            //如果没有了
            if (this._pendingScoreChangeAnimation.length === 0) {
                //则播放收起的动画
                this._startHide();
                //然后结束自己
                setTimeout(function () {
                    _this._close();
                }, 300);
                return;
            }
            var obj = this._pendingScoreChangeAnimation.shift();
            var cc = new PetScoreChangeScene_1.PetScoreChangeScene(obj.petid, obj.score1, obj.score2);
            this.spr.addChild(cc.spr);
            cc.onAnimationEnd = function () { return _this._checkScoreChangeAnimation(); };
        };
        PetLevelUpPanel.prototype._create = function (i, info, speed) {
            var DELAY = 0.4;
            var SHOW_DELAY_SPAN = 0.03; //延迟的间隔
            var SHOW_ANIM = 0.2; //显示出来的动画
            var HIDE_ANIM = 0.2;
            var x = 640 / 2;
            var y = 150 + 142 * i;
            info.delay = DELAY;
            info.speed = speed;
            var e = new PetLevelUpEntry_1.PetLevelUpEntry(info);
            e.spr.set({ x: x, y: y });
            e.spr.set({ scaleX: 0, scaleY: 0 });
            var twn = createjs.Tween.get(e.spr);
            twn.wait(SHOW_DELAY_SPAN * i * 1000);
            twn.to({ scaleX: 1, scaleY: 1 }, SHOW_ANIM * 1000, createjs.Ease.backOut);
            twn.wait((PROGRESS_ANIM_TIME + 1) * 1000);
            //twn.to({ y: y - 200, alpha: 0 }, HIDE_ANIM * 1000, createjs.Ease.backIn);
            e['_startHideAnimation'] = function () {
                //twn.setPaused(false);
                createjs.Tween.get(e.spr).to({ y: y - 200, alpha: 0 }, HIDE_ANIM * 1000, createjs.Ease.backIn);
            };
            return e;
        };
        PetLevelUpPanel.prototype._close = function () {
            if (this.spr.parent) {
                this.spr.parent.removeChild(this.spr);
                if (this.onAnimationEnd) {
                    this.onAnimationEnd();
                }
                this.onAnimationEnd = null;
            }
        };
        PetLevelUpPanel.SAMPLE_DATA = [
            { pet: 0, num: 30, from: 1.1, to: 1.1 },
            { pet: 1, num: 31, from: 2.1, to: 3.5 },
            { pet: 2, num: 32, from: 1.9, to: 3.1 },
            { pet: 3, num: 33, from: -1, to: -1 },
            { pet: 4, num: 34, from: -1, to: -1 },
        ];
        return PetLevelUpPanel;
    }());
    exports.PetLevelUpPanel = PetLevelUpPanel;
});
define("client/src/hall/BlinkStarEffect", ["require", "exports", "client/src/hall/HallUI"], function (require, exports, HallUI_19) {
    "use strict";
    var BlinkStarEffect = (function () {
        function BlinkStarEffect() {
            var _this = this;
            this.spr = new createjs.Container();
            this.width = 518;
            this.height = 114;
            this.STAR_CREATE_SPAN = 80;
            this.SIZE_SCALE = [0.5, 1.2];
            this.ANIM_DURATION = [200, 400];
            this._freeStarList = [];
            this._start = false;
            this._lastCreateStarTime = 0;
            this.spr.addEventListener('tick', function () { return _this.onTick(); });
        }
        BlinkStarEffect.prototype.createStar = function () {
            if (this._freeStarList.length > 0) {
                var star = this._freeStarList.pop();
                star.visible = true;
                return star;
            }
            var image = HallUI_19.HallUI.instance.getImage('hall/blink_star');
            var star = new createjs.Bitmap(image);
            star.set({
                regX: image.width / 2,
                regY: image.height / 2
            });
            this.spr.addChild(star);
            return star;
        };
        BlinkStarEffect.prototype.removeStar = function (star) {
            if (!this._start) {
                this.spr.removeChild(star);
                return;
            }
            star.visible = false;
            this._freeStarList.push(star);
        };
        BlinkStarEffect.prototype.onTick = function () {
            if (!this._start)
                return;
            var now = Date.now();
            if (now > this._lastCreateStarTime + this.STAR_CREATE_SPAN) {
                this._lastCreateStarTime = now;
                this._addStar();
            }
        };
        BlinkStarEffect.prototype._addStar = function () {
            var _this = this;
            var star = this.createStar();
            var scale = this.SIZE_SCALE[0] + (this.SIZE_SCALE[1] - this.SIZE_SCALE[0]) * Math.random();
            var duration = this.ANIM_DURATION[0] + (this.ANIM_DURATION[1] - this.ANIM_DURATION[0]) * Math.random();
            star.set({
                x: this.width * Math.random(),
                y: this.height * Math.random(),
                scaleX: 0,
                scaleY: 0,
                alpha: 0
            });
            createjs.Tween.get(star)
                .to({ scaleX: scale, scaleY: scale, alpha: 1 }, duration)
                .to({ scaleX: 0, scaleY: 0, alpha: 0 }, duration)
                .call(function () { _this.removeStar(star); });
        };
        BlinkStarEffect.prototype.start = function () {
            this._start = true;
        };
        BlinkStarEffect.prototype.stop = function () {
            if (this._start) {
                this._start = false;
                for (var _i = 0, _a = this._freeStarList; _i < _a.length; _i++) {
                    var x = _a[_i];
                    this.spr.removeChild(x);
                }
                this._freeStarList.length = 0;
            }
        };
        return BlinkStarEffect;
    }());
    exports.BlinkStarEffect = BlinkStarEffect;
    window['BlinkStarEffect'] = BlinkStarEffect;
});
define("client/src/hall/score/ScorePanel", ["require", "exports", "client/src/hall/HallUI", "client/src/util", "client/src/hall/BlinkStarEffect", "client/src/GameLink", "client/src/hall/shared/BitmapText"], function (require, exports, HallUI_20, util, BlinkStarEffect_1, GameLink_10, BitmapText_3) {
    "use strict";
    var ADD_FOR_NEW_UI = 98;
    var BASE_POS = { x: 43, y: 95 + ADD_FOR_NEW_UI };
    var ScorePanel = (function () {
        function ScorePanel() {
            var _this = this;
            this.spr = new createjs.Container();
            var BASE_X = 90;
            var BASE_Y = 263;
            var background = new createjs.Bitmap(HallUI_20.HallUI.getImage('hall/score_panel_background'));
            background.set({ x: BASE_X, y: BASE_Y });
            this.spr.addChild(background);
            //先来一层静态的背景
            {
                var add = function (name, x, y) {
                    var bitmap = new createjs.Bitmap(HallUI_20.HallUI.getImage(name));
                    bitmap.x = x;
                    bitmap.y = y;
                    _this.spr.addChild(bitmap);
                    return bitmap;
                };
                //add('hall/score/title_text', 220, 190);
                this._titleBitmap = new createjs.Bitmap(HallUI_20.HallUI.getImage('hall/score/title_text'));
                this.spr.addChild(this._titleBitmap);
                this._titleBitmap.set({ x: 320, y: BASE_Y - 30, regX: this._titleBitmap.image.width / 2 });
                this._petIcon = new createjs.Bitmap(null);
                this._petIcon.set({
                    x: 173, y: 482
                });
                this._petIcon.image = HallUI_20.HallUI.instance.getPetImage(0);
                this.spr.addChild(this._petIcon);
            }
            //各种text
            {
                var add = function (sampleText, size, color, x, y, align) {
                    var text = new createjs.Text(sampleText, size + "px sans-serif", color);
                    text.set({ x: x, y: y });
                    text.textAlign = align;
                    _this.spr.addChild(text);
                    return text;
                };
                var addBitmapText = function (sampleText, defines, x, y, align) {
                    var text = new BitmapText_3.BitmapText(defines);
                    text.set({ x: x, y: y });
                    text.align = align;
                    _this.spr.addChild(text);
                    return text;
                };
                var percentChars = BitmapText_3.BitmapText.buildCharDefines('0123456789%', HallUI_20.HallUI.getImage('hall/score/percent_chars'), 20, 20);
                var stdChars = BitmapText_3.BitmapText.buildCharDefines('0123456789,+', HallUI_20.HallUI.getImage('hall/score/std_score_chars'), 20, 20);
                this._petAddPercentText = addBitmapText('(18%)', percentChars, 269, 393, 'left');
                this._itemAddPercentText = addBitmapText('(10%)', percentChars, 269, 429, 'left');
                this._petAddScoreText = addBitmapText('22,222', stdChars, 471, 393, 'right');
                this._itemAddScoreText = addBitmapText('1,234', stdChars, 471, 429, 'right');
                this._petScoreText = addBitmapText('99', stdChars, 445, 505, 'right');
                this._coinText = addBitmapText('600', stdChars, 445, 550, 'right');
                this._weekScoreText = addBitmapText('99,999', stdChars, 485, 620, 'right');
                this._historicalScoreText = addBitmapText('999,999', stdChars, 485, 647, 'right');
                var scoreChars = BitmapText_3.BitmapText.buildCharDefines('0123456789,', HallUI_20.HallUI.getImage('hall/score/score_chars'), 35, 40);
                this._scoreText = addBitmapText('99,999,999', scoreChars, 320, 314, 'center');
                var lvChars = BitmapText_3.BitmapText.buildCharDefines('0123456789', HallUI_20.HallUI.getImage('hall/score/pet_lv_chars'), 20, 20);
                this._petLvText = addBitmapText('11', lvChars, 221, 560, 'left');
            }
            this.setScore(987654);
            this._blinkStar = new BlinkStarEffect_1.BlinkStarEffect();
            this._blinkStar.spr.set({
                x: 128, y: 313
            });
            this._blinkStar.width = 381;
            this._blinkStar.height = 76;
            this.spr.addChild(this._blinkStar.spr);
        }
        //private _lastMatchType: string;
        ScorePanel.prototype.setScore = function (score) {
            this._scoreText.text = util.intToString(score);
        };
        ScorePanel.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            this.spr.visible = isShow;
            if (isShow) {
                this._blinkStar.start();
            }
            else {
                this._blinkStar.stop();
            }
        };
        ScorePanel.prototype.showData = function (obj) {
            this._petIcon.image = HallUI_20.HallUI.instance.getPetImage(obj.pet | 0);
            var petinfo = GameLink_10.GameLink.instance.getFakePetInfo(obj.pet | 0);
            if (petinfo) {
                this._petLvText.text = (petinfo.level | 0).toString();
            }
            this._petScoreText.text = '+' + (obj.petScore | 0).toString();
            this.setScore(obj.score);
            this._petAddPercentText.text = ((obj.petAddPercent * 100) | 0) + "%";
            this._itemAddPercentText.text = ((obj.itemAddPercent * 100) | 0) + "%";
            this._petAddScoreText.text = (obj.petAddScore | 0).toString();
            this._itemAddScoreText.text = (obj.itemAddScore | 0).toString();
            this._weekScoreText.text = util.intToString(obj.weekHighScore | 0);
            this._historicalScoreText.text = util.intToString(obj.historicalHighScore | 0);
            this._coinText.text = '+' + (obj.coin | 0).toString();
            /*
            this._mask.visible = obj.isMatch;
            this._btnMatchAgain.visible = obj.isMatch;
            this._btnToMatch.visible = obj.isMatch;
            this._lastMatchType = obj.matchType;
            */
        };
        return ScorePanel;
    }());
    exports.ScorePanel = ScorePanel;
});
define("client/src/hall/mail/MailEntry", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/FixSizeBitmap", "client/src/GameLink"], function (require, exports, HallUI_21, ImageButton_10, FixSizeBitmap_1, GameLink_11) {
    "use strict";
    /*
        { id: 'hall/weekly_task_prize0', src: 'images/hall/_0022_图层-42-副本-3.png' },//钻石
        { id: 'hall/weekly_task_prize1', src: 'images/hall/_0046_图层-11.png' },//金币
        { id: 'hall/weekly_task_prize2', src: 'images/hall/_0077_图层-28-副本-2.png' },//心
    */
    var MailEntry = (function () {
        function MailEntry() {
            var _this = this;
            this.spr = new createjs.Container();
            this.width = 0;
            this.height = 0;
            {
                var background = new createjs.Bitmap(HallUI_21.HallUI.getImage('hall/mail/bkg'));
                this.width = background.image.width;
                this.height = background.image.height;
                this.spr.addChild(background);
            }
            {
                this._icon = new createjs.Bitmap(null);
                this._icon.set({ x: 58, y: 60 });
                this.spr.addChild(this._icon);
            }
            {
                this._faceIcon = new createjs.Bitmap(null);
                this._faceIcon.set({ x: 58, y: 60 });
                FixSizeBitmap_1.MakeSuitableSize(this._faceIcon, 60, 60, HallUI_21.HallUI.getImage('hall/default_user_headicon'));
                this.spr.addChild(this._faceIcon);
                this._faceIcon.hitArea = new createjs.Shape();
            }
            {
                this._text = new createjs.Text('', '22px SimHei', '#142d3e');
                this._text.lineHeight = 22;
                this._text.set({ x: 113, y: 22 });
                this.spr.addChild(this._text);
            }
            {
                this._timeText = new createjs.Text('2009/1/2 1:3:4', '14px SimHei', '#142d3e');
                this._timeText.set({ x: 433, y: 88 });
                this._timeText.textAlign = 'center';
                this._timeText.lineHeight = 12;
                this.spr.addChild(this._timeText);
            }
            {
                var btn = new ImageButton_10.ImageButton(HallUI_21.HallUI.getImage('hall/mail/btngetmail'));
                btn.set({ x: 433, y: 50 });
                btn.scaleX = btn.scaleY = 0.8;
                btn.onClick = function () { return _this.onClickRecv(); };
                this.spr.addChild(btn);
                this._recvButton = btn;
            }
            {
                this._agreeButton = new ImageButton_10.ImageButton(HallUI_21.HallUI.getImage('hall/agree_button'));
                this._agreeButton.set({ x: 473, y: 50 });
                this.spr.addChild(this._agreeButton);
                this._agreeButton.onClick = function () { return _this.onClickRecv(); };
            }
            {
                this._rejectButton = new ImageButton_10.ImageButton(HallUI_21.HallUI.getImage('hall/reject_button'));
                this._rejectButton.set({ x: 393, y: 50 });
                this.spr.addChild(this._rejectButton);
                this._rejectButton.onClick = function () { return _this.onClickReject(); };
            }
        }
        MailEntry.prototype.onClickRecv = function () {
            GameLink_11.GameLink.instance.sendReqRecvMail(this.id);
        };
        MailEntry.prototype.onClickReject = function () {
            GameLink_11.GameLink.instance.sendReqRejectMail(this.id);
        };
        MailEntry.prototype.setContent = function (mail /*id, type: 'heart' | 'coin' | 'diamond', text: string, time: number*/) {
            this.id = mail.id;
            this._recvButton.visible = true;
            //set icon
            if (mail.type === 'addFriend') {
                this._faceIcon.visible = true;
                this._icon.visible = false;
                this._agreeButton.visible = true;
                this._rejectButton.visible = true;
                this._recvButton.visible = false;
                if (mail.fromKeyFace) {
                    var img = this._faceIcon.image = new Image();
                    img.src = mail.fromKeyFace;
                }
                else {
                    this._faceIcon.image = null;
                }
            }
            else {
                this._agreeButton.visible = false;
                this._rejectButton.visible = false;
                this._recvButton.visible = true;
                this._faceIcon.visible = false;
                this._icon.visible = true;
                var imgid = void 0;
                switch (mail.type) {
                    case 'heart':
                        imgid = 'hall/new_weekly_task_prize2';
                        break;
                    case 'coin':
                        imgid = 'hall/new_weekly_task_prize0';
                        break;
                    case 'diamond':
                        imgid = 'hall/new_weekly_task_prize1';
                        break;
                }
                if (imgid) {
                    this._icon.image = HallUI_21.HallUI.getImage(imgid);
                }
                if (this._icon.image) {
                    this._icon.set({
                        regX: this._icon.image.width / 2,
                        regY: this._icon.image.height / 2
                    });
                }
            }
            //common things
            this._text.text = this._breakLineText(mail.text);
            var d = new Date(mail.time);
            d.setTime(mail.time);
            this._timeText.text = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        };
        MailEntry.prototype._breakLineText = function (text) {
            var WIDTH = 240;
            var CHAR_WIDTH = 22;
            var newText = '';
            var x = 0;
            for (var _i = 0, text_2 = text; _i < text_2.length; _i++) {
                var c = text_2[_i];
                var width = c.charCodeAt(0) <= 0xff ? CHAR_WIDTH / 2 : CHAR_WIDTH;
                if (x + width <= WIDTH) {
                    x += width;
                    newText += c;
                }
                else {
                    x = width;
                    newText += '\n' + c;
                }
            }
            return newText;
        };
        return MailEntry;
    }());
    exports.MailEntry = MailEntry;
});
define("client/src/hall/mail/MailPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton", "client/src/hall/shared/VerticalScrollPanel", "client/src/hall/mail/MailEntry", "client/src/GameLink"], function (require, exports, HallUI_22, resource_6, ImageButton_11, VerticalScrollPanel_3, MailEntry_1, GameLink_12) {
    "use strict";
    var MailPanel = (function () {
        function MailPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this._mailEntries = [];
            var ADD_TO_Y = 110;
            //black mask
            {
                var bgMask = new createjs.Shape();
                var g = bgMask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_6.GraphicConstant.SCREEN_WIDTH, resource_6.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
                this.spr.addChild(bgMask);
                bgMask.addEventListener('mousedown', function () { });
            }
            //background
            {
                var bg = new createjs.Bitmap(HallUI_22.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 35, y: 89 + ADD_TO_Y });
                this.spr.addChild(bg);
            }
            //title text
            {
                var title = new createjs.Bitmap(HallUI_22.HallUI.getImage('hall/mail/title'));
                title.set({ x: 260, y: 116 + ADD_TO_Y });
                this.spr.addChild(title);
            }
            {
                //let mail_text = new createjs.Bitmap(HallUI.getImage('hall/mail_text'));
                //mail_text.set({ x: 66, y: 710 + ADD_TO_Y });
                //this.spr.addChild(mail_text);
                var mail_text = new createjs.Text('邮箱只保留30天内的邮件，\n请及时接受邮件奖励', '27px SimHei', '#142d3e');
                mail_text.lineHeight = 30;
                mail_text.set({ x: 66, y: 710 + ADD_TO_Y });
                this.spr.addChild(mail_text);
            }
            //mail list panel
            {
                var panel = this._mailListPanel = new VerticalScrollPanel_3.VerticalScrollPanel();
                //panel.setVisualizeMask(true);
                panel.setPos({ x: 44, y: 246 + ADD_TO_Y });
                panel.setSize(539, 440);
                this.spr.addChild(panel.spr);
            }
            //recv all button
            {
                var btn = new ImageButton_11.ImageButton(HallUI_22.HallUI.getImage('hall/mail/btngetallmail'));
                btn.set({ x: 473, y: 740 + ADD_TO_Y });
                this.spr.addChild(btn);
                btn.onClick = function () { return _this._onClickRecvAll(); };
            }
            //close button
            {
                var btnClose = new ImageButton_11.ImageButton(HallUI_22.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: resource_6.GraphicConstant.SCREEN_WIDTH / 2, y: 885 + ADD_TO_Y });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    _this.show(false);
                };
            }
            this.spr.visible = false;
            /*
                    let mails = [];
                    let tp = ['coin', 'heart', 'diamond']
                    for (let i = 0; i < 10; ++i)
                    {
                        mails.push({
                            type: tp[i % tp.length],
                            text: 'aa邮件   fsfasfsf dsfads fsdf ds中文' + i,
                            time: Date.now()
                        });
                    }
                    mails[0].text = '一二三四五六七八九十，一二三四五六七八九十，一二三四五六七八九十';
                    mails[1].text = '一1三四五2七八3十，一二三4五六5八九十，一二三四五六七八九十';
                    mails[2].text = '一....2七八3十，一二三4五六5八九十，一二三四五六七八九十';
                    this.setMails(mails);
            */
        }
        MailPanel.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            if (isShow && !this.isShowing()) {
                GameLink_12.GameLink.instance.sendReqMail();
            }
            this.spr.visible = isShow;
        };
        MailPanel.prototype.isShowing = function () {
            return !!this.spr.visible;
        };
        MailPanel.prototype.setMails = function (mails) {
            var count = mails.length;
            while (count < this._mailEntries.length) {
                var entry = this._mailEntries.pop();
                this._mailListPanel.removeChild(entry.spr);
            }
            var HEIGHT = 112;
            var SPAN = 10;
            while (count > this._mailEntries.length) {
                var entry = new MailEntry_1.MailEntry();
                this._mailEntries.push(entry);
                var i = this._mailEntries.length;
                entry.spr.set({
                    x: 10,
                    y: (i - 1) * (HEIGHT + SPAN)
                });
                this._mailListPanel.addChild(entry.spr);
            }
            this._mailListPanel.contentHeight = count * (HEIGHT + SPAN);
            for (var i = 0; i < count; ++i) {
                var m = mails[i];
                this._mailEntries[i].setContent(m);
            }
        };
        MailPanel.prototype._onClickRecvAll = function () {
            GameLink_12.GameLink.instance.sendReqRecvAllMail();
        };
        return MailPanel;
    }());
    exports.MailPanel = MailPanel;
});
define("client/src/hall/confirm_dialog/ConfirmDialog", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/resource"], function (require, exports, HallUI_23, ImageButton_12, res) {
    "use strict";
    var ConfirmDialog = (function () {
        function ConfirmDialog() {
            var _this = this;
            this.spr = new createjs.Container();
            this.spr.visible = false;
            var ADD = 120;
            //background		
            {
                var shape = new createjs.Shape();
                {
                    var g = shape.graphics;
                    g.beginFill('rgba(0,0,0,0.8)');
                    g.drawRect(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
                    g.endFill();
                }
                shape.mouseEnabled = true;
                shape.addEventListener('mousedown', function () { });
                this.spr.addChild(shape);
                var bg = new createjs.Bitmap(HallUI_23.HallUI.getImage('hall/dialog_bg'));
                bg.set({
                    x: (res.GraphicConstant.SCREEN_WIDTH - bg.image.width) / 2,
                    y: 212 + ADD
                });
                this.spr.addChild(bg);
                var title = new createjs.Bitmap(HallUI_23.HallUI.getImage('hall/dialog_title'));
                title.x = (res.GraphicConstant.SCREEN_WIDTH - title.image.width) / 2;
                title.y = 76 + 212 + ADD;
                this.spr.addChild(title);
            }
            //test
            {
                var text = new createjs.Text('Some Thing', '30px SimHei', 'white');
                text.set({ x: 140, y: 372 + ADD });
                this._text = text;
                text.lineHeight = 30;
                this.spr.addChild(text);
            }
            //buttons
            {
                this._defaultOkImage = HallUI_23.HallUI.getImage('hall/ok_button');
                var btnok = new ImageButton_12.ImageButton(HallUI_23.HallUI.getImage('hall/ok_button'));
                btnok.set({ x: 454, y: 511 + ADD });
                this.spr.addChild(btnok);
                this._defaultCancelImage = HallUI_23.HallUI.getImage('hall/return_button');
                var btncancel = new ImageButton_12.ImageButton(this._defaultCancelImage);
                btncancel.set({ x: 202, y: 511 + ADD });
                this.spr.addChild(btncancel);
                btnok.onClick = function () {
                    if (_this._onOk)
                        _this._onOk();
                    else
                        _this.hide();
                };
                btncancel.onClick = function () {
                    if (_this._onCancel)
                        _this._onCancel();
                    else
                        _this.hide();
                };
                this._btnok = btnok;
                this._btncancel = btncancel;
            }
        }
        ConfirmDialog.prototype.show = function (text, onOk, onCancel, config) {
            this.spr.visible = true;
            this._text.text = text;
            this._onOk = onOk;
            this._onCancel = onCancel;
            this._btnok.image = (config && config.okImage) || this._defaultOkImage;
            this._btncancel.image = (config && config.cancelImage) || this._defaultCancelImage;
        };
        ConfirmDialog.prototype.hide = function () {
            this.spr.visible = false;
            this._onOk = null;
            this._onCancel = null;
        };
        return ConfirmDialog;
    }());
    exports.ConfirmDialog = ConfirmDialog;
});
define("shared/GiftDefine", ["require", "exports"], function (require, exports) {
    "use strict";
    function getShopGift(i) {
        if (i == 0) {
            return GIFT0;
        }
        return null;
    }
    exports.getShopGift = getShopGift;
    var GIFT0 = {
        price: 10000,
        gifts: [
            { type: 'pet', id: 0, pp: 5, num: 1 },
            { type: 'pet', id: 1, pp: 5, num: 1 },
            { type: 'pet', id: 2, pp: 5, num: 1 },
            { type: 'pet', id: 3, pp: 5, num: 1 },
            { type: 'pet', id: 4, pp: 5, num: 1 },
            { type: 'pet', id: 5, pp: 5, num: 1 },
            { type: 'pet', id: 6, pp: 5, num: 1 },
            { type: 'pet', id: 7, pp: 5, num: 1 },
            { type: 'pet', id: 8, pp: 5, num: 1 },
            { type: 'pet', id: 9, pp: 5, num: 1 },
            { type: 'pet', id: 10, pp: 5, num: 1 },
            { type: 'pet', id: 11, pp: 5, num: 1 },
            { type: 'pet', id: 12, pp: 5, num: 1 },
            { type: 'pet', id: 13, pp: 5, num: 1 },
            { type: 'pet', id: 14, pp: 5, num: 1 },
            { type: 'pet', id: 15, pp: 5, num: 1 },
            { type: 'pet', id: 16, pp: 5, num: 1 },
            { type: 'pet', id: 17, pp: 5, num: 1 },
            { type: 'pet', id: 18, pp: 5, num: 1 },
            { type: 'pet', id: 19, pp: 5, num: 1 },
            { type: 'pet', id: 20, pp: 5, num: 1 },
            { type: 'pet', id: 21, pp: 5, num: 1 },
            { type: 'pet', id: 22, pp: 5, num: 1 },
            { type: 'pet', id: 23, pp: 5, num: 1 },
            { type: 'pet', id: 24, pp: 5, num: 1 },
            { type: 'pet', id: 25, pp: 5, num: 1 },
            { type: 'pet', id: 26, pp: 5, num: 1 },
        ]
    };
});
define("client/src/hall/shop/ShopUI", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/resource", "client/src/GameLink", "shared/PetRules", "client/src/hall/shared/CutStyleProgressBar", "client/src/SoundManager", "client/src/hall/shared/BitmapText"], function (require, exports, HallUI_24, ImageButton_13, res, GameLink_13, PetRules, CutStyleProgressBar_5, SoundManager_3, BitmapText_4) {
    "use strict";
    var ShopUI = (function () {
        function ShopUI() {
            var _this = this;
            this.spr = new createjs.Container();
            this.spr.visible = false;
            //mask
            {
                var shape = new createjs.Shape();
                var g = shape.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
                shape.addEventListener('mousedown', function () { });
                this.spr.addChild(shape);
            }
            //bg
            {
                var bg = new createjs.Bitmap(HallUI_24.HallUI.getImage('hall/pet_shop_background'));
                bg.x = 20;
                bg.y = 180;
                this.spr.addChild(bg);
            }
            //gift bg
            {
                var bg = new createjs.Bitmap(HallUI_24.HallUI.getImage('hall/pet_shop_gift_icon'));
                bg.x = (res.GraphicConstant.SCREEN_WIDTH - bg.image.width) / 2;
                bg.y = 356;
                this.spr.addChild(bg);
                this._giftIcon = bg;
            }
            //button
            {
                var button = new ImageButton_13.ImageButton(HallUI_24.HallUI.getImage('hall/pet_shop_buy_button'));
                //button.addIcon(HallUI.getImage('hall/button_text_buy'));
                button.x = res.GraphicConstant.SCREEN_WIDTH / 2;
                button.y = 751;
                this.spr.addChild(button);
                this._buyButton = button;
                button.onClick = function () { return _this._onClickBuy(); };
            }
            //field bg
            {
                var field_bg = new createjs.Bitmap(HallUI_24.HallUI.getImage('hall/heart_text_bg'));
                field_bg.x = 268;
                field_bg.y = 642;
            }
            //$ icon
            {
                var icon = new createjs.Bitmap(HallUI_24.HallUI.getImage('hall/weekly_task_prize1'));
                icon.x = 268;
                icon.y = 646;
            }
            //price text
            {
                //let text = new createjs.Text('30000', '24px SimHei', 'white');
                //text.x = 314;
                //text.y = 656;
                //this.spr.addChild(text);
                //this._priceText = text;
                var text = new BitmapText_4.BitmapText(BitmapText_4.BitmapText.buildCharDefines('0123456789', HallUI_24.HallUI.getImage('hall/pet_shop_price_chars'), 17, 24));
                text.align = 'center';
                text.set({ x: 50, y: -16 });
                this._buyButton.addDisplayObject(text);
                this._priceText = text;
            }
            //close button
            {
                var btnClose = new ImageButton_13.ImageButton(HallUI_24.HallUI.getImage('hall/return_button'));
                btnClose.set({ x: res.GraphicConstant.SCREEN_WIDTH / 2, y: 1005 });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    _this.show(false);
                };
            }
        }
        ShopUI.prototype.setIsFree = function (isFree) {
            if (isFree) {
                this._priceText.text = '0';
            }
            else {
                this._priceText.text = '10000';
            }
        };
        ShopUI.prototype.showBuyGiftAnimation = function (obj) {
            var petid = obj.id;
            var isNewPet = false;
            var isShowPetExp = false;
            var petExp1 = 1.2;
            var petExp2 = 2.4;
            if (obj['new']) {
                isNewPet = true;
            }
            if (typeof obj.skillExp1 === 'number' && typeof obj.skillExp2 === 'number') {
                isShowPetExp = true;
                petExp1 = obj.skillExp1;
                petExp2 = obj.skillExp2;
            }
            var center = { x: 640 / 2, y: 400 };
            var anim_container = new createjs.Container();
            this.spr.addChild(anim_container);
            var mask = new createjs.Shape();
            {
                var g = mask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
            }
            anim_container.addChild(mask);
            //一直在抖啊抖的礼物盒子
            var box = new createjs.Bitmap(HallUI_24.HallUI.getImage('hall/pet_shop_gift_icon'));
            box.regX = box.image.width / 2;
            box.regY = box.image.height / 2;
            box.x = center.x;
            box.y = center.y;
            anim_container.addChild(box);
            //一直在缩放的“点击”字
            var shake_text = new createjs.Bitmap(HallUI_24.HallUI.getImage('hall/click_gift_text'));
            shake_text.regX = shake_text.image.width / 2;
            shake_text.regY = shake_text.image.height / 2;
            shake_text.x = 320;
            shake_text.y = 570;
            anim_container.addChild(shake_text);
            var shake_anim = createjs.Tween.get(box, { loop: true }).to({ y: center.y - 60 }, 200).to({ y: center.y }, 800, createjs.Ease.elasticOut).wait(3000);
            var text_scale_anim = createjs.Tween.get(shake_text, { loop: true }).to({ scaleX: 1.1, scaleY: 1.1 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);
            var spr = this.spr;
            var clickPhase = 0;
            function onClick() {
                //if (clicked) { onEnd(); return; }
                if (clickPhase === 0) {
                    clickPhase = 1;
                    shake_anim.setPaused(true);
                    text_scale_anim.setPaused(true);
                    //图标
                    var icon = new createjs.Bitmap(HallUI_24.HallUI.instance.getPetImage(petid));
                    icon.x = box.x;
                    icon.y = box.y;
                    icon.regX = icon.image.width / 2;
                    icon.regY = icon.image.height / 2;
                    icon.scaleX = 0;
                    icon.scaleY = 0;
                    anim_container.addChild(icon);
                    //宠物名字
                    var pet_name_text_1 = new createjs.Text(PetRules.PET_NAMES[petid], '33px SimHei', 'white');
                    pet_name_text_1.textAlign = 'center';
                    pet_name_text_1.x = 320;
                    pet_name_text_1.y = 500;
                    pet_name_text_1.visible = false;
                    anim_container.addChild(pet_name_text_1);
                    shake_text.visible = false;
                    //显示icon
                    SoundManager_3.SoundManager.playEffect('openPet');
                    var show_icon_anim_1 = createjs.Tween.get(icon, { paused: true })
                        .to({ scaleX: 2, scaleY: 2 }, 200)
                        .call(function () {
                        pet_name_text_1.visible = true;
                        //new 
                        if (isNewPet) {
                            var newicon = new createjs.Bitmap(HallUI_24.HallUI.getImage('hall/new_text_tip'));
                            newicon.set({ x: 373, y: 441 });
                            anim_container.addChild(newicon);
                        }
                        if (isShowPetExp) {
                            var tt = showLevelUpProgress(petExp1, petExp2);
                            tt.call(function () { clickPhase = 2; });
                        }
                        else {
                            clickPhase = 2;
                        }
                    })
                        .wait(5000)
                        .call(onEnd);
                    //消失盒子
                    createjs.Tween.get(box).to({ scaleX: 0, scaleY: 0 }, 200).call(function () { show_icon_anim_1.setPaused(false); });
                }
                else if (clickPhase === 2) {
                    clickPhase = 3;
                    onEnd();
                }
            }
            anim_container.addEventListener('mousedown', onClick);
            function onEnd() {
                spr.removeChild(anim_container);
            }
            function showLevelUpProgress(s1, s2) {
                var spr = anim_container;
                var text = new createjs.Text('技能等级', '31px SimHei', '#eebe00');
                text.set({ x: 120, y: 576 });
                spr.addChild(text);
                //progress bg
                //let pro_bg = new createjs.Bitmap(HallUI.getImage('pet/levelup_progress_background'));
                //pro_bg.set({ x: 265, y: 580 });
                //anim_container.addChild(pro_bg);
                var progressBg = new createjs.Bitmap(HallUI_24.HallUI.getImage('hall/pet_progress_small_bg'));
                progressBg.set({ x: 280, y: 582 });
                spr.addChild(progressBg);
                var progressBar = new CutStyleProgressBar_5.CutStyleProgressBar(HallUI_24.HallUI.getImage('hall/pet_progress_small'));
                progressBar.set({ x: progressBg.x + 3, y: progressBg.y + 2 });
                progressBar.percent = 0;
                spr.addChild(progressBar);
                var animObj = {};
                animObj._value = s1;
                Object.defineProperty(animObj, 'value', {
                    get: function () {
                        return this._value;
                    },
                    set: function (value) {
                        if ((this._value | 0) !== (value | 0)) {
                            showLevelUpText();
                        }
                        if (value === null)
                            return;
                        this._value = value;
                        progressBar.percent = value - (value | 0);
                    }
                });
                animObj.value = s1;
                var tween = createjs.Tween.get(animObj).to({ value: s2 }, 1000);
                return tween;
            }
            function showLevelUpText() {
                var x0 = 371, x1 = 294;
                var image = HallUI_24.HallUI.getImage('pet/levelup_text');
                var text = new createjs.Bitmap(image);
                text.set({
                    regX: image.width / 2,
                    regY: image.height / 2
                });
                text.set({ x: x0 + text.regX, y: 594 });
                text.alpha = 0;
                createjs.Tween.get(text)
                    .to({
                    x: x1 + text.regX, alpha: 1
                }, 300, createjs.Ease.cubicOut)
                    .wait(300)
                    .to({
                    alpha: 0,
                    scaleY: 0
                }, 100)
                    .call(function () {
                    anim_container.removeChild(text);
                });
                anim_container.addChild(text);
            }
        };
        ShopUI.prototype.show = function (bShow) {
            if (!this.spr.visible && bShow) {
                this._giftIcon.visible = true;
                if (this._lastIcon) {
                    this.spr.removeChild(this._lastIcon);
                    this._lastIcon = null;
                }
            }
            this.spr.visible = bShow;
        };
        ShopUI.prototype._onClickBuy = function () {
            GameLink_13.GameLink.instance.sendBuyGift(0);
        };
        return ShopUI;
    }());
    exports.ShopUI = ShopUI;
});
define("client/src/hall/HallTutorial", ["require", "exports", "client/src/hall/HallUI", "client/src/resource"], function (require, exports, HallUI_25, res) {
    "use strict";
    var GC = res.GraphicConstant;
    var define = [
        { x: 110, y: 738, text: '冒险界面可以领取任\n务从而获得大量奖励。\n点击右边的果冻可以\n选择携带的果冻。' },
        { x: 110, y: 738, text: '引导结束，由于您出\n色完成了引导，赠送\n您10颗爱心。前往冒\n险界面开始您的冒险\n吧！' },
    ];
    var HallTutorial = (function () {
        function HallTutorial(hasGift) {
            var _this = this;
            this.spr = new createjs.Container();
            this.stepIndex = 0;
            this.hasGift = hasGift;
            this.spr.addEventListener('click', function () { _this.onClick(); });
            var maskCanvas = document.createElement('canvas');
            maskCanvas.width = GC.SCREEN_WIDTH;
            maskCanvas.height = GC.SCREEN_HEIGHT;
            var ctx = maskCanvas.getContext('2d');
            ctx.fillStyle = "rgba(0,0,0,0.01)";
            ctx.fillRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath();
            ctx.rect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
            //draw rect
            var x, y, width, height;
            x = 57;
            y = 845;
            width = 101;
            height = 92;
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.arc(x + width, y + height / 2, height / 2, -Math.PI / 2, Math.PI / 2);
            ctx.lineTo(x, y + height);
            ctx.arc(x, y + height / 2, height / 2, Math.PI / 2, -Math.PI / 2);
            ctx.closePath();
            x = 488;
            y = 845;
            width = 101;
            height = 92;
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.arc(x + width, y + height / 2, height / 2, -Math.PI / 2, Math.PI / 2);
            ctx.lineTo(x, y + height);
            ctx.arc(x, y + height / 2, height / 2, Math.PI / 2, -Math.PI / 2);
            ctx.closePath();
            x = 263;
            y = 835;
            width = 118;
            height = 111;
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.arc(x + width, y + height / 2, height / 2, -Math.PI / 2, Math.PI / 2);
            ctx.lineTo(x, y + height);
            ctx.arc(x, y + height / 2, height / 2, Math.PI / 2, -Math.PI / 2);
            ctx.closePath();
            ctx.fill('evenodd');
            this.spr.addChild(new createjs.Bitmap(maskCanvas));
            this._showPet();
        }
        HallTutorial.prototype.onClick = function () {
            if (this.stepIndex == 0) {
                this.stepIndex = 1;
                this._showPet();
            }
            else if (this.stepIndex == 1) {
                if (this.hasGift) {
                    this._playHeartAnimation();
                }
                this._remove();
            }
        };
        HallTutorial.prototype._showPet = function () {
            var d = define[this.stepIndex];
            this._setPet(d.x, d.y, d.text);
        };
        //设置宠物说话。
        HallTutorial.prototype._setPet = function (x, y, text) {
            if (!this.petIcon) {
                this.petIcon = new createjs.Bitmap(HallUI_25.HallUI.getImage('tutorial/pet'));
                this.petIcon.regX = this.petIcon.image.width / 2;
                this.petIcon.regY = this.petIcon.image.height / 2;
                this.petTextFrame = new createjs.Bitmap(HallUI_25.HallUI.getImage('tutorial/frame'));
                this.petText = new createjs.Text('', '22px SimHei', 'white');
                this.petText.lineHeight = 22;
                this.spr.addChild(this.petIcon);
                this.spr.addChild(this.petTextFrame);
                this.spr.addChild(this.petText);
            }
            this.petIcon.x = x;
            this.petIcon.y = y;
            this.petTextFrame.x = x + 25;
            this.petTextFrame.y = y - 180;
            this.petText.x = x + 30;
            this.petText.y = y - 176;
            this.petText.text = text;
            this.petIcon.visible = true;
            this.petText.visible = true;
            this.petTextFrame.visible = true;
        };
        HallTutorial.prototype._remove = function () {
            if (this.spr.parent) {
                this.spr.parent.removeChild(this.spr);
            }
        };
        HallTutorial.prototype._playHeartAnimation = function () {
            var spr = HallUI_25.HallUI.instance.spr;
            var image = HallUI_25.HallUI.getImage('hall/weekly_task_prize2');
            var to = { x: 446, y: 144 };
            var from = { x: 337, y: 707 };
            var _loop_2 = function(i) {
                var bitmap = new createjs.Bitmap(image);
                bitmap.regX = image.width / 2;
                bitmap.regY = image.height / 2;
                bitmap.set(from);
                spr.addChild(bitmap);
                createjs.Tween.get(bitmap).wait(i * 60).to(to, 600, createjs.Ease.cubicInOut).call(function (x) {
                    bitmap.parent.removeChild(bitmap);
                });
            };
            for (var i = 0; i < 10; ++i) {
                _loop_2(i);
            }
        };
        return HallTutorial;
    }());
    exports.HallTutorial = HallTutorial;
});
define("client/src/hall/payment/BuyCoinEntry", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/util", "client/src/GameLink"], function (require, exports, HallUI_26, ImageButton_14, util, GameLink_14) {
    "use strict";
    var BuyCoinEntry = (function () {
        function BuyCoinEntry() {
            var _this = this;
            this.spr = new createjs.Container();
            this.width = 0;
            this.height = 0;
            this.obj = null;
            var background = new createjs.Bitmap(HallUI_26.HallUI.getImage('hall/mail/bkg'));
            this.width = background.image.width;
            this.height = background.image.height;
            this.spr.addChild(background);
            //coin icon
            var coin = new createjs.Bitmap(HallUI_26.HallUI.getImage('hall/new_weekly_task_prize0'));
            coin.set({ x: 24, y: 27 });
            this.spr.addChild(coin);
            //amount text
            this._amountText = new createjs.Text('x198,564', '24px SimHei', '#142d3e');
            this._amountText.set({ x: 75, y: 58 });
            /*{
                let text = this._amountText;
                let outline = text.clone();
                outline.outline = 3;
                outline.color = 'white';
                Object.defineProperty(outline, 'text', { get: () => text.text });
                this.spr.addChild(outline);
            }*/
            this.spr.addChild(this._amountText);
            //price bg
            var price_bg = new createjs.Bitmap(HallUI_26.HallUI.getImage('hall/game_item_price_background'));
            price_bg.set({ x: 216, y: 42 });
            this.spr.addChild(price_bg);
            //price text
            this._priceText = new createjs.Text('900', '24px SimHei', 'white');
            this._priceText.set({ x: 282, y: 51 });
            this._priceText.textAlign = 'center';
            this.spr.addChild(this._priceText);
            //price icon (diamond)
            var diamond = new createjs.Bitmap(HallUI_26.HallUI.getImage('hall/new_weekly_task_prize1'));
            diamond.set({ x: 215, y: 41 });
            this.spr.addChild(diamond);
            /*this._promoteBitmap = new createjs.Bitmap(HallUI.getImage('hall/payment/promote_yellow_bg'));
            this._promoteBitmap.set({
                regX: this._promoteBitmap.image.width / 2,
                regY: this._promoteBitmap.image.height / 2,
                x: 89 + 100,
                y: 6
            });
            this.spr.addChild(this._promoteBitmap);*/
            this._promoteBitmap2 = new createjs.Bitmap(HallUI_26.HallUI.getImage('hall/payment/promote_20%'));
            this._promoteBitmap2.set({
                //regX: this._promoteBitmap2.image.width / 2,
                //regY: this._promoteBitmap2.image.height / 2,
                x: 325,
                y: 52
            });
            this.spr.addChild(this._promoteBitmap2);
            //button
            var button = new ImageButton_14.ImageButton(util.scaleImage(HallUI_26.HallUI.getImage('hall/payment/buy_button'), 0.8));
            button.set({ x: 440, y: 60 });
            button.onClick = function () { return _this.onClick(); };
            this.spr.addChild(button);
        }
        BuyCoinEntry.prototype.setContent = function (obj) {
            this.obj = obj;
            this._amountText.text = 'X' + util.intToString(obj.coin);
            this._priceText.text = util.intToString(obj.diamond);
            this._promoteBitmap2.visible = false;
            //this._promoteBitmap.visible = false;
            if (obj.promote) {
                var image = HallUI_26.HallUI.getImage('hall/payment/promote_' + obj.promote);
                if (image) {
                    this._promoteBitmap2.set({
                        image: image,
                    });
                    this._promoteBitmap2.visible = true;
                }
            }
        };
        BuyCoinEntry.prototype.onClick = function () {
            if (this.obj && typeof this.obj.id === 'string') {
                GameLink_14.GameLink.instance.sendBuyCoin(this.obj.id);
            }
        };
        return BuyCoinEntry;
    }());
    exports.BuyCoinEntry = BuyCoinEntry;
});
define("client/src/hall/payment/BuyDiamondEntry", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/util", "client/src/GameLink"], function (require, exports, HallUI_27, ImageButton_15, util, GameLink_15) {
    "use strict";
    var BuyDiamondEntry = (function () {
        function BuyDiamondEntry() {
            var _this = this;
            this.spr = new createjs.Container();
            this.width = 0;
            this.height = 0;
            this.obj = null;
            var background = new createjs.Bitmap(HallUI_27.HallUI.getImage('hall/mail/bkg'));
            this.width = background.image.width;
            this.height = background.image.height;
            this.spr.addChild(background);
            //diamond icon
            var diamond = new createjs.Bitmap(HallUI_27.HallUI.getImage('hall/weekly_task_prize0'));
            diamond.set({ x: 24, y: 27 });
            this.spr.addChild(diamond);
            //amount text
            this._amountText = new createjs.Text('x198,564', '24px SimHei', '#142d3e');
            this._amountText.set({ x: 75, y: 58 });
            /*{
                let text = this._amountText;
                let outline = text.clone();
                outline.outline = 3;
                outline.color = 'white';
                Object.defineProperty(outline, 'text', { get: () => text.text });
                this.spr.addChild(outline);
            }*/
            this.spr.addChild(this._amountText);
            //price bg
            var price_bg = new createjs.Bitmap(HallUI_27.HallUI.getImage('hall/game_item_price_background'));
            price_bg.set({ x: 216, y: 42 });
            this.spr.addChild(price_bg);
            //price text
            this._priceText = new createjs.Text('900', '25px SimHei', 'white');
            this._priceText.set({ x: 282, y: 51 });
            this._priceText.textAlign = 'center';
            this.spr.addChild(this._priceText);
            /*this._promoteBitmap = new createjs.Bitmap(HallUI.getImage('hall/payment/promote_red_bg'));
            this._promoteBitmap.set({
                //regX: this._promoteBitmap.image.width / 2,
                //regY: this._promoteBitmap.image.height / 2,
                x: 89 + 100,
                y: 6
            });
            this.spr.addChild(this._promoteBitmap);*/
            this._promoteBitmap2 = new createjs.Bitmap(HallUI_27.HallUI.getImage('hall/payment/promote_20%'));
            this._promoteBitmap2.set({
                //regX: this._promoteBitmap2.image.width / 2,
                //regY: this._promoteBitmap2.image.height / 2,
                x: 325,
                y: 52
            });
            this.spr.addChild(this._promoteBitmap2);
            //button
            var button = new ImageButton_15.ImageButton(util.scaleImage(HallUI_27.HallUI.getImage('hall/payment/buy_button'), 0.8));
            button.set({ x: 440, y: 60 });
            button.onClick = function () { return _this.onClick(); };
            this.spr.addChild(button);
            //once tag
            var oncetag = new createjs.Bitmap(HallUI_27.HallUI.getImage('hall/payment/promote_once'));
            oncetag.set({ x: 386, y: -13 });
            this.spr.addChild(oncetag);
            oncetag.visible = false;
            this._onceTag = oncetag;
        }
        BuyDiamondEntry.prototype.setContent = function (obj) {
            this.obj = obj;
            this._amountText.text = 'x' + util.intToString(obj.diamond);
            this._priceText.text = '￥' + util.intToString(obj.cash) + '.00';
            this._promoteBitmap2.visible = false;
            //this._promoteBitmap.visible = false;
            if (obj.promote) {
                var image = HallUI_27.HallUI.getImage('hall/payment/promote_' + obj.promote);
                if (image) {
                    this._promoteBitmap2.set({
                        image: image,
                    });
                    this._promoteBitmap2.visible = true;
                }
            }
            this._onceTag.visible = !!obj.onlyonce;
        };
        BuyDiamondEntry.prototype.onClick = function () {
            if (this.obj && typeof this.obj.id === 'string') {
                GameLink_15.GameLink.instance.sendBuyDiamond(this.obj.id);
            }
        };
        return BuyDiamondEntry;
    }());
    exports.BuyDiamondEntry = BuyDiamondEntry;
});
define("client/src/hall/payment/BuyHeartEntry", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/util", "client/src/GameLink"], function (require, exports, HallUI_28, ImageButton_16, util, GameLink_16) {
    "use strict";
    var BuyHeartEntry = (function () {
        function BuyHeartEntry() {
            var _this = this;
            this.spr = new createjs.Container();
            this.width = 0;
            this.height = 0;
            this.obj = null;
            var background = new createjs.Bitmap(HallUI_28.HallUI.getImage('hall/mail/bkg'));
            this.width = background.image.width;
            this.height = background.image.height;
            this.spr.addChild(background);
            //heart icon
            var heart = new createjs.Bitmap(HallUI_28.HallUI.getImage('hall/full_heart'));
            heart.set({ x: 24, y: 27 });
            this.spr.addChild(heart);
            //amount text
            this._amountText = new createjs.Text('x198,564', '24px SimHei', '#142d3e');
            this._amountText.set({ x: 75, y: 58 });
            /*{
                let text = this._amountText;
                let outline = text.clone();
                outline.outline = 3;
                outline.color = 'white';
                Object.defineProperty(outline, 'text', { get: () => text.text });
                this.spr.addChild(outline);
            }*/
            this.spr.addChild(this._amountText);
            //price bg
            var price_bg = new createjs.Bitmap(HallUI_28.HallUI.getImage('hall/game_item_price_background'));
            price_bg.set({ x: 216, y: 42 });
            this.spr.addChild(price_bg);
            //price text
            this._priceText = new createjs.Text('900', '25px SimHei', 'white');
            this._priceText.set({ x: 282, y: 51 });
            this._priceText.textAlign = 'center';
            this.spr.addChild(this._priceText);
            //price icon (diamond)
            var diamond = new createjs.Bitmap(HallUI_28.HallUI.getImage('hall/new_weekly_task_prize1'));
            diamond.set({ x: 215, y: 41 });
            this.spr.addChild(diamond);
            /*this._promoteBitmap = new createjs.Bitmap(HallUI.getImage('hall/payment/promote_yellow_bg'));
            this._promoteBitmap.set({
                regX: this._promoteBitmap.image.width / 2,
                regY: this._promoteBitmap.image.height / 2,
                x: 89 + 100,
                y: 6
            });
            this.spr.addChild(this._promoteBitmap);*/
            this._promoteBitmap2 = new createjs.Bitmap(HallUI_28.HallUI.getImage('hall/payment/promote_20%'));
            this._promoteBitmap2.set({
                //regX: this._promoteBitmap2.image.width / 2,
                //regY: this._promoteBitmap2.image.height / 2,
                x: 325,
                y: 52
            });
            this.spr.addChild(this._promoteBitmap2);
            //button
            var button = new ImageButton_16.ImageButton(util.scaleImage(HallUI_28.HallUI.getImage('hall/payment/buy_button'), 0.8));
            button.set({ x: 440, y: 60 });
            button.onClick = function () { return _this.onClick(); };
            this.spr.addChild(button);
        }
        BuyHeartEntry.prototype.setContent = function (obj) {
            this.obj = obj;
            this._amountText.text = 'x' + util.intToString(obj.heart);
            this._priceText.text = util.intToString(obj.diamond);
            this._promoteBitmap2.visible = false;
            //this._promoteBitmap.visible = false;
            if (obj.promote) {
                var image = HallUI_28.HallUI.getImage('hall/payment/promote_' + obj.promote);
                if (image) {
                    this._promoteBitmap2.set({
                        image: image,
                    });
                    this._promoteBitmap2.visible = true;
                }
            }
            if (/_double$/.exec(obj.id)) {
                if (!this._tempPromotion) {
                    this._tempPromotion = new createjs.Bitmap(HallUI_28.HallUI.getImage('hall/limit_sale_text_tip'));
                    this._tempPromotion.set({ regX: this._tempPromotion.image.width / 2, regY: this._tempPromotion.image.height / 2 });
                    this._tempPromotion.set({ x: 100, y: 25 });
                    this.spr.addChild(this._tempPromotion);
                    this._tempPromotionAnimation = createjs.Tween.get(this._tempPromotion, { loop: true }).to({ scaleX: 0.8, scaleY: 0.8 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);
                }
                this._tempPromotion.visible = true;
            }
            else {
                if (this._tempPromotion) {
                    this._tempPromotion.visible = false;
                }
            }
        };
        BuyHeartEntry.prototype.onClick = function () {
            if (this.obj && typeof this.obj.id === 'string') {
                GameLink_16.GameLink.instance.sendBuyHeart(this.obj.id);
            }
        };
        BuyHeartEntry.prototype.clear = function () {
            if (this._tempPromotionAnimation) {
                this._tempPromotionAnimation.setPaused(true);
            }
        };
        return BuyHeartEntry;
    }());
    exports.BuyHeartEntry = BuyHeartEntry;
});
define("shared/PaymentDefine", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.BUY_COIN_DEFINE = [
        { id: 'coin6000', coin: 6000, diamond: 10, promote: '' },
        { id: 'coin39600', coin: 39600, diamond: 60, promote: '10%' },
        { id: 'coin86400', coin: 86400, diamond: 120, promote: '20%' },
        { id: 'coin195000', coin: 195000, diamond: 250, promote: '30%' },
    ];
    exports.BUY_HEART_DEFINE = [
        { id: 'heart5_double', heart: 10, diamond: 5, promote: '' },
        { id: 'heart20_double', heart: 40, diamond: 15, promote: '30%' },
        { id: 'heart50_double', heart: 100, diamond: 40, promote: '60%' },
    ];
    exports.BUY_DIAMOND_DEFINE = [
        { id: 'diamond6000', diamond: 30, cash: 6, promote: '200%', onlyonce: true },
        { id: 'diamond6001', diamond: 10, cash: 6, promote: '' },
        { id: 'diamond39600', diamond: 72, cash: 40, promote: '8%' },
        { id: 'diamond86400', diamond: 330, cash: 158, promote: '25%' },
        { id: 'diamond23300', diamond: 505, cash: 233, promote: '30%' },
        { id: 'diamond34800', diamond: 860, cash: 348, promote: '48%' },
    ];
});
define("client/src/hall/payment/PaymentPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton", "client/src/hall/shared/VerticalScrollPanel", "client/src/hall/payment/BuyCoinEntry", "client/src/hall/payment/BuyDiamondEntry", "client/src/hall/payment/BuyHeartEntry", "shared/PaymentDefine", "client/src/GameLink"], function (require, exports, HallUI_29, resource_7, ImageButton_17, VerticalScrollPanel_4, BuyCoinEntry_1, BuyDiamondEntry_1, BuyHeartEntry_1, PD, GameLink_17) {
    "use strict";
    var PaymentPanel = (function () {
        function PaymentPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            var ADD_TO_Y = 110;
            //black mask
            {
                var bgMask = new createjs.Shape();
                var g = bgMask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_7.GraphicConstant.SCREEN_WIDTH, resource_7.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
                this.spr.addChild(bgMask);
                bgMask.addEventListener('mousedown', function () { });
            }
            //background
            {
                var bg = new createjs.Bitmap(HallUI_29.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 35, y: 89 + ADD_TO_Y });
                this.spr.addChild(bg);
            }
            //title text
            {
                var title = new createjs.Bitmap(HallUI_29.HallUI.getImage('hall/mail/title'));
                title.set({ x: 640 / 2, y: 215 + ADD_TO_Y });
                this.spr.addChild(title);
                this._titleBitmap = title;
            }
            var extra_height = 0;
            var panel = this._listPanel = new VerticalScrollPanel_4.VerticalScrollPanel();
            panel.setVisualizeMask(false);
            panel.setPos({ x: 49, y: 246 - extra_height + ADD_TO_Y });
            panel.setSize(539, 446 + extra_height);
            this.spr.addChild(panel.spr);
            //close button
            {
                var btnClose = new ImageButton_17.ImageButton(HallUI_29.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: resource_7.GraphicConstant.SCREEN_WIDTH / 2, y: 885 + ADD_TO_Y });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    _this.hide();
                };
            }
            this.spr.visible = false;
        }
        PaymentPanel.prototype._setItemPanels = function (items) {
            if (this._items) {
                for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
                    var item = _a[_i];
                    if (typeof item['clear'] === 'function') {
                        item['clear']();
                    }
                    this._listPanel.removeChild(item.spr);
                }
            }
            this._listPanel.position = 0;
            this._listPanel.contentHeight = 0;
            this._items = items;
            if (items.length > 0) {
                //const HEIGHT = 112;
                var SPAN = 6;
                var x = 13;
                var y = SPAN;
                for (var i = 0; i < items.length; ++i) {
                    this._listPanel.addChild(items[i].spr);
                    items[i].spr.set({ x: x, y: y });
                    y += items[i].height + SPAN;
                }
                this._listPanel.contentHeight = y;
            }
        };
        PaymentPanel.prototype.showAsBuyCoin = function () {
            this._currentType = 'BuyCoin';
            var image = this._titleBitmap.image = HallUI_29.HallUI.getImage('hall/payment/buy_coin_title');
            this._titleBitmap.set({
                regX: image.width / 2,
                regY: image.height / 2
            });
            var arr = [];
            for (var _i = 0, _a = PD.BUY_COIN_DEFINE; _i < _a.length; _i++) {
                var d = _a[_i];
                var entry = new BuyCoinEntry_1.BuyCoinEntry();
                entry.setContent(d);
                arr.push(entry);
            }
            this._setItemPanels(arr);
            this.spr.visible = true;
        };
        PaymentPanel.prototype.showAsBuyDiamond = function () {
            this._moveUp();
            this._currentType = 'BuyDiamond';
            var image = this._titleBitmap.image = HallUI_29.HallUI.getImage('hall/payment/buy_diamond_title');
            this._titleBitmap.set({
                regX: image.width / 2,
                regY: image.height / 2
            });
            var arr = [];
            for (var _i = 0, _a = PD.BUY_DIAMOND_DEFINE; _i < _a.length; _i++) {
                var d = _a[_i];
                if (d.onlyonce) {
                    if (GameLink_17.GameLink.instance.boughtItems && GameLink_17.GameLink.instance.boughtItems.indexOf(d.id) >= 0) {
                        continue;
                    }
                }
                var entry = new BuyDiamondEntry_1.BuyDiamondEntry();
                entry.setContent(d);
                arr.push(entry);
            }
            this._setItemPanels(arr);
            this.spr.visible = true;
        };
        PaymentPanel.prototype.showAsBuyHeart = function () {
            this._currentType = 'BuyHeart';
            var image = this._titleBitmap.image = HallUI_29.HallUI.getImage('hall/payment/buy_heart_title');
            this._titleBitmap.set({
                regX: image.width / 2,
                regY: image.height / 2
            });
            var arr = [];
            for (var _i = 0, _a = PD.BUY_HEART_DEFINE; _i < _a.length; _i++) {
                var d = _a[_i];
                var entry = new BuyHeartEntry_1.BuyHeartEntry();
                entry.setContent(d);
                arr.push(entry);
            }
            this._setItemPanels(arr);
            this.spr.visible = true;
        };
        PaymentPanel.prototype._moveUp = function () {
            if (this.spr.parent) {
                var idx = this.spr.parent.numChildren - 1;
                this.spr.parent.setChildIndex(this.spr, idx);
            }
        };
        PaymentPanel.prototype.hide = function () {
            this.spr.visible = false;
        };
        PaymentPanel.prototype.refresh = function () {
            if (this.spr.visible) {
                if (typeof this['showAs' + this._currentType] === 'function') {
                    this['showAs' + this._currentType]();
                }
            }
        };
        return PaymentPanel;
    }());
    exports.PaymentPanel = PaymentPanel;
});
define("client/src/hall/payment/PaymentMask", ["require", "exports", "client/src/resource"], function (require, exports, resource_8) {
    "use strict";
    var PaymentMask = (function () {
        function PaymentMask() {
            this.spr = new createjs.Container();
            var bgMask = new createjs.Shape();
            var g = bgMask.graphics;
            g.beginFill('rgba(0,0,0,0.8)');
            g.drawRect(0, 0, resource_8.GraphicConstant.SCREEN_WIDTH, resource_8.GraphicConstant.SCREEN_HEIGHT);
            g.endFill();
            this.spr.addChild(bgMask);
            bgMask.addEventListener('mousedown', function () { });
            var text = new createjs.Text('请稍等...', '60px SimHei', 'white');
            text.x = 320;
            text.y = 480;
            text.textAlign = 'center';
            this.spr.addChild(text);
            this.spr.visible = false;
        }
        return PaymentMask;
    }());
    exports.PaymentMask = PaymentMask;
});
define("client/src/hall/search/SearchResultPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/hall/shared/VerticalScrollPanel", "client/src/FixSizeBitmap", "client/src/ImageButton", "client/src/GameLink"], function (require, exports, HallUI_30, VerticalScrollPanel_5, FixSizeBitmap_2, ImageButton_18, GameLink_18) {
    "use strict";
    var ADD_TO_Y = 120;
    var SearchResultPanel = (function () {
        function SearchResultPanel() {
            this.spr = new createjs.Container();
            this._items = [];
            {
                var bg = new createjs.Bitmap(HallUI_30.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 43, y: 89 + ADD_TO_Y });
                this.spr.addChild(bg);
            }
            //title text
            {
                var title = new createjs.Bitmap(HallUI_30.HallUI.getImage('hall/search_friend_title_text'));
                title.set({ x: 250, y: 186 + ADD_TO_Y });
                this.spr.addChild(title);
            }
            {
                this._scrollPane = new VerticalScrollPanel_5.VerticalScrollPanel();
                this._scrollPane.setPos({ x: 56, y: 244 + ADD_TO_Y });
                this._scrollPane.setSize(538, 454);
                //this._scrollPane.setVisualizeMask(true);
                this.spr.addChild(this._scrollPane.spr);
            }
            this._searchResultText = new createjs.Text('正在搜索中...', '32px SimHei', '#ff277e');
            this._searchResultText.set({ x: 320, y: 731 + ADD_TO_Y });
            this._searchResultText.textAlign = 'center';
            this.spr.addChild(this._searchResultText);
            /*
            this.setFriends([
                {nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
                {nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
                {nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
                {nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
                {nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
                {nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
                {nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
                {nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
                {nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
            ]);*/
        }
        SearchResultPanel.prototype.clear = function () {
            this._searchResultText.text = '正在搜索中...';
            for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
                var x = _a[_i];
                this._scrollPane.removeChild(x);
            }
            this._items.length = 0;
        };
        SearchResultPanel.prototype.setFriends = function (objs) {
            this.clear();
            this._searchResultText.text = "\u641C\u7D22\u5230" + objs.length + "\u4E2A\u597D\u53CB";
            var each_height = 76;
            var y = 0;
            for (var _i = 0, objs_1 = objs; _i < objs_1.length; _i++) {
                var obj = objs_1[_i];
                var item = this.createItem(obj);
                this._items.push(item);
                this._scrollPane.addChild(item);
                item.y = y;
                y += each_height;
            }
            this._scrollPane.contentHeight = y;
        };
        SearchResultPanel.prototype.show = function (bShow) {
            if (typeof bShow === 'undefined')
                bShow = true;
            this.spr.visible = bShow;
        };
        SearchResultPanel.prototype.isShowing = function () {
            return this.spr.visible;
        };
        SearchResultPanel.prototype.createItem = function (obj) {
            var _this = this;
            var icon = new createjs.Bitmap(null);
            icon.hitArea = new createjs.Shape();
            icon.set({ x: 33 + 30, y: 8 + 30 });
            FixSizeBitmap_2.MakeSuitableSize(icon, 60, 60, HallUI_30.HallUI.getImage('hall/default_user_headicon'));
            if (obj.faceurl) {
                var image = icon.image = new Image();
                image.src = obj.faceurl;
            }
            var name = new createjs.Text('', '30px SimHei', '#ff277e');
            name.set({ x: 109, y: 31 });
            name.text = obj.nickname;
            if (name.text.length > 9) {
                name.text = name.text.substr(0, 9) + '...';
            }
            var btn = new ImageButton_18.ImageButton(HallUI_30.HallUI.getImage('hall/add_friend_button'));
            btn.onClick = function () {
                if (obj.key) {
                    GameLink_18.GameLink.instance.sendReqAddFriend(obj.key);
                    _this.playAddFriendAnimation();
                }
                btn.visible = false;
            };
            btn.set({ x: 454, y: 38 });
            var spr = new createjs.Container();
            spr.addChild(icon);
            spr.addChild(name);
            spr.addChild(btn);
            spr.setBounds(0, 0, 300, 76);
            return spr;
        };
        SearchResultPanel.prototype.playAddFriendAnimation = function () {
            var text = new createjs.Text('好友申请已经发送', '42px SimHei', '#ff1469');
            text.textAlign = 'center';
            text.x = 320;
            text.y = 600;
            text.alpha = 1;
            HallUI_30.HallUI.instance.spr.addChild(text);
            createjs.Tween.get(text).to({ alpha: 0, y: 350 }, 1000).call(function () {
                if (text.parent)
                    text.parent.removeChild(text);
            });
        };
        return SearchResultPanel;
    }());
    exports.SearchResultPanel = SearchResultPanel;
});
define("client/src/hall/search/SearchFriendPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/resource", "main", "client/src/hall/search/SearchResultPanel", "client/src/GameLink", "client/src/ShareFunctions"], function (require, exports, HallUI_31, ImageButton_19, resource_9, main, SearchResultPanel_1, GameLink_19, share) {
    "use strict";
    var SearchFriendPanel = (function () {
        function SearchFriendPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            var mask = new createjs.Shape();
            {
                var g = mask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_9.GraphicConstant.SCREEN_WIDTH, resource_9.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
            }
            mask.addEventListener('mousedown', function () { });
            this.spr.addChild(mask);
            var background = new createjs.Bitmap(HallUI_31.HallUI.getImage('hall/dialog_bg'));
            background.set({ x: 45, y: 219 });
            this.spr.addChild(background);
            var title = new createjs.Bitmap(HallUI_31.HallUI.getImage('hall/search_friend_title_text'));
            title.set({ x: 239, y: 291 });
            this.spr.addChild(title);
            var search_text = new createjs.Text('搜索好友：', '30px SimHei', '#142d3e');
            search_text.set({ x: 73, y: 384 });
            this.spr.addChild(search_text);
            var search_btn = new ImageButton_19.ImageButton(HallUI_31.HallUI.getImage('hall/search_button'));
            search_btn.set({ x: 527, y: 400 });
            search_btn.onClick = function () { return _this._onClickSearch(); };
            this.spr.addChild(search_btn);
            var share_btn = new ImageButton_19.ImageButton(HallUI_31.HallUI.getImage('hall/share_button'));
            share_btn.set({ x: 527, y: 520 });
            share_btn.onClick = function () { return _this._onClickSearch(); };
            this.spr.addChild(share_btn);
            share_btn.onClick = function () {
                GameLink_19.GameLink.instance.sendTriggerEvent('SHARE_AWARD');
                share.share();
            };
            var share_text = new createjs.Text('通过分享链接进入游戏的玩家将\n自动与您建立好友关系', '29px SimHei', '#142d3e');
            share_text.lineHeight = 30;
            share_text.set({ x: 70, y: 469 });
            this.spr.addChild(share_text);
            //close button
            {
                var btnClose = new ImageButton_19.ImageButton(HallUI_31.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: resource_9.GraphicConstant.SCREEN_WIDTH / 2, y: 885 + 120 });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    if (_this._resultPanel.isShowing()) {
                        _this._resultPanel.show(false);
                        _this._inputField.style.display = 'block';
                    }
                    else {
                        _this.show(false);
                    }
                };
            }
            //create input field
            {
                var input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('style', 'border: 0;border-bottom: solid 2px white;background-color: rgba(0, 0, 0, 0);');
                input.style.position = 'absolute';
                document.getElementById('canvasWrapper').appendChild(input);
                this._inputField = input;
            }
            main.addResizeCallback(function (s) { return _this._onScale(s); });
            this.spr.visible = false;
            this._inputField.style.display = 'none';
            this._resultPanel = new SearchResultPanel_1.SearchResultPanel();
            this.spr.addChild(this._resultPanel.spr);
        }
        SearchFriendPanel.prototype._onClickSearch = function () {
            var name = $(this._inputField).val();
            name = name && name.toString().trim();
            if (!name)
                return;
            GameLink_19.GameLink.instance.sendSearchFriend(name);
            this._resultPanel.show();
            this._resultPanel.clear();
            this._inputField.style.display = 'none';
        };
        SearchFriendPanel.prototype._onScale = function (scale) {
            var px = function (x) { return (x * scale).toString() + 'px'; };
            var input = this._inputField;
            $(input).css({
                left: px(213),
                top: px(383),
                width: px(247),
                height: px(30),
                'font-size': px(24)
            });
        };
        SearchFriendPanel.prototype.show = function (bShow) {
            if (typeof bShow === 'undefined')
                bShow = true;
            var oldShow = this.spr.visible;
            this.spr.visible = bShow;
            this._inputField.style.display = bShow ? 'block' : 'none';
            if (!oldShow && bShow) {
                $(this._inputField).val("");
                this._resultPanel.show(false);
            }
        };
        SearchFriendPanel.prototype.setSearchResult = function (ret) {
            if (this._resultPanel.isShowing()) {
                this._resultPanel.setFriends(ret);
            }
        };
        return SearchFriendPanel;
    }());
    exports.SearchFriendPanel = SearchFriendPanel;
});
define("client/src/hall/game_item_help/GameItemHelpPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton"], function (require, exports, HallUI_32, resource_10, ImageButton_20) {
    "use strict";
    var GameItemHelpPanel = (function () {
        function GameItemHelpPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            //black mask
            {
                var bgMask = new createjs.Shape();
                var g = bgMask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_10.GraphicConstant.SCREEN_WIDTH, resource_10.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
                this.spr.addChild(bgMask);
                bgMask.addEventListener('mousedown', function () { });
            }
            //background
            {
                var bg = new createjs.Bitmap(HallUI_32.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 35, y: 89 });
                this.spr.addChild(bg);
            }
            {
                var bitmap = new createjs.Bitmap(HallUI_32.HallUI.getImage('hall/game_item_help_title'));
                bitmap.set({ x: 240, y: 198 });
                this.spr.addChild(bitmap);
            }
            //text
            {
                var bitmap = new createjs.Bitmap(HallUI_32.HallUI.getImage('hall/game_item_help_text'));
                bitmap.set({ x: 70, y: 261 });
                this.spr.addChild(bitmap);
            }
            //close button
            {
                var btnClose = new ImageButton_20.ImageButton(HallUI_32.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: resource_10.GraphicConstant.SCREEN_WIDTH / 2, y: 885 });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    if (_this.spr.parent) {
                        _this.spr.parent.removeChild(_this.spr);
                    }
                };
            }
        }
        return GameItemHelpPanel;
    }());
    exports.GameItemHelpPanel = GameItemHelpPanel;
});
define("client/src/hall/HallLoadUI", ["require", "exports"], function (require, exports) {
    "use strict";
    var HallLoadUI = (function () {
        //private _iconTween: createjs.Tween;
        function HallLoadUI() {
            this.spr = new createjs.Container();
            //this._background = new createjs.Shape();
            {
            }
            //this.spr.addChild(this._background);
            //text
            //let bitmap = new createjs.Bitmap('images/loading/未标题-2.png');
            //bitmap.set({ x: 70, y: 771 });
            //this.spr.addChild(bitmap);
            //text2
            this._percentText = new createjs.Text('(0%)', '33px SimHei', 'black');
            this._percentText.set({ x: 430, y: 755 });
            this.spr.addChild(this._percentText);
            //icon
            /*
            let icon = new createjs.Bitmap('images/loading/1.png');
            icon.set({ x: 256, y: 392, scaleX: 1.5, scaleY: 1.5 });
            this.spr.addChild(icon);
    
            let y0 = 392;
            let y1 = y0 - 20;
            this._iconTween = createjs.Tween.get(icon, { loop: true }).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(100).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(5000);
            */
        }
        HallLoadUI.prototype._onLoadProgress = function (n, total) {
            var pp = (n / total * 100) | 0;
            this._percentText.text = "(" + pp + "%)";
        };
        HallLoadUI.prototype._onLoadComplete = function () {
            //this._iconTween.setPaused(true);
        };
        HallLoadUI.prototype._onLoadError = function () {
            //this._iconTween.setPaused(true);
            alert('载入失败，请刷新页面');
            location.reload(true);
        };
        return HallLoadUI;
    }());
    exports.HallLoadUI = HallLoadUI;
});
define("client/src/hall/need_value_dialog/NeedValueDialog", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton"], function (require, exports, HallUI_33, resource_11, ImageButton_21) {
    "use strict";
    var NeedValueDialog = (function () {
        function NeedValueDialog(config) {
            var _this = this;
            this.spr = new createjs.Container();
            //black mask
            {
                var bgMask = new createjs.Shape();
                var g = bgMask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_11.GraphicConstant.SCREEN_WIDTH, resource_11.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
                this.spr.addChild(bgMask);
                bgMask.addEventListener('mousedown', function () { });
            }
            //background
            {
                var bg = new createjs.Bitmap(HallUI_33.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 35, y: 89 });
                this.spr.addChild(bg);
            }
            //title
            {
                var image = config.type === '+10s' ? HallUI_33.HallUI.getImage('hall/+10s_dialog_title') : HallUI_33.HallUI.getImage('hall/dialog_title');
                var bitmap = new createjs.Bitmap(image);
                bitmap.set({
                    x: 320, y: 210,
                    regX: image.width / 2, regY: image.height / 2
                });
                this.spr.addChild(bitmap);
            }
            //text
            {
                /*let image;
                let mmm = {
                    'coin': 'hall/want_more_coin',
                    'diamond': 'hall/want_more_diamond',
                    'heart': 'hall/want_more_heart',
                    '+10s': 'hall/want_10s'
                };*/
                var ttt = {
                    'coin': '没有足够的金币！',
                    'diamond': '没有足够的钻石！',
                    'heart': '没有足够的体力！',
                };
                var text = new createjs.Text(ttt[config.type], '30px SimHei', '#142d3e');
                text.set({ x: 320, y: 348, textAlign: 'center' });
                this.spr.addChild(text);
            }
            //value panel
            {
                if (config.type !== 'heart') {
                    //let bitmap = new createjs.Bitmap(HallUI.getImage(
                    //	(config.type === 'diamond' || config.type === '+10s') ? 'hall/NeedMoreValueDialog_item_diamond' : 'hall/NeedMoreValueDialog_item_coin'
                    //));
                    //bitmap.set({ x: 143, y: 408 });
                    //this.spr.addChild(bitmap);
                    var text1 = new createjs.Text('拥有：', '30px SimHei', '#142d3e');
                    text1.set({ x: 200, y: 424 });
                    this.spr.addChild(text1);
                    var text2 = new createjs.Text('需要：', '30px SimHei', '#142d3e');
                    text2.set({ x: 200, y: 495 });
                    this.spr.addChild(text2);
                    var hasText = new createjs.Text(config.hasValue + '', '23px SimHei', 'white');
                    hasText.set({
                        x: 346, y: 424,
                        textAlign: 'center'
                    });
                    this.spr.addChild(hasText);
                    var needText = new createjs.Text(config.needValue + '', '23px SimHei', 'white');
                    needText.set({
                        x: 346, y: 495,
                        textAlign: 'center'
                    });
                    this.spr.addChild(needText);
                }
            }
            {
                var needButton = new ImageButton_21.ImageButton(HallUI_33.HallUI.getImage('hall/payment/buy_button'));
                needButton.set({ x: 328, y: 622 });
                needButton.onClick = function () {
                    if (config.onOk)
                        config.onOk();
                    if (!config.noAutoClose)
                        _this.close();
                };
                this.spr.addChild(needButton);
            }
            {
                var btnClose = new ImageButton_21.ImageButton(HallUI_33.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: resource_11.GraphicConstant.SCREEN_WIDTH / 2, y: 885 });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    if (config.onCancel)
                        config.onCancel();
                    if (!config.noAutoClose)
                        _this.close();
                };
            }
        }
        NeedValueDialog.prototype.close = function () {
            if (this.spr.parent)
                this.spr.parent.removeChild(this.spr);
        };
        return NeedValueDialog;
    }());
    exports.NeedValueDialog = NeedValueDialog;
});
define("client/src/hall/gameover/HighScoreUpAnimation", ["require", "exports", "client/src/hall/HallUI", "client/src/game/GameUtil", "client/src/util", "client/src/ImageButton", "client/src/ShareFunctions"], function (require, exports, HallUI_34, GameUtil, util, ImageButton_22, share) {
    "use strict";
    var HighScoreUpAnimation = (function () {
        function HighScoreUpAnimation(obj) {
            var _this = this;
            this.spr = new createjs.Container();
            this._animEnd = false;
            var digits = util.cutRowImages(HallUI_34.HallUI.getImage('hall/score/score_chars'), 11);
            var spr = this.spr;
            var mask = new createjs.Shape();
            {
                var g = mask.graphics;
                g.beginFill('rgba(0,0,0,0.7)');
                g.drawRect(0, 0, 640, 1136);
                g.endFill();
            }
            spr.addChild(mask);
            //light effect
            {
                var image = HallUI_34.HallUI.getImage('hall/high_score_up_light_effect');
                var bitmap = new createjs.Bitmap(image);
                bitmap.set({
                    x: 320, y: 322,
                    regX: image.width / 2, regY: image.height / 2
                });
                spr.addChild(bitmap);
            }
            //up arrow
            {
                var image = HallUI_34.HallUI.getImage('hall/up_arrow');
                var bitmap = new createjs.Bitmap(image);
                bitmap.set({
                    x: 320, y: 421,
                    regX: image.width / 2
                });
                spr.addChild(bitmap);
            }
            //up text
            var up_text;
            {
                var image = HallUI_34.HallUI.getImage(obj.type === 'weekly' ? 'hall/weekly_high_score_up_text' : 'hall/historical_high_score_up_text');
                up_text = new createjs.Text(obj.type === 'weekly' ? '周纪录UP' : '历史纪录UP', '40px SimHei', 'white');
                up_text.set({ x: 413, y: 213 });
                spr.addChild(up_text);
                up_text.alpha = 0;
            }
            //from score
            {
                var bitmaps = GameUtil.createDigitBitmap(obj.scoreFrom, digits, true);
                for (var _i = 0, bitmaps_1 = bitmaps; _i < bitmaps_1.length; _i++) {
                    var bmp = bitmaps_1[_i];
                    bmp.x += 320;
                    bmp.y += 619;
                    spr.addChild(bmp);
                }
            }
            //to score
            var toScoreBitmapArray = [];
            function setToScore(score) {
                score = score | 0;
                for (var _i = 0, toScoreBitmapArray_1 = toScoreBitmapArray; _i < toScoreBitmapArray_1.length; _i++) {
                    var bmp = toScoreBitmapArray_1[_i];
                    spr.removeChild(bmp);
                }
                toScoreBitmapArray.length = 0;
                var bitmaps = GameUtil.createDigitBitmap(score, digits, true);
                for (var _a = 0, bitmaps_2 = bitmaps; _a < bitmaps_2.length; _a++) {
                    var bmp = bitmaps_2[_a];
                    toScoreBitmapArray.push(bmp);
                    bmp.x += 320;
                    bmp.y += 358;
                    spr.addChild(bmp);
                }
            }
            var shareButton = new ImageButton_22.ImageButton(HallUI_34.HallUI.getImage('hall/share_button_text2'));
            shareButton.set({ x: 320, y: 685 });
            shareButton.visible = false;
            spr.addChild(shareButton);
            shareButton.onClick = function () {
                share.share();
                _this.onClick();
            };
            var animObject = {};
            animObject._score = obj.scoreFrom;
            Object.defineProperty(animObject, 'score', {
                get: function () { return this._score; },
                set: function (val) { this._score = val; setToScore(val | 0); }
            });
            //分数变化的动画
            createjs.Tween.get(animObject).to({ score: obj.scoreTo }, 600).wait(200).call(function () {
                //第二阶段动画
                createjs.Tween.get(up_text).to({ alpha: 1 }, 500).wait(200).call(function () {
                    _this._animEnd = true;
                    shareButton.visible = true;
                    setTimeout(function () { return _this.close(); }, 10 * 1000);
                });
            });
            this._onAnimationEnd = obj.onAnimationEnd;
            mask.addEventListener('mousedown', function () { return _this.onClick(); });
        }
        HighScoreUpAnimation.prototype.onClick = function () {
            if (this._animEnd) {
                this.close();
            }
        };
        HighScoreUpAnimation.prototype.close = function () {
            if (this.spr.parent) {
                if (this._onAnimationEnd)
                    this._onAnimationEnd();
                this.spr.parent.removeChild(this.spr);
            }
        };
        return HighScoreUpAnimation;
    }());
    exports.HighScoreUpAnimation = HighScoreUpAnimation;
});
define("client/src/hall/gameover/HighScorePositionUpAnimation", ["require", "exports", "client/src/hall/HallUI", "client/src/hall/friend/OneFriendEntry", "client/src/ImageButton", "client/src/ShareFunctions", "client/src/resource"], function (require, exports, HallUI_35, OneFriendEntry_2, ImageButton_23, share, resource_12) {
    "use strict";
    var HighScorePositionUpAnimation = (function () {
        function HighScorePositionUpAnimation(obj) {
            var _this = this;
            this.spr = new createjs.Container();
            this._animEnd = false;
            var spr = this.spr;
            var mask = new createjs.Shape();
            {
                var g = mask.graphics;
                g.beginFill('rgba(0,0,0,0.7)');
                g.drawRect(0, 0, resource_12.GraphicConstant.SCREEN_WIDTH, resource_12.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
            }
            spr.addChild(mask);
            obj.friend.index = obj.newIndex + 1;
            var friendEntry = new OneFriendEntry_2.OneFriendEntry();
            friendEntry.spr.mouseChildren = false;
            friendEntry.spr.regX = friendEntry.width / 2;
            friendEntry.spr.regY = friendEntry.height / 2;
            friendEntry.spr.x = 320;
            friendEntry.spr.y = 541;
            friendEntry.setFriendInfo(obj.friend);
            spr.addChild(friendEntry.spr);
            obj.me.index = obj.oldIndex;
            obj.me.score = obj.oldScore;
            var selfEntry = new OneFriendEntry_2.OneFriendEntry();
            selfEntry.spr.mouseChildren = false;
            selfEntry.spr.regX = selfEntry.width / 2;
            selfEntry.spr.regY = selfEntry.height / 2;
            selfEntry.spr.x = 320;
            selfEntry.spr.y = 676;
            selfEntry.setFriendInfo(obj.me);
            spr.addChild(selfEntry.spr);
            var shareButton = new ImageButton_23.ImageButton(HallUI_35.HallUI.getImage('hall/share_button_text2'));
            shareButton.set({ x: 320, y: 685 });
            shareButton.visible = false;
            spr.addChild(shareButton);
            shareButton.onClick = function () {
                share.share();
                _this.onClick();
            };
            createjs.Tween.get(selfEntry.spr).wait(1000).to({ y: 373 }, 1000, createjs.Ease.getBackOut(1.5)).call(function () {
                obj.me.index = obj.newIndex;
                obj.me.score = obj.newScore;
                selfEntry.setFriendInfo(obj.me);
            }).to({ scaleX: 1.1, scaleY: 1.1 }, 400).call(function () {
                //发光特效
                var image = HallUI_35.HallUI.getImage('hall/position_up_light_effect');
                var bitmap = new createjs.Bitmap(image);
                bitmap.set({
                    regX: image.width / 2,
                    regY: image.height / 2,
                    x: selfEntry.spr.x,
                    y: selfEntry.spr.y,
                    scaleX: selfEntry.spr.scaleX,
                    scaleY: selfEntry.spr.scaleY
                });
                bitmap.alpha = 0;
                spr.addChildAt(bitmap, spr.getChildIndex(selfEntry.spr));
                createjs.Tween.get(bitmap).to({ alpha: 1 }, 300).call(function () {
                    _this._animEnd = true;
                    shareButton.visible = true;
                    setTimeout(function () { return _this.close(); }, 10 * 1000);
                });
                //文字
                var textSpr = _this._createPositionUpText(obj.oldIndex - obj.newIndex);
                spr.addChild(textSpr);
                textSpr.set({ x: 329, y: 240, alpha: 0 });
                createjs.Tween.get(textSpr).to({ alpha: 1 }, 200);
            });
            mask.addEventListener('mousedown', function () { return _this.onClick(); });
            this._onAnimationEnd = obj.onAnimationEnd;
        }
        HighScorePositionUpAnimation.prototype._createPositionUpText = function (n) {
            var spr = new createjs.Text("\u5468\u6392\u540D\u4E0A\u5347" + n, '30px SimHei', "white");
            /*
            let spr = new createjs.Container();
            let digits = util.cutRowImages(HallUI.getImage('hall/position_up_digits'), 10);
            let x = 0;
            {
                let image = HallUI.getImage('hall/position_up_text');
                let bitmap = new createjs.Bitmap(image);
                spr.addChild(bitmap);
                x += image.width;
            }
            {
                let bitmaps = GameUtil.createDigitBitmap(n | 0, digits, false);
                let offset = 0;
                if (bitmaps.length > 0)
                {
                    let lastX = x;
                    offset = -bitmaps[0].x;
                    for (let bmp of bitmaps)
                    {
                        bmp.x += offset + x;
                        bmp.y = 0;
                        spr.addChild(bmp);
                        lastX = bmp.x + bmp.image.width;
                    }
                    x = lastX;
                }
            }
            {
                let image = HallUI.getImage('hall/position_up_arrow');
                let bitmap = new createjs.Bitmap(image);
                bitmap.set({ x: x, y: 0 });
                spr.addChild(bitmap);
            }*/
            return spr;
        };
        HighScorePositionUpAnimation.prototype.onClick = function () {
            if (this._animEnd) {
                this.close();
            }
        };
        HighScorePositionUpAnimation.prototype.close = function () {
            if (this.spr.parent) {
                if (this._onAnimationEnd)
                    this._onAnimationEnd();
                this.spr.parent.removeChild(this.spr);
            }
        };
        return HighScorePositionUpAnimation;
    }());
    exports.HighScorePositionUpAnimation = HighScorePositionUpAnimation;
});
define("client/src/hall/match_ui/MatchingPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/GameLink", "client/src/ImageButton", "client/src/FixSizeBitmap"], function (require, exports, HallUI_36, GameLink_20, ImageButton_24, FixSizeBitmap_3) {
    "use strict";
    var ICON_POSES = [
        { x: 320, y: 843 },
        { x: 121, y: 384 },
        { x: 320, y: 284 },
        { x: 509, y: 384 },
    ];
    var MatchingPanel = (function () {
        function MatchingPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this.icons = [];
            this._iconFrames = [];
            this._names = [];
            this._iconContainer = [];
            var background = new createjs.Bitmap(HallUI_36.HallUI.getImage('hall/matching_background'));
            background.addEventListener('mousedown', function () { });
            this.spr.addChild(background);
            var roundBitmap = new createjs.Bitmap(HallUI_36.HallUI.getImage('hall/matching_round_anim'));
            roundBitmap.set({
                regX: 292,
                regY: 293,
                x: 320, y: 569
            });
            this.spr.addChild(roundBitmap);
            var roundAnim = createjs.Tween.get(roundBitmap, { loop: true }).to({ rotation: 360 }, 2710);
            this._roundAnimation = roundAnim;
            this._matchingPlayerCountText = new createjs.Text('999名玩家正在', '27px SimHei', 'white');
            this._matchingPlayerCountText.set({
                textAlign: 'center',
                x: 320,
                y: 529
            });
            this.spr.addChild(this._matchingPlayerCountText);
            var matching_text = new createjs.Bitmap(HallUI_36.HallUI.getImage('hall/match/matching_text'));
            matching_text.set({
                x: 200,
                y: 565
            });
            this.spr.addChild(matching_text);
            var dots = [];
            var dotImage = HallUI_36.HallUI.getImage('hall/match/matching_text_dot');
            for (var i = 0; i < 6; ++i) {
                var bmp = new createjs.Bitmap(dotImage);
                bmp.set({
                    x: 349 + i * 16,
                    y: 565 + 20,
                });
                dots.push(bmp);
                this.spr.addChild(bmp);
            }
            {
                var ppp = -1;
                var obj = {};
                var setPPP = function (x) {
                    ppp = x;
                    var i;
                    for (i = 0; i < x && i < 6; ++i) {
                        dots[i].visible = true;
                    }
                    for (; i < 6; ++i) {
                        dots[i].visible = false;
                    }
                };
                Object.defineProperty(obj, 'ppp', { set: setPPP, get: function () { return ppp; } });
                this._dotAnimation = createjs.Tween.get(obj, { loop: true }).to({ ppp: 7 }, 3000);
            }
            var iconPoses = ICON_POSES;
            //face icons
            for (var i = 0; i < 4; ++i) {
                var cc = new createjs.Container();
                var pos = iconPoses[i];
                cc.set(pos);
                var iconframe_image = HallUI_36.HallUI.getImage('hall/matching_face_frame');
                var icon = new createjs.Bitmap(null);
                var iconframe = new createjs.Bitmap(iconframe_image);
                var iconMask = new createjs.Shape();
                var nameText = new createjs.Text('XXXX', '27px SimHei', 'white');
                nameText.set({ x: 0, y: 65 });
                nameText.textAlign = 'center';
                FixSizeBitmap_3.MakeSuitableSize(icon, 105, 105, HallUI_36.HallUI.getImage('hall/default_user_headicon'));
                icon.hitArea = new createjs.Shape();
                iconframe.set({
                    regX: iconframe_image.width / 2,
                    regY: iconframe_image.height / 2,
                });
                cc.addChild(iconframe);
                cc.addChild(icon);
                cc.addChild(nameText);
                this._iconFrames.push(iconframe);
                this.icons.push(icon);
                this._names.push(nameText);
                icon.mask = iconMask;
                var g = iconMask.graphics;
                g.beginFill('white');
                g.drawCircle(icon.x, icon.y, 52);
                g.endFill();
                this._iconContainer.push(cc);
                this.spr.addChild(cc);
            }
            //exit button
            var button = new ImageButton_24.ImageButton(HallUI_36.HallUI.getImage('hall/cross_button'));
            button.set({ x: 590, y: 50 });
            this.spr.addChild(button);
            this.spr.visible = false;
            button.onClick = function () {
                _this.hide();
                GameLink_20.GameLink.instance.sendLeaveMatch();
            };
            this.setTwoPlayersMode();
        }
        MatchingPanel.prototype.setTwoPlayersMode = function () {
            var cc = this._iconContainer;
            cc[0].set(ICON_POSES[0]);
            cc[1].set(ICON_POSES[2]);
            cc[2].visible = false;
            cc[3].visible = false;
        };
        MatchingPanel.prototype.setFourPlayersMode = function () {
            for (var i = 0; i < 4; ++i) {
                this._iconContainer[i].set(ICON_POSES[i]);
                this._iconContainer[i].visible = true;
            }
        };
        MatchingPanel.prototype.show = function () {
            this.spr.visible = true;
            var myimage = new Image();
            myimage.src = GameLink_20.GameLink.instance.faceurl;
            this.icons[0].image = myimage;
            for (var i = 1; i < this.icons.length; ++i)
                this.icons[i].image = new Image();
            this._dotAnimation.setPaused(false);
            this._names[0].text = GameLink_20.GameLink.instance.nickname;
            this._names[1].text = '等待玩家';
            this._names[2].text = '等待玩家';
            this._names[3].text = '等待玩家';
            this._roundAnimation.setPaused(false);
        };
        MatchingPanel.prototype.update = function (players) {
            for (var i = 0; i < (players.length > 3 ? 3 : players.length); i++) {
                this._names[i + 1].text = players[i].nickname;
                var _ico = new Image();
                _ico.src = players[i].faceurl;
                this.icons[i + 1].image = _ico;
            }
        };
        MatchingPanel.prototype.hide = function () {
            this.spr.visible = false;
            this._dotAnimation.setPaused(true);
            this._roundAnimation.setPaused(true);
        };
        MatchingPanel.prototype.setMatchingPlayerCount = function (count) {
            this._matchingPlayerCountText.text = count + "\u540D\u73A9\u5BB6\u6B63\u5728";
        };
        return MatchingPanel;
    }());
    exports.MatchingPanel = MatchingPanel;
});
define("client/src/hall/SmallButtonBar", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton"], function (require, exports, HallUI_37, ImageButton_25) {
    "use strict";
    var BASE_POS = { x: 0, y: 0 };
    var SmallButtonBar = (function () {
        function SmallButtonBar() {
            this.spr = new createjs.Container();
            this.spr.set(BASE_POS);
            //let btnConfig = this._btnConfig = new ImageButton(HallUI.getImage('hall/gear'));
            //btnConfig.set({ x: 45, y: 179 });
            /*let downloadButton = new ImageButton(HallUI.instance.getImage('hall/download_button_image'));
            downloadButton.set({ x: 500, y: 179 });
            downloadButton.onClick = () =>
            {
                let dlg = new DownloadAppConfirm({
                    onOk: () =>
                    {
    
                        this.onClickDownload();
                    }
                });
                HallUI.instance.spr.addChild(dlg.spr);
            };*/
            var weekly_task_button = new ImageButton_25.ImageButton(HallUI_37.HallUI.getImage('hall/small_weekly_task_button'));
            weekly_task_button.set({ x: 342, y: 176 });
            var activity_button = new ImageButton_25.ImageButton(HallUI_37.HallUI.getImage('hall/small_activity_button'));
            activity_button.set({ x: 342 + 100, y: 176 });
            //let rank_button = new ImageButton(HallUI.getImage('hall/small_rank_button'));
            //rank_button.set({ x: 140 + 90 + 90, y: 48 });
            var help_button = new ImageButton_25.ImageButton(HallUI_37.HallUI.getImage('hall/small_help_button'));
            help_button.set({ x: 342 + 100 + 100, y: 176 });
            weekly_task_button.onClick = function () {
                HallUI_37.HallUI.instance._onClickBottomButton('weekly_task');
            };
            //this.spr.addChild(btnConfig);
            //this.spr.addChild(downloadButton);
            this.spr.addChild(weekly_task_button);
            this.spr.addChild(activity_button);
            //this.spr.addChild(rank_button);
            this.spr.addChild(help_button);
            //btnConfig.image = SoundManager.muted ? HallUI.getImage('hall/sound_off') : HallUI.getImage('hall/sound_on');
            //btnConfig.onClick = () =>
            //{
            //	SoundManager.muted = !SoundManager.muted;
            //	btnConfig.image = SoundManager.muted ? HallUI.getImage('hall/sound_off') : HallUI.getImage('hall/sound_on');
            //}
            activity_button.onClick = function () {
                HallUI_37.HallUI.instance.showActivityPanel();
            };
            //rank_button.onClick = () =>
            //{
            //	HallUI.instance.showRankListPanel();
            //}
            help_button.onClick = function () {
                HallUI_37.HallUI.instance.showHelp();
            };
            var newTextIcon = weekly_task_button.addIcon(HallUI_37.HallUI.instance.getImage('hall/new_text_tip'), { x: -30, y: -25 });
            this._weeklyTaskTipAnimation = createjs.Tween.get(newTextIcon, { loop: true }).to({ scaleX: 0.8, scaleY: 0.8 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);
            this._weeklyTaskNewIcon = newTextIcon;
            this.showWeeklyTaskNewIcon(false);
        }
        SmallButtonBar.prototype.showWeeklyTaskNewIcon = function (isshow) {
            this._weeklyTaskNewIcon.visible = isshow;
            this._weeklyTaskTipAnimation.setPaused(!isshow);
        };
        SmallButtonBar.prototype.onPanelChanged = function (type) {
            if (type === 'match') {
                this.spr.y = 75;
            }
            else {
                this.spr.y = 0;
            }
        };
        return SmallButtonBar;
    }());
    exports.SmallButtonBar = SmallButtonBar;
});
define("client/src/hall/match_ui/MyInfoPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/GameLink", "client/src/FixSizeBitmap"], function (require, exports, HallUI_38, GameLink_21, FixSizeBitmap) {
    "use strict";
    var MyInfoPanel = (function () {
        function MyInfoPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this.spr.set({ x: 66, y: 364 });
            var background = new createjs.Bitmap(HallUI_38.HallUI.instance.getImage('hall/match_myinfo_background'));
            this.spr.addChild(background);
            //let iconFrame = new createjs.Bitmap(HallUI.instance.getImage('hall/friend_icon_background'));
            //iconFrame.set({ x: 33, y: 7 });
            //this.spr.addChild(iconFrame);
            var faceicon = this._faceIcon = new createjs.Bitmap(null);
            FixSizeBitmap.MakeSuitableSize(this._faceIcon, 70, 70, HallUI_38.HallUI.getImage('hall/default_user_headicon'));
            this._faceIcon.set({ x: 33 + 5 + 58, y: 12 + 38 });
            this._faceIcon.mouseEnabled = false;
            this._faceIcon.hitArea = new createjs.Shape();
            var facemask = this._faceIcon.mask = new createjs.Shape();
            {
                var g = facemask.graphics;
                g.beginFill('white');
                g.drawRoundRect(faceicon.x - 35, faceicon.y - 35, 70, 70, 10);
                g.endFill();
            }
            this.spr.addChild(this._faceIcon);
            var faceurl = "";
            this._faceIcon.addEventListener('tick', function () {
                if (GameLink_21.GameLink.instance && GameLink_21.GameLink.instance.faceurl !== faceurl) {
                    faceurl = GameLink_21.GameLink.instance.faceurl;
                    if (faceurl) {
                        var image = new Image();
                        image.src = faceurl;
                        _this._faceIcon.image = image;
                    }
                    else {
                        _this._faceIcon.image = null;
                    }
                }
            });
            //let face_mask = new createjs.Bitmap(HallUI.getImage('hall/face_mask'));
            //face_mask.set({
            //	x: 33, y: 7,
            //});
            //this.spr.addChild(face_mask);
            //texts
            var text1 = new createjs.Text('本周最高分', '25px SimHei', 'white');
            text1.set({ x: 149, y: 25 });
            this.spr.addChild(text1);
            var text2 = new createjs.Text('排名', '25px SimHei', 'white');
            text2.set({ x: 375, y: 25 });
            this.spr.addChild(text2);
            var score = new createjs.Text('', '25px SimHei', 'white');
            score.set({ x: 310, y: 63, textAlign: 'right' });
            this.spr.addChild(score);
            Object.defineProperty(score, 'text', {
                get: function () {
                    if (GameLink_21.GameLink.instance)
                        return (GameLink_21.GameLink.instance.weekHighScore | 0).toString();
                    return '';
                }
            });
            var rankPosition = new createjs.Text('', '25px SimHei', 'white');
            rankPosition.set({ x: 434, y: 63, textAlign: 'right' });
            this.spr.addChild(rankPosition);
            Object.defineProperty(rankPosition, 'text', {
                get: function () {
                    if (GameLink_21.GameLink.instance && GameLink_21.GameLink.instance.weekRankPosition > 0) {
                        return GameLink_21.GameLink.instance.weekRankPosition.toString();
                    }
                    return '';
                }
            });
        }
        return MyInfoPanel;
    }());
    exports.MyInfoPanel = MyInfoPanel;
});
define("shared/MatchRules", ["require", "exports"], function (require, exports) {
    "use strict";
    //关于对战模式的规则
    exports.MATCH_ENTER_SCORE = {
        '11': 0,
        '44': 250000,
        'master': 500000
    };
    exports.MATCH_PRICE = {
        '11': 1000,
        '44': 2000,
        'master': 3000
    };
    exports.MATCH_AWARD = {
        '11': 1800,
        '44': 7600,
        'master': 11600
    };
});
define("client/src/hall/match_ui/MatchPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/GameLink", "client/src/hall/match_ui/MyInfoPanel", "shared/MatchRules"], function (require, exports, HallUI_39, ImageButton_26, GameLink_22, MyInfoPanel_1, MatchRules) {
    "use strict";
    var BASE_POS = { x: 20, y: 263 };
    var MatchPanel = (function () {
        function MatchPanel() {
            this.spr = new createjs.Container();
            var background = new createjs.Bitmap(HallUI_39.HallUI.instance.getImage('hall/match_panel_background'));
            background.set(BASE_POS);
            this.spr.addChild(background);
            var title = new createjs.Bitmap(HallUI_39.HallUI.getImage('hall/match_title_text'));
            title.set({ x: 227, y: 280 });
            this.spr.addChild(title);
            this.myInfoPanel = new MyInfoPanel_1.MyInfoPanel();
            this.spr.addChild(this.myInfoPanel.spr);
            var button1 = new ImageButton_26.ImageButton(HallUI_39.HallUI.getImage('hall/match/match_button1'));
            button1.set({ x: 325 - 180, y: 634 });
            this.spr.addChild(button1);
            var button2 = new ImageButton_26.ImageButton(HallUI_39.HallUI.getImage('hall/match/match_button2'));
            button2.set({ x: 325, y: 634 });
            this.spr.addChild(button2);
            var button3 = new ImageButton_26.ImageButton(HallUI_39.HallUI.getImage('hall/match/match_button3'));
            button3.set({ x: 325 + 180, y: 634 });
            this.spr.addChild(button3);
            addPriceText(button1, MatchRules.MATCH_PRICE['11'], MatchRules.MATCH_AWARD['11']);
            addPriceText(button2, MatchRules.MATCH_PRICE['44'], MatchRules.MATCH_AWARD['44']);
            addPriceText(button3, MatchRules.MATCH_PRICE['master'], MatchRules.MATCH_AWARD['master']);
            this.button2Lock = addButtonMask(button2, '分数首次达到\n250,000解锁');
            this.button3Lock = addButtonMask(button3, '分数首次达到\n750,000解锁');
            Object.defineProperty(this.button2Lock, 'visible', {
                get: function () {
                    var link = GameLink_22.GameLink.instance;
                    if (link && link.historicalHighScore >= MatchRules.MATCH_ENTER_SCORE["44"])
                        return false;
                    return true;
                }
            });
            Object.defineProperty(this.button3Lock, 'visible', {
                get: function () {
                    var link = GameLink_22.GameLink.instance;
                    if (link && link.historicalHighScore >= MatchRules.MATCH_ENTER_SCORE["master"])
                        return false;
                    return true;
                }
            });
            button1.onClick = function () {
                GameLink_22.GameLink.instance.sendEnterMatch("11");
            };
            button2.onClick = function () {
                GameLink_22.GameLink.instance.sendEnterMatch("44");
            };
            button3.onClick = function () {
                GameLink_22.GameLink.instance.sendEnterMatch("master");
            };
            function addButtonMask(button, text) {
                var lockmask = new createjs.Bitmap(HallUI_39.HallUI.getImage('hall/match_button_lock_mask'));
                lockmask.set({
                    regX: lockmask.image.width / 2,
                    regY: lockmask.image.height / 2,
                    x: 0, y: 0
                });
                //var locktext = new createjs.Bitmap(lockTextImage);
                //locktext.set({
                //	regX: lockTextImage.width / 2,
                //	regY: lockTextImage.height / 2,
                //	x: 0, y: 70
                //});
                var locktext = new createjs.Text(text, '24px SimHei', 'white');
                locktext.lineHeight = 24;
                locktext.y = 60;
                locktext.x = -70;
                var cc = new createjs.Container();
                cc.addChild(lockmask);
                cc.addChild(locktext);
                button.scaledContainer.addChild(cc);
                return cc;
            }
            function addPriceText(button, price1, price2) {
                var text1 = new createjs.Text(price1.toString(), '20px SimHei', 'white');
                text1.set({ x: -18, y: 35 });
                var text2 = new createjs.Text(price2.toString(), '20px SimHei', 'white');
                text2.set({ x: -18, y: 95 });
                button.addDisplayObject(text1);
                button.addDisplayObject(text2);
            }
        }
        MatchPanel.prototype.show = function (isShow) {
            this.spr.visible = !!isShow;
        };
        return MatchPanel;
    }());
    exports.MatchPanel = MatchPanel;
});
define("client/src/hall/activity_panel/ActivityPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton", "main"], function (require, exports, HallUI_40, resource_13, ImageButton_27, main) {
    "use strict";
    var ActivityPanel = (function () {
        function ActivityPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this._inited = false;
            var ADD = 110;
            //black mask
            {
                var bgMask = new createjs.Shape();
                var g = bgMask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_13.GraphicConstant.SCREEN_WIDTH, resource_13.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
                this.spr.addChild(bgMask);
                bgMask.addEventListener('mousedown', function () { });
            }
            //background
            {
                var bg = new createjs.Bitmap(HallUI_40.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 35, y: 89 + ADD });
                this.spr.addChild(bg);
            }
            {
                var title = new createjs.Bitmap(HallUI_40.HallUI.getImage('hall/activity_title'));
                title.set({ x: 320, y: 300, regX: title.image.width / 2 });
                this.spr.addChild(title);
            }
            //close button
            {
                var btnClose = new ImageButton_27.ImageButton(HallUI_40.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: resource_13.GraphicConstant.SCREEN_WIDTH / 2, y: 885 + ADD });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    _this.show(false);
                };
            }
            this.spr.visible = false;
        }
        ActivityPanel.prototype.show = function (isshow) {
            if (isshow && !this._inited) {
                this.init();
                this._inited = true;
            }
            this.spr.visible = !!isshow;
            this._iframe_holder.style.display = this._iframe.style.display = isshow ? 'block' : 'none';
            if (isshow) {
                this._iframe.src = 'activity.html';
            }
            else {
                this._iframe.src = "about:blank";
            }
        };
        ActivityPanel.prototype.init = function () {
            //如此复杂就是为了修复在ios上iframe的bug
            var holder = this._iframe_holder = main.createOverlayHtml('div');
            var iframe = this._iframe = document.createElement('iframe');
            $(holder).css({
                overflow: 'auto',
                '-webkit-overflow-scrolling': 'touch',
                border: '0',
                margin: '0',
                padding: '0'
            });
            iframe.style.backgroundColor = 'rgba(0,0,0,0)';
            $(iframe).css({
                width: '100%',
                height: '100%',
                border: '0',
                margin: '0',
                padding: '0'
            });
            holder.appendChild(iframe);
            main.addToTopLayer(holder);
            main.addResizeCallback(this.onScale.bind(this));
        };
        ActivityPanel.prototype.onScale = function (scale) {
            var px = function (x) { return ((x * scale) | 0).toString() + 'px'; };
            var holder = this._iframe_holder;
            holder.style.left = px(60);
            holder.style.top = px(255 + 110);
            holder.style.width = px(524);
            holder.style.height = px(444);
            //holder.width = px(524);
            //holder.height = px(444);
            //iframe.style.border = '2px solid black';
        };
        return ActivityPanel;
    }());
    exports.ActivityPanel = ActivityPanel;
});
define("client/src/hall/rank_list_panel/OneFriendEntry", ["require", "exports", "client/src/hall/HallUI", "client/src/GameLink", "client/src/util", "client/src/FixSizeBitmap"], function (require, exports, HallUI_41, GameLink_23, util, FixSizeBitmap) {
    "use strict";
    var OneFriendEntry = (function () {
        function OneFriendEntry() {
            var _this = this;
            this.spr = new createjs.Container();
            this.width = 0;
            this.height = 0;
            var background = new createjs.Bitmap(HallUI_41.HallUI.instance.getImage('hall/friend_background'));
            this.width = background.image.width;
            this.height = background.image.height;
            this.spr.setBounds(0, 0, this.width, this.height);
            var iconFrame = new createjs.Bitmap(HallUI_41.HallUI.instance.getImage('hall/friend_icon_background'));
            iconFrame.set({ x: 100, y: 7 });
            this._indexBitmap0 = new createjs.Bitmap(null);
            this._indexBitmap0.set({ x: 30, y: 60 });
            this._indexBitmap1 = new createjs.Bitmap(null);
            this._indexBitmap1.set({ x: 75, y: 60 });
            iconFrame.addEventListener('click', function () {
                if (_this._obj && _this._obj.key) {
                    HallUI_41.HallUI.instance.showFriendInfoPanel(_this._obj.key);
                }
            });
            this._selfIconFrame = new createjs.Bitmap(HallUI_41.HallUI.getImage('hall/friend_self_frame'));
            this._selfIconFrame.set({ x: 100, y: 7 });
            this._faceIcon = new createjs.Bitmap(null);
            FixSizeBitmap.MakeSuitableSize(this._faceIcon, 90, 90, HallUI_41.HallUI.getImage('hall/default_user_headicon'));
            this._faceIcon.set({ x: 105 + 45, y: 12 + 45 });
            this._faceIcon.mouseEnabled = false;
            this._faceIcon.hitArea = new createjs.Shape();
            //{
            var face_mask = new createjs.Bitmap(HallUI_41.HallUI.getImage('hall/face_mask'));
            face_mask.set({
                x: 100, y: 7,
            });
            this._firstOneIcon = new createjs.Bitmap(HallUI_41.HallUI.getImage('hall/friend_first_icon'));
            this._firstOneIcon.set({ x: 170, y: -10 });
            var nameText = this._nameText = new createjs.Text('名字名字名字', '20px SimHei', '#ff3a8b');
            nameText.set({ x: 224, y: 22 });
            this._nameTextOutline = new createjs.Text('', nameText.font, 'white');
            this._nameTextOutline.outline = 2;
            this._nameTextOutline.x = nameText.x;
            this._nameTextOutline.y = nameText.y;
            this._scoreText = new createjs.Text('998,122,222', '30px Arial', 'white');
            this._scoreText.textAlign = 'right';
            this._scoreText.set({ x: 420, y: 60 });
            this.spr.addChild(background);
            this.spr.addChild(iconFrame);
            this.spr.addChild(this._faceIcon);
            this.spr.addChild(face_mask);
            this.spr.addChild(this._selfIconFrame);
            this.spr.addChild(this._indexBitmap0);
            this.spr.addChild(this._indexBitmap1);
            this.spr.addChild(this._firstOneIcon);
            this.spr.addChild(this._nameTextOutline);
            this.spr.addChild(nameText);
            this.spr.addChild(this._scoreText);
            //this.spr.cache(0, 0, this.width, this.height);
        }
        OneFriendEntry.prototype.setFriendInfo = function (obj) {
            this._obj = obj;
            var name = obj.name || "";
            if (name.length > 9) {
                name = name.substr(0, 9) + "...";
            }
            this._nameTextOutline.text = this._nameText.text = name;
            this._firstOneIcon.visible = obj.index === 0;
            this._selfIconFrame.visible = obj.key === GameLink_23.GameLink.instance.key;
            var index = (obj.index | 0) + 1;
            var d1 = (index / 10) | 0;
            var d0 = (index % 10);
            if (index > 99) {
                d0 = d1 = 99;
            }
            if (d1 >= 0 && d1 <= 9) {
                var image = this._indexBitmap0.image = HallUI_41.HallUI.getImage('hall/friend_' + d1);
                this._indexBitmap0.set({
                    regX: image.width / 2,
                    regY: image.height / 2
                });
            }
            else {
                this._indexBitmap0.image = null;
            }
            if (d0 >= 0 && d0 <= 9) {
                var image = this._indexBitmap1.image = HallUI_41.HallUI.getImage('hall/friend_' + d0);
                this._indexBitmap1.set({
                    regX: image.width / 2,
                    regY: image.height / 2
                });
            }
            else {
                this._indexBitmap1.image = null;
            }
            if (!obj.faceurl) {
                this._faceIcon.visible = true;
                this._faceIcon.image = null;
            }
            else {
                var image = new Image();
                image.src = obj.faceurl;
                this._faceIcon.image = image;
                this._faceIcon.visible = true;
            }
            this._scoreText.text = util.intToString((obj.score | 0));
        };
        return OneFriendEntry;
    }());
    exports.OneFriendEntry = OneFriendEntry;
});
define("client/src/hall/rank_list_panel/RankListPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/hall/shared/VerticalScrollPanel", "client/src/hall/rank_list_panel/OneFriendEntry", "client/src/GameLink"], function (require, exports, HallUI_42, ImageButton_28, VerticalScrollPanel_6, OneFriendEntry_3, GameLink_24) {
    "use strict";
    var FRIEND_ENTRY_X = 10;
    var FRIEND_ENTRY_Y = 10;
    var FRIEND_ENTRY_Y_GAP = 18;
    var RankListPanel = (function () {
        function RankListPanel() {
            var _this = this;
            this.spr = new createjs.Container();
            this._friendEntries = [];
            //black mask
            {
                var bgMask = new createjs.Shape();
                var g = bgMask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, 640, 960);
                g.endFill();
                this.spr.addChild(bgMask);
                bgMask.addEventListener('mousedown', function () { });
            }
            //background
            {
                var bg = new createjs.Bitmap(HallUI_42.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 35, y: 89 });
                this.spr.addChild(bg);
            }
            //title text
            {
                var title = new createjs.Bitmap(HallUI_42.HallUI.getImage('hall/rank_list_panel_title'));
                title.set({ x: 320 - title.image.width / 2, y: 186 });
                this.spr.addChild(title);
            }
            //close button
            {
                var btnClose = new ImageButton_28.ImageButton(HallUI_42.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: 640 / 2, y: 885 });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    _this.show(false);
                };
            }
            {
                this._friendListPanel = new VerticalScrollPanel_6.VerticalScrollPanel();
                this._friendListPanel.setVisualizeMask(true);
                this._friendListPanel.setPos({ x: 49, y: 249 });
                this._friendListPanel.setSize(535, 443);
                this.spr.addChild(this._friendListPanel.spr);
            }
            this.spr.visible = false;
        }
        RankListPanel.prototype.setFriendList = function (friends) {
            this._setFriendCount(friends.length);
            for (var i = 0; i < friends.length; ++i) {
                this._friendEntries[i].setFriendInfo(friends[i]);
            }
        };
        RankListPanel.prototype._setFriendCount = function (n) {
            var someEntry;
            if (n < this._friendEntries.length) {
                for (var i = n; i < this._friendEntries.length; ++i) {
                    var entry = this._friendEntries[i];
                    this._friendListPanel.removeChild(entry.spr);
                    someEntry = entry;
                }
            }
            else if (n > this._friendEntries.length) {
                for (var i = this._friendEntries.length; i < n; ++i) {
                    var entry = new OneFriendEntry_3.OneFriendEntry();
                    entry.spr.x = FRIEND_ENTRY_X;
                    entry.spr.y = FRIEND_ENTRY_Y + i * (FRIEND_ENTRY_Y_GAP + entry.height);
                    this._friendListPanel.addChild(entry.spr);
                    this._friendEntries.push(entry);
                    someEntry = entry;
                }
            }
            if (someEntry) {
                this._friendEntries.length = n;
                var friendContentHeight = FRIEND_ENTRY_Y + n * (FRIEND_ENTRY_Y_GAP + someEntry.height);
                this._friendListPanel.contentHeight = friendContentHeight;
            }
        };
        RankListPanel.prototype.show = function (isshow) {
            if (isshow) {
                this.setFriendList(GameLink_24.GameLink.instance.getWeekRankList());
            }
            this.spr.visible = isshow;
        };
        RankListPanel.prototype.refresh = function () {
            if (this.spr.visible) {
                this.setFriendList(GameLink_24.GameLink.instance.getWeekRankList());
            }
        };
        return RankListPanel;
    }());
    exports.RankListPanel = RankListPanel;
});
define("client/src/hall/SmallBottomButtonBar", ["require", "exports", "client/src/hall/HallUI", "client/src/GameLink", "shared/PetRules", "client/src/ImageButton", "client/src/hall/confirm_dialog/DownloadAppConfirm"], function (require, exports, HallUI_43, GameLink_25, PetRules, ImageButton_29, DownloadAppConfirm_2) {
    "use strict";
    var SmallBottomButtonBar = (function () {
        function SmallBottomButtonBar() {
            var _this = this;
            this.spr = new createjs.Container();
            var spr = this.spr;
            var iconBg = new createjs.Bitmap(HallUI_43.HallUI.getImage('hall/bottom_pet_icon_bg'));
            iconBg.set({
                x: 135,
                y: 842,
                regX: iconBg.image.width / 2,
                regY: iconBg.image.height / 2
            });
            spr.addChild(iconBg);
            var petIcon = new createjs.Bitmap(null);
            petIcon.set({
                x: 135,
                y: 842,
            });
            var petImage = null;
            Object.defineProperty(petIcon, 'image', {
                get: function () {
                    var pet = GameLink_25.GameLink.instance.currentPet;
                    if (pet >= 0) {
                        petImage = HallUI_43.HallUI.instance.getPetImage(pet);
                    }
                    else {
                        petImage = null;
                    }
                    return petImage;
                }
            });
            Object.defineProperty(petIcon, 'regX', { get: function () { return petImage ? petImage.width / 2 : 0; } });
            Object.defineProperty(petIcon, 'regY', { get: function () { return petImage ? petImage.height / 2 : 0; } });
            spr.addChild(petIcon);
            //出战
            var outText = new createjs.Bitmap(HallUI_43.HallUI.getImage('hall/out_text'));
            outText.set({ x: 114, y: 863 });
            spr.addChild(outText);
            //petname
            var petName = new createjs.Text('', '24px SimHei', '#0d5272');
            petName.set({
                x: 190, y: 808
            });
            Object.defineProperty(petName, 'text', {
                get: function () {
                    var pet = GameLink_25.GameLink.instance.currentPet;
                    if (pet >= 0 && pet < PetRules.PET_NAMES.length) {
                        return PetRules.PET_NAMES[pet];
                    }
                    return '';
                }
            });
            spr.addChild(petName);
            //lv text
            var lvText = new createjs.Text('', '24px SimHei', 'white');
            lvText.set({
                x: 190, y: 838
            });
            Object.defineProperty(lvText, 'text', {
                get: function () {
                    var pet = GameLink_25.GameLink.instance.getPetInfo(GameLink_25.GameLink.instance.currentPet);
                    if (pet) {
                        return 'LV.' + pet.level;
                    }
                    return '';
                }
            });
            spr.addChild(lvText);
            var clickableArea = new createjs.Shape();
            this.spr.addChild(clickableArea);
            {
                var hitArea = new createjs.Shape();
                var g = hitArea.graphics;
                g.beginFill('rgba(0,0,0,0.3)');
                g.drawRect(96, 805, 200, 81);
                g.endFill();
                clickableArea.hitArea = hitArea;
            }
            var petButton = new ImageButton_29.ImageButton(HallUI_43.HallUI.getImage('hall/new_pet_button'));
            petButton.set({
                x: 434, y: 840
            });
            spr.addChild(petButton);
            var downloadButton = new ImageButton_29.ImageButton(HallUI_43.HallUI.getImage('hall/new_download_button'));
            downloadButton.set({
                x: 556, y: 845
            });
            spr.addChild(downloadButton);
            petButton.onClick = function () {
                HallUI_43.HallUI.instance._onClickBottomButton('pet');
            };
            downloadButton.onClick = function () {
                var dlg = new DownloadAppConfirm_2.DownloadAppConfirm({
                    onOk: function () {
                        _this.onClickDownload();
                    }
                });
                HallUI_43.HallUI.instance.spr.addChild(dlg.spr);
            };
            clickableArea.on('click', function () {
                HallUI_43.HallUI.instance._onClickBottomButton('pet');
            });
        }
        SmallBottomButtonBar.prototype.show = function (isshow) {
            this.spr.visible = !!isshow;
        };
        SmallBottomButtonBar.prototype.onClickDownload = function () {
            GameLink_25.GameLink.instance.sendTriggerEvent('DOWNLOAD_APP_AWARD');
            var agent = navigator.userAgent.toLowerCase();
            if (agent.indexOf("android") >= 0) {
                location.href = 'App1.App1.apk';
            }
            else if (agent.indexOf("iphone") >= 0 || agent.indexOf("ipad") >= 0) {
                addToHomescreen({ startDelay: 0 }).show(true);
            }
            else {
                alert('没有下载，请好自为之。');
            }
        };
        return SmallBottomButtonBar;
    }());
    exports.SmallBottomButtonBar = SmallBottomButtonBar;
});
define("client/src/hall/NewBottomBar", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton"], function (require, exports, HallUI_44, ImageButton_30) {
    "use strict";
    var NewBottomBar = (function () {
        function NewBottomBar() {
            this.spr = new createjs.Container();
            var gameButton = new ImageButton_30.ImageButton(HallUI_44.HallUI.getImage('hall/new_bottom_start_game_button'));
            gameButton.set({
                x: 452,
                y: 1020
            });
            this.spr.addChild(gameButton);
            var matchButton = new ImageButton_30.ImageButton(HallUI_44.HallUI.getImage('hall/new_bottom_start_match_button'));
            matchButton.set({
                x: 178,
                y: 1020
            });
            this.spr.addChild(matchButton);
            this._gameButton = gameButton;
            this._matchButton = matchButton;
            this._returnAtPetButton = new ImageButton_30.ImageButton(HallUI_44.HallUI.getImage('hall/return_button'));
            this._returnAtPetButton.set({ x: 98, y: 1016 });
            this.spr.addChild(this._returnAtPetButton);
            this._carryButton = new ImageButton_30.ImageButton(HallUI_44.HallUI.getImage('hall/carry_button'));
            this._carryButton.set({ x: 293, y: 1016 });
            this.spr.addChild(this._carryButton);
            this._petShopButton = new ImageButton_30.ImageButton(HallUI_44.HallUI.getImage('hall/pet_shop_button'));
            this._petShopButton.set({ x: 514, y: 1016 });
            this.spr.addChild(this._petShopButton);
            var shopFreeIcon = this._petShopButton.addIcon(HallUI_44.HallUI.getImage('hall/shop_free_icon'));
            shopFreeIcon.set({ x: 60, y: -66 });
            var shopFreeIconAnimation = createjs.Tween.get(shopFreeIcon, { loop: true }).to({ scaleX: 0.8, scaleY: 0.8 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);
            this._shopFreeIcon = shopFreeIcon;
            this._shopFreeIconAnimation = shopFreeIconAnimation;
            this._returnAtMatchButton = new ImageButton_30.ImageButton(HallUI_44.HallUI.getImage('hall/big_return_button'));
            this._returnAtMatchButton.set({ x: 320, y: 995 });
            this.spr.addChild(this._returnAtMatchButton);
            this._returnAtWeeklyTask = new ImageButton_30.ImageButton(HallUI_44.HallUI.getImage('hall/return_button'));
            this._returnAtWeeklyTask.set({ x: 320, y: 986 });
            this.spr.addChild(this._returnAtWeeklyTask);
            this._returnAtScore = new ImageButton_30.ImageButton(HallUI_44.HallUI.getImage('hall/return_to_home_button'));
            this._returnAtScore.set({
                x: 178,
                y: 1020
            });
            this.spr.addChild(this._returnAtScore);
            this._continueGameButton = new ImageButton_30.ImageButton(HallUI_44.HallUI.getImage('hall/continue_game_button'));
            this._continueGameButton.set({
                x: 452,
                y: 1020
            });
            this.spr.addChild(this._continueGameButton);
            gameButton.onClick = function () {
                HallUI_44.HallUI.instance._onClickBottomButton('start');
            };
            matchButton.onClick = function () {
                HallUI_44.HallUI.instance._onClickBottomButton('match');
            };
            this._returnAtPetButton.onClick = function () {
                HallUI_44.HallUI.instance._onClickBottomButton('returnFromPet');
            };
            this._carryButton.onClick = function () {
                HallUI_44.HallUI.instance._onClickBottomButton('carry');
            };
            this._petShopButton.onClick = function () {
                HallUI_44.HallUI.instance._onClickBottomButton('shop');
            };
            this._returnAtMatchButton.onClick = function () {
                HallUI_44.HallUI.instance._onClickBottomButton('returnFromMatch');
            };
            this._returnAtWeeklyTask.onClick = function () {
                HallUI_44.HallUI.instance._onClickBottomButton('returnFromWeeklyTask');
            };
            this._returnAtScore.onClick = function () {
                HallUI_44.HallUI.instance._onClickBottomButton('returnFromScore');
            };
            this._continueGameButton.onClick = function () {
                HallUI_44.HallUI.instance._onClickBottomButton('start');
            };
        }
        NewBottomBar.prototype.showShopFreeIcon = function (isshow) {
            this._shopFreeIcon.visible = isshow;
            this._shopFreeIconAnimation.setPaused(!isshow);
        };
        NewBottomBar.prototype.show = function (isshow) {
            this.spr.visible = isshow;
        };
        NewBottomBar.prototype.onPanelTypeChanged = function (panelType) {
            this._matchButton.visible = panelType !== 'pet' && panelType !== 'match' && panelType !== 'weekly_task' && panelType !== 'score';
            this._gameButton.visible = panelType !== 'pet' && panelType !== 'match' && panelType !== 'weekly_task' && panelType !== 'score';
            this._carryButton.visible = panelType === 'pet';
            this._petShopButton.visible = panelType === 'pet';
            this._returnAtPetButton.visible = panelType === 'pet';
            this._returnAtMatchButton.visible = panelType === 'match';
            this._returnAtWeeklyTask.visible = panelType === 'weekly_task';
            this._returnAtScore.visible = panelType === 'score';
            this._continueGameButton.visible = panelType === 'score';
        };
        return NewBottomBar;
    }());
    exports.NewBottomBar = NewBottomBar;
});
define("client/src/hall/match_ui/MatchEndPanel", ["require", "exports", "client/src/hall/HallUI", "client/src/GameLink", "client/src/FixSizeBitmap", "client/src/hall/shared/BitmapText", "client/src/util", "client/src/ImageButton"], function (require, exports, HallUI_45, GameLink_26, FixSizeBitmap, BitmapText_5, util, ImageButton_31) {
    "use strict";
    var MatchEndPanel = (function () {
        function MatchEndPanel(obj) {
            var _this = this;
            this.spr = new createjs.Container();
            var background = new createjs.Bitmap(HallUI_45.HallUI.getImage('hall/match_end_background'));
            this.spr.addChild(background);
            var backpanel = new createjs.Bitmap(HallUI_45.HallUI.getImage('hall/match_endpanel_background'));
            backpanel.set({ x: 74, y: 284 });
            this.spr.addChild(backpanel);
            var titleImage = HallUI_45.HallUI.getImage(obj.win ? 'hall/match_end_win_text' : 'hall/match_end_loss_text');
            var title = new createjs.Bitmap(titleImage);
            title.set({
                x: 320,
                y: 245,
                regX: titleImage.width / 2,
            });
            this.spr.addChild(title);
            if (obj.matchPlayerResultList) {
                //for (var i = 0; i < obj.matchPlayerResultList.length; ++i)
                for (var i = 0; i < 4; ++i) {
                    var ppp = this.createPlayerPanel(i, obj.matchPlayerResultList && obj.matchPlayerResultList[i]);
                    ppp.set({ x: 60, y: 333 + i * 104 });
                    this.spr.addChild(ppp);
                }
            }
            //buttons
            var returnButton = new ImageButton_31.ImageButton(HallUI_45.HallUI.getImage('hall/return_button'));
            returnButton.set({ x: 199, y: 860 });
            this.spr.addChild(returnButton);
            var matchAgainButton = new ImageButton_31.ImageButton(HallUI_45.HallUI.getImage('hall/match_end_match_again_button'));
            matchAgainButton.set({ x: 397, y: 860 });
            this.spr.addChild(matchAgainButton);
            returnButton.onClick = function () {
                _this.close();
                HallUI_45.HallUI.instance._onClickBottomButton('match');
            };
            matchAgainButton.onClick = function () {
                _this.close();
                HallUI_45.HallUI.instance._onClickBottomButton('match');
                var link = GameLink_26.GameLink.instance;
                if (link.lastEnterMatch) {
                    link.sendEnterMatch(link.lastEnterMatch);
                }
            };
        }
        MatchEndPanel.prototype.createPlayerPanel = function (index, p) {
            var cc = new createjs.Container();
            var self = p && p.key === GameLink_26.GameLink.instance.key;
            var background = new createjs.Bitmap(HallUI_45.HallUI.getImage(self ? 'hall/match_end_my_panel' : 'hall/match_end_other_panel'));
            cc.addChild(background);
            if (p) {
                if (!self) {
                    var addIcon = new ImageButton_31.ImageButton(HallUI_45.HallUI.getImage('hall/add_friend'));
                    addIcon.set({ x: 27, y: 49 });
                    addIcon.onClick = function () {
                        GameLink_26.GameLink.instance.sendReqAddFriend(p);
                    };
                    cc.addChild(addIcon);
                }
                //face
                var faceicon = new createjs.Bitmap(null);
                FixSizeBitmap.MakeSuitableSize(faceicon, 70, 70, HallUI_45.HallUI.getImage('hall/default_user_headicon'));
                faceicon.hitArea = new createjs.Shape();
                faceicon.set({ x: 96, y: 51 });
                var facemask = new createjs.Shape();
                var g = facemask.graphics;
                g.beginFill('white');
                g.drawRoundRect(-35, -35, 70, 70, 10);
                g.endFill();
                facemask.x = faceicon.x;
                facemask.y = faceicon.y;
                faceicon.mask = facemask;
                if (p.faceurl) {
                    var image = new Image();
                    image.src = p.faceurl;
                    faceicon.image = image;
                }
                cc.addChild(faceicon);
                //score title
                var scoreTitle = new createjs.Text('获得分数', '18px SimHei', '#00355b');
                scoreTitle.set({ x: 369, y: 25 });
                cc.addChild(scoreTitle);
                //score
                var scoreText = new BitmapText_5.BitmapText(BitmapText_5.BitmapText.buildCharDefines('0123456789,', HallUI_45.HallUI.getImage('hall/match_end_score_chars'), 18, 30));
                scoreText.text = util.intToString(p.score | 0);
                scoreText.set({ x: 169, y: 58 });
                cc.addChild(scoreText);
                //name
                var nameText = new createjs.Text('', '25px SimHei', '00355b');
                nameText.set({ x: 169, y: 23 });
                nameText.text = p.nickname || '';
                cc.addChild(nameText);
                //coin bg
                var coinBg = new createjs.Bitmap(HallUI_45.HallUI.getImage('hall/match_end_coin_bg'));
                coinBg.set({ x: 370, y: 52 });
                cc.addChild(coinBg);
                var coin = new createjs.Bitmap(HallUI_45.HallUI.getImage('hall/match_end_coin'));
                coin.set({ x: 373, y: 43 });
                cc.addChild(coin);
                var coinText = new createjs.Text('', '15px SimHei', 'white');
                coinText.set({ x: 465, y: 62 });
                coinText.textAlign = 'right';
                cc.addChild(coinText);
                coinText.text = (p.coin | 0).toString();
                if (index >= 0 && index <= 2) {
                    var medalImage = HallUI_45.HallUI.getImage('hall/match_end_medal_' + index);
                    var medal = new createjs.Bitmap(medalImage);
                    medal.set({ x: 287, y: -3 });
                    cc.addChild(medal);
                }
            }
            return cc;
        };
        MatchEndPanel.prototype.close = function () {
            if (this.spr.parent) {
                this.spr.parent.removeChild(this.spr);
            }
        };
        return MatchEndPanel;
    }());
    exports.MatchEndPanel = MatchEndPanel;
});
define("client/src/hall/need_value_dialog/Need10sDialog", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton"], function (require, exports, HallUI_46, res, ImageButton_32) {
    "use strict";
    var Need10sDialog = (function () {
        function Need10sDialog(onOk, onCancel) {
            this.spr = new createjs.Container();
            var mask = new createjs.Shape();
            {
                var g = mask.graphics;
                g.beginFill('rgba(0,0,0,0.85)');
                g.drawRect(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
            }
            mask.on('mousedown', function () { });
            this.spr.addChild(mask);
            var bg = new createjs.Bitmap(HallUI_46.HallUI.getImage('hall/+10s_dlg_bg'));
            bg.set({ x: 29, y: 232 });
            this.spr.addChild(bg);
            var okbtn = new ImageButton_32.ImageButton(HallUI_46.HallUI.getImage('hall/+10s_dlg_btn'));
            okbtn.set({ x: 325, y: 662 });
            this.spr.addChild(okbtn);
            okbtn.onClick = function () {
                if (onOk)
                    onOk();
            };
            var cancel_btn = new ImageButton_32.ImageButton(HallUI_46.HallUI.getImage('hall/+10s_dlg_cancel_btn'));
            cancel_btn.set({ x: 81, y: 278 });
            this.spr.addChild(cancel_btn);
            cancel_btn.onClick = function () {
                if (onCancel)
                    onCancel();
            };
        }
        Need10sDialog.prototype.close = function () {
            if (this.spr.parent) {
                this.spr.parent.removeChild(this.spr);
            }
        };
        return Need10sDialog;
    }());
    exports.Need10sDialog = Need10sDialog;
});
define("client/src/hall/confirm_dialog/TutorialConfirmDialog", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton"], function (require, exports, HallUI_47, resource_14, ImageButton_33) {
    "use strict";
    var TutorialConfirmDialog = (function () {
        function TutorialConfirmDialog(config) {
            var _this = this;
            this.spr = new createjs.Container();
            //black mask
            {
                var bgMask = new createjs.Shape();
                var g = bgMask.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_14.GraphicConstant.SCREEN_WIDTH, resource_14.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
                this.spr.addChild(bgMask);
                bgMask.addEventListener('mousedown', function () { });
            }
            //background
            {
                var bg = new createjs.Bitmap(HallUI_47.HallUI.getImage('hall/panel_background'));
                bg.set({ x: 35, y: 89 + 110 });
                this.spr.addChild(bg);
            }
            //title
            {
                var image = HallUI_47.HallUI.getImage('hall/help_title_text');
                var bitmap = new createjs.Bitmap(image);
                bitmap.set({
                    x: 320, y: 210 + 110,
                    regX: image.width / 2, regY: image.height / 2
                });
                this.spr.addChild(bitmap);
            }
            //text
            var text = '    需要重新进行一遍引导吗？（引\n导不会消耗体力并且无法获得结算奖\n励）';
            var text2 = new createjs.Text(text, '30px SimHei', '#142d3e');
            text2.set({ x: 70, y: 300 + 110, lineHeight: 30 });
            this.spr.addChild(text2);
            {
                var okButton = new ImageButton_33.ImageButton(HallUI_47.HallUI.getImage('hall/ok_button'));
                okButton.set({ x: 320, y: 622 + 110 });
                okButton.onClick = function () {
                    if (config.onOk)
                        config.onOk();
                    if (!config.noAutoClose)
                        _this.close();
                };
                this.spr.addChild(okButton);
            }
            {
                var btnClose = new ImageButton_33.ImageButton(HallUI_47.HallUI.getImage('hall/mail/btnclose'));
                btnClose.set({ x: resource_14.GraphicConstant.SCREEN_WIDTH / 2, y: 885 + 140 });
                this.spr.addChild(btnClose);
                btnClose.onClick = function () {
                    if (config.onCancel)
                        config.onCancel();
                    if (!config.noAutoClose)
                        _this.close();
                };
            }
        }
        TutorialConfirmDialog.prototype.close = function () {
            if (this.spr.parent)
                this.spr.parent.removeChild(this.spr);
        };
        return TutorialConfirmDialog;
    }());
    exports.TutorialConfirmDialog = TutorialConfirmDialog;
});
define("client/src/hall/HallUI", ["require", "exports", "client/src/ImageLoader", "client/src/GameStage", "client/src/hall/HallRes", "client/src/hall/HeadBarUI", "client/src/hall/friend/FriendPanel", "client/src/hall/friend/FriendInfoPanel", "client/src/hall/HeartBarUI", "client/src/hall/weekly_task/WeeklyTaskPanel", "client/src/hall/pet/PetPanel", "client/src/hall/ready_game/ReadyGamePanel", "client/src/GameLink", "client/src/hall/score/ScorePanel", "client/src/hall/mail/MailPanel", "client/src/hall/confirm_dialog/ConfirmDialog", "client/src/hall/shop/ShopUI", "client/src/SoundManager", "client/src/LoginUI", "shared/PetRules", "client/src/hall/payment/PaymentPanel", "client/src/hall/payment/PaymentMask", "client/src/hall/search/SearchFriendPanel", "client/src/hall/game_item_help/GameItemHelpPanel", "client/src/util", "client/src/hall/HallLoadUI", "client/src/hall/need_value_dialog/NeedValueDialog", "client/src/hall/gameover/HighScoreUpAnimation", "client/src/hall/gameover/HighScorePositionUpAnimation", "client/src/hall/match_ui/MatchingPanel", "client/src/hall/SmallButtonBar", "client/src/hall/match_ui/MatchPanel", "client/src/hall/activity_panel/ActivityPanel", "client/src/hall/rank_list_panel/RankListPanel", "client/src/hall/SmallBottomButtonBar", "client/src/hall/NewBottomBar", "client/src/hall/match_ui/MatchEndPanel", "client/src/hall/need_value_dialog/Need10sDialog", "client/src/hall/confirm_dialog/TutorialConfirmDialog"], function (require, exports, ImageLoader_1, GameStage_5, HallRes_1, HeadBarUI_1, FriendPanel_1, FriendInfoPanel_1, HeartBarUI_1, WeeklyTaskPanel_1, PetPanel_1, ReadyGamePanel_1, GameLink_27, ScorePanel_1, MailPanel_1, ConfirmDialog_1, ShopUI_1, SoundManager_4, LoginUI, PetRules, PaymentPanel_1, PaymentMask_1, SearchFriendPanel_1, GameItemHelpPanel_1, util, HallLoadUI_1, NeedValueDialog_1, HighScoreUpAnimation_1, HighScorePositionUpAnimation_1, MatchingPanel_1, SmallButtonBar_1, MatchPanel_1, ActivityPanel_1, RankListPanel_1, SmallBottomButtonBar_1, NewBottomBar_1, MatchEndPanel_1, Need10sDialog_1, TutorialConfirmDialog_1) {
    "use strict";
    var NORMAL_BACKGROUND_URL = 'images/hall/背景图.jpg';
    //const PET_BACKGROUND_URL = 'images/hall/1561降低.jpg';
    var LOADING_BACKGROUND_URL = 'images/海报1.jpg';
    var HallUI = (function () {
        //public get bottomBar() { return this._bottomBar; }
        function HallUI() {
            var _this = this;
            this.spr = new createjs.Container();
            this._isLoadComplete = false;
            this._petImages = [];
            this._loadUI = new HallLoadUI_1.HallLoadUI();
            this._currentFriendSort = "weekHighScore";
            window['hall'] = this;
            HallUI.instance = this;
            this._imageLoader = new ImageLoader_1.ImageLoader(HallRes_1.res);
            this._imageLoader.onComplete = function () { return _this._onLoadComplete(); };
            this._imageLoader.onError = function () { if (_this._loadUI)
                _this._loadUI._onLoadError(); };
            this._imageLoader.onProgress = function (n, total) { if (_this._loadUI)
                _this._loadUI._onLoadProgress(n, total); };
            this.spr.addChild(this._loadUI.spr);
            this._updateCssBackground();
        }
        Object.defineProperty(HallUI.prototype, "heartbar", {
            //private _delayPlayWeeklyTaskSatisfiedAnimation = false;
            //public get dailyTaskBar() { return this._dailyTaskBar; }
            get: function () { return this._heartBar; },
            enumerable: true,
            configurable: true
        });
        HallUI.prototype.show = function (isShow) {
            if (isShow === void 0) { isShow = true; }
            this.spr.visible = isShow;
            this._updateCssBackground();
        };
        HallUI.prototype.clear = function () {
        };
        HallUI.getImage = function (id) {
            return HallUI.instance.getImage(id);
        };
        HallUI.prototype.getImage = function (id) {
            return this._imageLoader.getImage(id);
        };
        HallUI.prototype.getPetImage = function (idx) {
            return this._petImages[idx];
        };
        HallUI.prototype._onLoadComplete = function () {
            console.log('HallUI: load complete');
            this._updateCssBackground();
            SoundManager_4.SoundManager.init();
            LoginUI.show();
            //is lama
            var enuid = util.getParameterByName('enuid');
            var nickname = decodeURIComponent(util.getParameterByName('nickname'));
            var face = util.getParameterByName('face');
            var type = util.getParameterByName('type');
            //console.log('type=' + type);
            if (enuid && nickname && face) {
                GameLink_27.GameLink.instance.loginLaMa(enuid, face, nickname, type);
            }
            for (var i = 0; i < PetRules.MAX_PET_COUNT; ++i) {
                this._petImages[i] = this.getImage('hall/pet' + i);
            }
            this._isLoadComplete = true;
            //init here
            this.spr.removeChild(this._loadUI.spr);
            this._loadUI = null;
            //this._bottomBar = new BottomBarUI();
            //this.spr.addChild(this._bottomBar.spr);
            this._newBottomBar = new NewBottomBar_1.NewBottomBar();
            this.spr.addChild(this._newBottomBar.spr);
            this._friendPanel = new FriendPanel_1.FriendPanel();
            this.spr.addChild(this._friendPanel.spr);
            this._weeklyTaskPanel = new WeeklyTaskPanel_1.WeeklyTaskPanel();
            this.spr.addChild(this._weeklyTaskPanel.spr);
            this._matchPanel = new MatchPanel_1.MatchPanel();
            this.spr.addChild(this._matchPanel.spr);
            this._petPanel = new PetPanel_1.PetPanel();
            this.spr.addChild(this._petPanel.spr);
            this._scorePanel = new ScorePanel_1.ScorePanel();
            this.spr.addChild(this._scorePanel.spr);
            this._readyGamePanel = new ReadyGamePanel_1.ReadyGamePanel();
            this.spr.addChild(this._readyGamePanel.spr);
            this._heartBar = new HeartBarUI_1.HeartBarUI();
            this.spr.addChild(this._heartBar.spr);
            this._smallButtonBar = new SmallButtonBar_1.SmallButtonBar();
            this.spr.addChild(this._smallButtonBar.spr);
            this._smallBottomButtonBar = new SmallBottomButtonBar_1.SmallBottomButtonBar();
            this.spr.addChild(this._smallBottomButtonBar.spr);
            //this._bottomBar.onButtonClick = n => this._onClickBottomButton(n);
            this._mailPanel = new MailPanel_1.MailPanel();
            this.spr.addChild(this._mailPanel.spr);
            this._rankListPanel = new RankListPanel_1.RankListPanel();
            this.spr.addChild(this._rankListPanel.spr);
            this._friendInfoPanel = new FriendInfoPanel_1.FriendInfoPanel();
            this.spr.addChild(this._friendInfoPanel.spr);
            this._shop = new ShopUI_1.ShopUI();
            this.spr.addChild(this._shop.spr);
            this._paymentPanel = new PaymentPanel_1.PaymentPanel();
            GameStage_5.GameStage.instance.stage.addChild(this._paymentPanel.spr);
            this._paymentMask = new PaymentMask_1.PaymentMask();
            this.spr.addChild(this._paymentMask.spr);
            this._searchFriendPanel = new SearchFriendPanel_1.SearchFriendPanel();
            this.spr.addChild(this._searchFriendPanel.spr);
            this._confirmDialog = new ConfirmDialog_1.ConfirmDialog();
            this.spr.addChild(this._confirmDialog.spr);
            this._headBar = new HeadBarUI_1.HeadBarUI();
            this.spr.addChild(this._headBar.spr);
            this._matchingPanel = new MatchingPanel_1.MatchingPanel();
            this.spr.addChild(this._matchingPanel.spr);
            this._activityPanel = new ActivityPanel_1.ActivityPanel();
            this.spr.addChild(this._activityPanel.spr);
            this._currentPanelType = 'friend';
            this._changePanelType("friend");
            //let lvPanel = new PetLevelUpPanel(PetLevelUpPanel.SAMPLE_DATA);
            //this.spr.addChild(lvPanel.spr);
            this._updateCssBackground();
            SoundManager_4.SoundManager.playBg('bgMain');
        };
        HallUI.prototype._changePanelType = function (type) {
            // heartbar 要在哪几种type的面板中显示
            var HEARTBAR_SHOW_TYPE = ["friend", "ready_game"];
            var DAILY_TASKBAR_SHOW_TYPE = ["friend", "ready_game", 'match'];
            this._smallBottomButtonBar.show(['friend', 'ready_game', 'match'].indexOf(type) >= 0);
            this._heartBar.show(HEARTBAR_SHOW_TYPE.indexOf(type) >= 0);
            //this._dailyTaskBar.show(DAILY_TASKBAR_SHOW_TYPE.indexOf(type) >= 0);
            this._smallButtonBar.spr.visible = DAILY_TASKBAR_SHOW_TYPE.indexOf(type) >= 0;
            this._friendPanel.show(type === "friend");
            this._weeklyTaskPanel.show(type === "weekly_task");
            this._petPanel.show(type === 'pet');
            this._readyGamePanel.show(type === 'ready_game');
            this._scorePanel.show(type === 'score');
            //this._bottomBar.onPanelTypeChanged(type);
            this._newBottomBar.onPanelTypeChanged(type);
            this._matchPanel.show(type === 'match');
            this._newBottomBar.show(['friend', 'ready_game', 'pet', 'match', 'weekly_task', 'score'].indexOf(type) >= 0);
            //this._bottomBar.show(type !== 'friend' && type !== 'ready_game' && type !== 'pet' && type !== 'match' && type !== 'weekly_task' && type !== 'score');
            this._smallButtonBar.onPanelChanged(type);
            if (type === 'score') {
                var snd = SoundManager_4.SoundManager.playBg('bgGameOver', true);
            }
            else if (type === 'pet') {
                SoundManager_4.SoundManager.playBg('bgPet');
            }
            else {
                SoundManager_4.SoundManager.playBg('bgMain');
            }
            /*
            if (this._delayPlayWeeklyTaskSatisfiedAnimation)
            {
                this._delayPlayWeeklyTaskSatisfiedAnimation = false;
                if (type !== 'weekly_task')
                {
                    //this.playWeeklyTaskSatisfied();
                }
            }*/
        };
        HallUI.prototype._onClickBottomButton = function (buttonName) {
            //	this._helpPanel.show(false);
            if (buttonName === 'weekly_task') {
                this._currentPanelType = 'weekly_task';
                this._changePanelType('weekly_task');
            }
            else if (buttonName === 'game') {
                if (this._currentPanelType === 'friend') {
                    this._currentPanelType = 'ready_game';
                    this._changePanelType('ready_game');
                }
                else {
                    this._currentPanelType = 'friend';
                    this._changePanelType('friend');
                }
            }
            else if (buttonName === 'start') {
                if (this._currentPanelType === 'ready_game') {
                    GameLink_27.GameLink.instance.sendReqStartGame({
                        items: this._readyGamePanel.getSelectItems()
                    });
                }
                else {
                    this._currentPanelType = 'ready_game';
                    this._changePanelType('ready_game');
                }
            }
            else if (buttonName === 'pet') {
                this._currentPanelType = 'pet';
                this._changePanelType('pet');
            }
            else if (buttonName === 'carry') {
                this._petPanel.onClickCarry();
                this._currentPanelType = 'friend';
                this._changePanelType('friend');
            }
            else if (buttonName === 'shop') {
                this._shop.show(true);
            }
            else if (buttonName === 'match') {
                this._currentPanelType = 'match';
                this._changePanelType('match');
            }
            else if (buttonName === 'returnFromPet') {
                this._currentPanelType = 'friend';
                this._changePanelType('friend');
            }
            else if (buttonName === 'returnFromMatch') {
                this._currentPanelType = 'friend';
                this._changePanelType('friend');
            }
            else if (buttonName === 'returnFromWeeklyTask') {
                this._currentPanelType = 'friend';
                this._changePanelType('friend');
            }
            else if (buttonName === 'returnFromScore') {
                this._currentPanelType = 'friend';
                this._changePanelType('friend');
            }
            this._updateCssBackground();
        };
        HallUI.prototype.showPetShop = function () {
            this._shop.show(true);
        };
        HallUI.prototype._updateCssBackground = function () {
            if (!this._isLoadComplete) {
                //GameStage.instance.setCssBackground(LOADING_BACKGROUND_URL);
                GameStage_5.GameStage.instance.setCssBackgroundImage(window['loader_image']);
                return;
            }
            if (this.spr.visible) {
                //if (this._currentPanelType === 'pet')
                //{
                //	GameStage.instance.setCssBackground(PET_BACKGROUND_URL);
                //}
                //else
                {
                    GameStage_5.GameStage.instance.setCssBackground(NORMAL_BACKGROUND_URL);
                }
            }
        };
        HallUI.prototype.showScorePanel = function (obj) {
            var _this = this;
            this._currentPanelType = 'friend';
            this._changePanelType('friend');
            //this._delayPlayWeeklyTaskSatisfiedAnimation = !!obj.weeklyTaskSatisfied;
            if (!obj.tutorial) {
                this._scorePanel.showData(obj);
                //播放分数提升和排名提升的动画
                var positionChangedObject_1 = null;
                var scoreChangedObject = null;
                if (obj.weekHighScoreChanged) {
                    positionChangedObject_1 = GameLink_27.GameLink.instance.genScorePositionChangeInfo(obj.weekHighScoreChanged.oldScore, obj.weekHighScoreChanged.newScore);
                    scoreChangedObject = {
                        oldScore: obj.weekHighScoreChanged.oldScore,
                        newScore: obj.weekHighScoreChanged.newScore,
                        type: 'weekly'
                    };
                }
                if (obj.historicalHighScoreChanged) {
                    scoreChangedObject = {
                        oldScore: obj.historicalHighScoreChanged.oldScore,
                        newScore: obj.historicalHighScoreChanged.newScore,
                        type: 'historical'
                    };
                }
                //如果两个动画都要播放，则顺序播放
                if (positionChangedObject_1 && scoreChangedObject) {
                    this.playHighScoreUpAnimation(scoreChangedObject.oldScore, scoreChangedObject.newScore, scoreChangedObject.type, function () {
                        _this.playHighScorePositionUpAnimation(positionChangedObject_1);
                    });
                }
                else {
                    if (positionChangedObject_1)
                        this.playHighScorePositionUpAnimation(positionChangedObject_1);
                    if (scoreChangedObject)
                        this.playHighScoreUpAnimation(scoreChangedObject.oldScore, scoreChangedObject.newScore, scoreChangedObject.type);
                }
            }
            if (obj.tutorial) {
                this.showTutorial(obj.tutorialGift);
            }
        };
        HallUI.prototype.showGameReadyPanel = function () {
            this._currentPanelType = 'ready_game';
            this._changePanelType('ready_game');
        };
        HallUI.prototype.showMailPanel = function () {
            this._mailPanel.show();
        };
        //为了让GameLink知道需不需要刷新邮件。
        //当邮件发生了变化的时候，如果邮件面板显示着的话，自动刷新一下
        HallUI.prototype.isMailPanelShowing = function () {
            return this._mailPanel.isShowing();
        };
        HallUI.prototype.updateMailCount = function (count) {
            this._heartBar.setMailCount(count);
        };
        HallUI.prototype.updateMail = function (mails) {
            this._mailPanel.setMails(mails);
        };
        //当玩家的基本数据发生变化的时候
        HallUI.prototype.updateBasicInfo = function () {
            this._headBar.refresh();
        };
        //由于nextHeartTime和时间有关，不能每次没事就refresh，所以独立开来
        HallUI.prototype.updateHeartInfo = function () {
            this._heartBar.refresh();
        };
        //当玩家宠物数据发生了变化
        HallUI.prototype.updatePetInfo = function () {
            this._petPanel.refresh();
            this._headBar.refresh();
            var hasLockedPet = false;
            var pets = GameLink_27.GameLink.instance.pets;
            if (pets) {
                for (var _i = 0, pets_1 = pets; _i < pets_1.length; _i++) {
                    var p = pets_1[_i];
                    if (p && typeof p.unlockPrice === 'number') {
                        hasLockedPet = true;
                    }
                }
            }
            //this._bottomBar.setPetLockIcon(hasLockedPet);
        };
        HallUI.prototype.updateWeeklyTask = function (tasks, totalCount, obj) {
            if (totalCount > 0 && tasks.length === 0) {
                this._weeklyTaskPanel.setTaskCount(1);
                this._weeklyTaskPanel.taskLines[0].setNoTask();
                this._smallButtonBar.showWeeklyTaskNewIcon(true);
                return;
            }
            var showNewIcon = false; //是不是要显示 冒险按钮上的new tip
            var weeklyTaskPrize = [];
            if (Array.isArray(obj.weeklyTaskPrize)) {
                weeklyTaskPrize.length = totalCount;
                for (var i_2 = 0; i_2 < obj.weeklyTaskPrize.length; ++i_2) {
                    var t = obj.weeklyTaskPrize[i_2];
                    if (t) {
                        weeklyTaskPrize[t.idx] = t;
                    }
                }
            }
            this._weeklyTaskPanel.setTaskCount(totalCount > tasks.length ? totalCount : tasks.length);
            var i;
            var lastRunningTask = -1;
            var endTaskCount = 0;
            for (i = 0; i < tasks.length; ++i) {
                var line = this._weeklyTaskPanel.taskLines[i];
                var task = tasks[i];
                var status_1 = task.status;
                line.idx = i;
                line.task = task;
                if (status_1 === 'end') {
                    line.setFinishedTask(task.desc);
                    ++endTaskCount;
                }
                else if (status_1 === 'satisfied') {
                    line.setSatisfisedTask(task.desc);
                    showNewIcon = true;
                }
                else if (status_1 === 'running') {
                    lastRunningTask = i;
                    if ('failCount' in task && task.failCount > 0) {
                        line.setPointTask(task.desc, task.fail, task.failCount, task.prizeType);
                    }
                    else {
                        line.setProgressTask(task.desc, task.count, task.maxCount, task.prizeType);
                    }
                }
            }
            for (; i < totalCount; ++i) {
                var line = this._weeklyTaskPanel.taskLines[i];
                if (i === tasks.length) {
                    line.setUnknownTask(true);
                }
                else if (weeklyTaskPrize[i]) {
                    line.setUnknownTask(false, weeklyTaskPrize[i].type, weeklyTaskPrize[i].count);
                }
                else {
                    line.setUnknownTask(false);
                }
            }
            if (lastRunningTask !== -1) {
                this._weeklyTaskPanel.makeTaskVisible(lastRunningTask);
            }
            this._weeklyTaskPanel.setProgress(endTaskCount, totalCount);
            this._weeklyTaskPanel.setPetProgress(endTaskCount / totalCount);
            this._weeklyTaskPanel.setTaskPrize(weeklyTaskPrize.map(function (x) { return x && x.type; }));
            this._smallButtonBar.showWeeklyTaskNewIcon(showNewIcon);
        };
        HallUI.prototype.showConfirmDialog = function (text, onOk, onCancel, config) {
            this._confirmDialog.show(text, onOk, onCancel, config);
        };
        HallUI.prototype.closeConfirmDialog = function () {
            this._confirmDialog.hide();
        };
        HallUI.prototype.showNoCoinDialog = function (text) {
            var _this = this;
            var config = { cancelImage: HallUI.getImage('hall/buy_button'), okImage: HallUI.getImage('hall/cancel_button') };
            this.showConfirmDialog(text, null, function () {
                _this.closeConfirmDialog();
                _this.showBuyCoin();
            }, config);
        };
        HallUI.prototype.showNoHeartDialog = function (text) {
            var _this = this;
            var config = { cancelImage: HallUI.getImage('hall/buy_button'), okImage: HallUI.getImage('hall/cancel_button') };
            this.showConfirmDialog(text, null, function () {
                _this.closeConfirmDialog();
                _this.showBuyHeart();
            }, config);
        };
        HallUI.prototype.showNoDiamondDialog = function (text) {
            var _this = this;
            var config = { cancelImage: HallUI.getImage('hall/buy_button'), okImage: HallUI.getImage('hall/cancel_button') };
            this.showConfirmDialog(text, null, function () {
                _this.closeConfirmDialog();
                _this.showBuyDiamond();
            }, config);
        };
        HallUI.prototype.showBuyGiftSuccess = function (obj) {
            if (obj.gift) {
                this._shop.showBuyGiftAnimation(obj.gift);
            }
        };
        HallUI.prototype.refreshFriends = function () {
            this._friendPanel.setFriends(GameLink_27.GameLink.instance.getFriendList(this._currentFriendSort));
        };
        HallUI.prototype.toggleFriendSort = function () {
            this._currentFriendSort = this._currentFriendSort === 'historicalHighScore' ? 'weekHighScore' : 'historicalHighScore';
            this.refreshFriends();
        };
        HallUI.prototype.setFriendSort = function (sortType) {
            if (this._currentFriendSort !== sortType) {
                this._currentFriendSort = sortType;
                this.refreshFriends();
            }
        };
        Object.defineProperty(HallUI.prototype, "currentFriendSort", {
            get: function () { return this._currentFriendSort; },
            enumerable: true,
            configurable: true
        });
        //当用户点击好友头像的时候，显示详细信息的面板
        HallUI.prototype.showFriendInfoPanel = function (friendKey) {
            this._friendInfoPanel.key = friendKey;
            this._friendInfoPanel.show();
            this._friendInfoPanel.clear();
            //发送一个请求并且等待回应的信息
            GameLink_27.GameLink.instance.sendQueryFriend(friendKey);
        };
        HallUI.prototype.recvFriendInfo = function (obj) {
            this._friendInfoPanel.setInfo(obj);
        };
        HallUI.prototype.showTutorial = function (hasGift) {
            //this.spr.addChild(new HallTutorial(hasGift).spr);
        };
        HallUI.prototype.showBuyCoin = function () {
            this._paymentPanel.showAsBuyCoin();
        };
        HallUI.prototype.showBuyHeart = function () {
            this._paymentPanel.showAsBuyHeart();
        };
        HallUI.prototype.showBuyDiamond = function () {
            this._paymentPanel.showAsBuyDiamond();
        };
        HallUI.prototype.showAddFriend = function () {
            this._searchFriendPanel.show();
        };
        HallUI.prototype.recvSearchFriendResult = function (ret) {
            this._searchFriendPanel.setSearchResult(ret);
        };
        HallUI.prototype.recvPlayAnimation = function (obj) {
            function remove(ss) {
                if (ss.parent) {
                    ss.parent.removeChild(ss);
                }
            }
            if (obj.type === 'buyHeart') {
                var image = this.getImage('hall/full_heart');
                var bitmap = new createjs.Bitmap(image);
                bitmap.set({
                    regX: image.width / 2,
                    regY: image.height / 2,
                    x: 317,
                    y: 459
                });
                GameStage_5.GameStage.instance.stage.addChild(bitmap);
                createjs.Tween.get(bitmap).to({ x: 418, y: 129 }, 300).call(remove, [bitmap]);
                for (var i = 1; i < 4; ++i) {
                    var bitmap2 = bitmap.clone();
                    GameStage_5.GameStage.instance.stage.addChild(bitmap2);
                    bitmap2.visible = false;
                    createjs.Tween.get(bitmap2).wait(i * 70).set({ visible: true }).to({ x: 418, y: 129 }, 300).call(remove, [bitmap2]);
                }
            }
            else if (obj.type === 'buyCoin') {
                var image = this.getImage('hall/weekly_task_prize1');
                var bitmap = new createjs.Bitmap(image);
                bitmap.set({
                    regX: image.width / 2,
                    regY: image.height / 2,
                    x: 317,
                    y: 459
                });
                GameStage_5.GameStage.instance.stage.addChild(bitmap);
                createjs.Tween.get(bitmap).to({ x: 313, y: 78 }, 300).call(remove, [bitmap]);
                for (var i = 1; i < 4; ++i) {
                    var bitmap2 = bitmap.clone();
                    GameStage_5.GameStage.instance.stage.addChild(bitmap2);
                    bitmap2.visible = false;
                    createjs.Tween.get(bitmap2).wait(i * 70).set({ visible: true }).to({ x: 313, y: 78 }, 300).call(remove, [bitmap2]);
                }
            }
        };
        HallUI.prototype.showGameItemHelp = function () {
            var p = new GameItemHelpPanel_1.GameItemHelpPanel();
            this.spr.addChild(p.spr);
        };
        //当boughtItems改变的时候调用这个
        HallUI.prototype.refreshPayment = function () {
            this._paymentPanel.refresh();
            this._newBottomBar.showShopFreeIcon(GameLink_27.GameLink.instance.hasFreeGift());
            this._shop.setIsFree(GameLink_27.GameLink.instance.hasFreeGift());
        };
        HallUI.prototype.showPaymentMask = function () {
            this._paymentMask.spr.visible = true;
        };
        HallUI.prototype.hidePaymentMask = function () {
            this._paymentMask.spr.visible = false;
        };
        HallUI.prototype.whenWantCoin = function (needValue) {
            var _this = this;
            var dlg = new NeedValueDialog_1.NeedValueDialog({
                type: 'coin',
                hasValue: GameLink_27.GameLink.instance.coin,
                needValue: needValue,
                onOk: function () { _this.showBuyCoin(); }
            });
            GameStage_5.GameStage.instance.stage.addChild(dlg.spr);
        };
        HallUI.prototype.whenWantDiamond = function (needValue) {
            var _this = this;
            var dlg = new NeedValueDialog_1.NeedValueDialog({
                type: 'diamond',
                hasValue: GameLink_27.GameLink.instance.diamond,
                needValue: needValue,
                onOk: function () { _this.showBuyDiamond(); }
            });
            GameStage_5.GameStage.instance.stage.addChild(dlg.spr);
        };
        HallUI.prototype.whenWantHeart = function (needValue) {
            var _this = this;
            var dlg = new NeedValueDialog_1.NeedValueDialog({
                type: 'heart',
                hasValue: GameLink_27.GameLink.instance.heart,
                needValue: needValue,
                onOk: function () { _this.showBuyHeart(); }
            });
            GameStage_5.GameStage.instance.stage.addChild(dlg.spr);
        };
        HallUI.prototype.whenWant10s = function (needValue, onOk, onCancel) {
            var _this = this;
            var dlg;
            var _onOk = function () {
                if (GameLink_27.GameLink.instance.diamond >= needValue) {
                    if (onOk)
                        onOk();
                    dlg.close();
                    return;
                }
                _this.showBuyDiamond();
            };
            var _onCancel = function () {
                if (onCancel)
                    onCancel();
                dlg.close();
            };
            dlg = new Need10sDialog_1.Need10sDialog(_onOk, _onCancel);
            GameStage_5.GameStage.instance.stage.addChild(dlg.spr);
        };
        HallUI.prototype.playHighScoreUpAnimation = function (from, to, type, onAnimationEnd) {
            var anim = new HighScoreUpAnimation_1.HighScoreUpAnimation({ scoreFrom: from, scoreTo: to, type: type, onAnimationEnd: onAnimationEnd });
            this.spr.addChild(anim.spr);
        };
        HallUI.prototype.playHighScorePositionUpAnimation = function (obj) {
            var anim = new HighScorePositionUpAnimation_1.HighScorePositionUpAnimation(obj);
            this.spr.addChild(anim.spr);
        };
        /*
            playWeeklyTaskSatisfied()
            {
                let image = HallUI.getImage('hall/weekly_task_satisfied_label');
                let bitmap = new createjs.Bitmap(image);
                bitmap.set({
                    regX: image.width / 2,
                    regY: image.height / 2,
                    scaleX: 0,
                    scaleY: 0,
                    x: 76,
                    y: 880
                });
                this.spr.addChild(bitmap);
                createjs.Tween.get(bitmap).to({ x: 224, y: 777, scaleX: 1, scaleY: 1 }, 1000).wait(1000).to({
                    scaleX: 0,
                    scaleY: 0,
                    x: 76,
                    y: 880
                }, 1000).call(() =>
                {
                    this.spr.removeChild(bitmap);
                });;
            }
        */
        HallUI.prototype.showMatchingPanel = function (isShow, count, type) {
            if (isShow) {
                this._matchingPanel.show();
                this._matchingPanel.setMatchingPlayerCount(count);
                if (type === '11') {
                    this._matchingPanel.setTwoPlayersMode();
                }
                else {
                    this._matchingPanel.setFourPlayersMode();
                }
            }
            else {
                this._matchingPanel.hide();
            }
        };
        HallUI.prototype.updateMatchPanel = function (players) {
            this._matchingPanel && this._matchingPanel.update(players);
        };
        HallUI.prototype.showActivityPanel = function () {
            this._activityPanel.show(true);
        };
        HallUI.prototype.showRankListPanel = function () {
            this._rankListPanel.show(true);
        };
        HallUI.prototype.refreshRankListPanel = function () {
            this._rankListPanel.refresh();
        };
        HallUI.prototype.showHelp = function () {
            var dlg = new TutorialConfirmDialog_1.TutorialConfirmDialog({
                onOk: function () {
                    GameLink_27.GameLink.instance.sendReqTutorialPlay();
                }
            });
            this.spr.addChild(dlg.spr);
        };
        HallUI.prototype.showMatchEndPanel = function (obj) {
            var panel = new MatchEndPanel_1.MatchEndPanel(obj);
            this.spr.addChild(panel.spr);
        };
        return HallUI;
    }());
    exports.HallUI = HallUI;
});
define("client/src/game/GameImageLoader", ["require", "exports", "client/src/resource", "client/src/resource", "client/src/ImageLoader", "client/src/game/Ball", "client/src/util", "client/src/hall/HallUI"], function (require, exports, res, resource_15, ImageLoader_2, Ball_2, util, HallUI_48) {
    "use strict";
    /**
     * 负责载入所有图片，并且预先计算所有旋转好的图片
     */
    var GameImageLoader = (function () {
        function GameImageLoader(items, ballItems) {
            var _this = this;
            this.spr = new createjs.Container();
            this._cleared = false;
            this._ballItemProcessIndex = 0;
            this._items = items.slice();
            this._ballItems = ballItems.slice();
            for (var _i = 0, _a = this._ballItems; _i < _a.length; _i++) {
                var ballItem = _a[_i];
                if (!ballItem.id)
                    ballItem.id = ballItem.src;
                this._items.push({
                    id: ballItem.id,
                    src: ballItem.src
                });
            }
            this._loader = new ImageLoader_2.ImageLoader(this._items);
            this._loader.onComplete = function () { return _this._onLoadComplete(); };
            this._loader.onError = function () { return _this._onLoadError(); };
            this._loader.onProgress = function (a, b) { return _this._onLoadProgress(a, b); };
            //ui
            this._background = new createjs.Shape();
            {
                var g = this._background.graphics;
                g.beginFill('rgba(0,0,0,0.8)');
                g.drawRect(0, 0, resource_15.GraphicConstant.SCREEN_WIDTH, resource_15.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
            }
            this._label = new createjs.Text('正在寻找果冻', 23 * res.GLOBAL_SCALE + "px SimHei");
            this._label.color = 'rgba(255,255,255,1)';
            this._label.textAlign = 'center';
            this._label.x = resource_15.GraphicConstant.SCREEN_WIDTH / 2;
            this._label.y = resource_15.GraphicConstant.SCREEN_HEIGHT * 0.4;
            //icon
            var icon = new createjs.Bitmap(HallUI_48.HallUI.instance.getPetImage(0));
            icon.set({ x: 256, y: 220, scaleX: 1.5, scaleY: 1.5 });
            this.spr.addChild(icon);
            var y0 = icon.y;
            var y1 = y0 - 20;
            this._iconTween = createjs.Tween.get(icon, { loop: true }).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(100).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(5000);
            this.spr.addChild(this._background);
            this.spr.addChild(this._label);
            this.spr.addChild(icon);
        }
        GameImageLoader.prototype._onLoadProgress = function (n, total) {
            var pp = (n / total * 100) | 0;
            this.setText("\u6B63\u5728\u5BFB\u627E\u679C\u51BB... (" + pp + "%)");
        };
        GameImageLoader.prototype._onLoadComplete = function () {
            this.setText("\u8F7D\u5165\u6E38\u620F\u8D44\u6E90\u5B8C\u6210");
            var ids = this._ballItems.map(function (item) { return item.id; });
            Ball_2.clearImageCacheExcept(ids);
            this._processBallImage();
        };
        GameImageLoader.prototype._onLoadError = function () {
            this._iconTween.setPaused(true);
            this.setText("\u8F7D\u5165\u6E38\u620F\u8D44\u6E90\u5931\u8D25");
        };
        GameImageLoader.prototype.setText = function (text) {
            this._label.text = text;
        };
        GameImageLoader.prototype._processBallImage = function () {
            var _this = this;
            if (this._cleared)
                return;
            var ballItems = this._ballItems;
            if (this._ballItemProcessIndex >= ballItems.length) {
                if (this.onComplete) {
                    this._iconTween.setPaused(true);
                    this.setText('请等待游戏初始化完成.');
                    this.onComplete();
                }
                return;
            }
            var item = ballItems[this._ballItemProcessIndex];
            var image = this._loader.getImage(item.id);
            util.assert(image, "image " + item.src + " must be exists");
            for (var i = 0; i < 360; ++i) {
                Ball_2.cacheImageRotate(item.id, image, item.anchorX, item.anchorY, i);
            }
            this._ballItemProcessIndex++;
            var pp = (this._ballItemProcessIndex / this._ballItems.length * 100) | 0;
            this.setText("\u6B63\u5728\u6295\u653E\u679C\u51BB...(" + pp + "%)");
            setTimeout(function () { return _this._processBallImage(); }, 20);
        };
        return GameImageLoader;
    }());
    exports.GameImageLoader = GameImageLoader;
});
define("client/src/MiniImageLoader", ["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * 简单的ImageLoader
     * 在init的时候尝试载入图片
     * 图片载入完成后会调用回掉函数，让你处理图片（缩放或切切切），结果保存在result.
     * 所以，可以查看result来判断图片是不是载入，如果没有载入，则就不显示了吧
     */
    var MiniImageLoader = (function () {
        function MiniImageLoader(src, proc) {
            this.src = src;
            this.proc = proc;
        }
        MiniImageLoader.prototype.init = function () {
            var _this = this;
            if (!this.image) {
                this.image = new Image();
                this.image.src = this.src;
                this.image.onload = function () {
                    _this.onLoadSuccess();
                };
                this.image.onerror = function () {
                    console.log('图片载入失败:' + _this.src);
                    _this.image = null; //简单的重试机制，下一次init的时候重新载入吧!
                };
            }
        };
        MiniImageLoader.prototype.onLoadSuccess = function () {
            this.result = this.proc(this.image);
        };
        return MiniImageLoader;
    }());
    exports.MiniImageLoader = MiniImageLoader;
});
/*

export function getScore(combo: number, count: number): number
{
    --combo;
    if (combo < 0) combo = 0;
    else if (combo >= scores.length) combo = scores.length - 1;

    let arr = scores[combo];
    count -= 3;
    if (count < 0) count = 0;
    else if (count >= arr.length) count = arr.length - 1;
    return arr[count] | 0;
}
*/
define("client/src/game/GameRules", ["require", "exports"], function (require, exports) {
    "use strict";
    var COIN_GET = [
        0,
        0, 0, 0,
        1,
        3,
        5,
        7,
        10,
        13,
        16,
        21,
        26,
        31,
        36,
        46,
    ];
    function getCoin(linkCount) {
        if (linkCount <= 1)
            return 0;
        if (linkCount < COIN_GET.length)
            return COIN_GET[linkCount];
        if (linkCount >= 16 && linkCount <= 29) {
            return (46 + (linkCount - 15) * 10);
        }
        return (198 + (linkCount - 30) * 12);
    }
    exports.getCoin = getCoin;
    function getComboY(n) {
        if (n <= 1)
            return 1;
        return 1.1 + 0.01 * (n - 1);
    }
    exports.getComboY = getComboY;
    function getLinkCountX(n) {
        if (n < 3)
            return 0;
        var i = n - 3;
        if (i < LINK_COUNT_X_VALUE.length)
            return LINK_COUNT_X_VALUE[i];
        return LINK_COUNT_X_VALUE[LINK_COUNT_X_VALUE.length - 1];
    }
    exports.getLinkCountX = getLinkCountX;
    var LINK_COUNT_X_VALUE = [300,
        700,
        1300,
        2100,
        3100,
        4600,
        6100,
        7600,
        9600,
        11600,
        13600,
        15600,
        18100,
        20600,
        23100,
        25600,
        28100,
        31100,
        34100,
        37100,
        40100,
        43100,
        46100,
        49100,
        52100,
        55100,
        58100,
        61600,
        65100,
        68600,
        72100,
        75600,
        79100,
        82600,
        86100,
        89600,
        93100,
        96600,
        100100,
        103600,
        107100,
        110600,
        114100,
        117600,
        121100,
        124600,
        128100,
        131600,
    ];
});
define("client/src/game/LineRenderer", ["require", "exports", "client/src/resource"], function (require, exports, res) {
    "use strict";
    var LineRenderer = (function (_super) {
        __extends(LineRenderer, _super);
        function LineRenderer() {
            _super.call(this);
            this.lineWidth = 20;
            this.lineWidth = 20 * res.GLOBAL_SCALE;
        }
        LineRenderer.prototype.isVisible = function () {
            return true;
        };
        LineRenderer.prototype.draw = function (ctx, ignoreCache) {
            if (this.lines && this.lines.length >= 2) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.lineWidth = this.lineWidth;
                for (var i = 1; i < this.lines.length; ++i) {
                    var p0 = this.lines[i - 1];
                    var p1 = this.lines[i];
                    var dx = p1.x - p0.x;
                    var dy = p1.y - p0.y;
                    var vLength = Math.sqrt(dx * dx + dy * dy);
                    var v = { x: -dy / vLength * this.lineWidth, y: dx / vLength * this.lineWidth };
                    /*ctx.strokeStyle = grad;
                    ctx.beginPath();
                    ctx.moveTo(p0.x,p0.y);
                    ctx.lineTo(p1.x,p1.y);
                    ctx.stroke();*/
                    var add = function (a, b) { return { x: a.x + b.x, y: a.y + b.y }; };
                    var sub = function (a, b) { return { x: a.x - b.x, y: a.y - b.y }; };
                    {
                        var hv = { x: v.x / 2, y: v.y / 2 };
                        var v0 = add(p0, hv);
                        var v1 = add(p1, hv);
                        var v2 = sub(p1, hv);
                        var v3 = sub(p0, hv);
                        var grad = ctx.createLinearGradient(v2.x, v2.y, v1.x, v1.y);
                        grad.addColorStop(0, "rgba(255,255,255,0)");
                        grad.addColorStop(0.45, "rgba(3,159,255,1)");
                        grad.addColorStop(0.5, "rgba(205,255,255,1)");
                        grad.addColorStop(0.55, "rgba(3,159,255,1)");
                        grad.addColorStop(1, "rgba(255,255,255,0)");
                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.moveTo(v0.x, v0.y);
                        ctx.lineTo(v1.x, v1.y);
                        ctx.lineTo(v2.x, v2.y);
                        ctx.lineTo(v3.x, v3.y);
                    }
                    ctx.fill();
                }
            }
            return true;
        };
        return LineRenderer;
    }(createjs.DisplayObject));
    exports.LineRenderer = LineRenderer;
});
define("client/src/game/ScoreControl", ["require", "exports", "client/src/game/GameUtil"], function (require, exports, GameUtil) {
    "use strict";
    var SET_VALUE_DELAY = 1000;
    var ScoreControl = (function () {
        function ScoreControl(font) {
            this.showValue = 0;
            this.realValue = 0;
            this.spr = new createjs.Text('0', font, 'white');
            this.spr.textAlign = 'right';
        }
        ScoreControl.prototype.update = function () {
        };
        ScoreControl.prototype.addValue = function (n, delay) {
            var _this = this;
            this.realValue += n;
            if (this.digitTween) {
                this.digitTween.setPaused(true);
                this.digitTween = null;
            }
            var obj = new GameUtil.ScoreTweenHelper(this.showValue, function (val) {
                _this.showValue = val;
                _this.spr.text = GameUtil.intToString(_this.showValue);
            });
            var tween = this.digitTween = createjs.Tween.get(obj);
            if (delay && delay > 0) {
            }
            tween.to({ value: this.realValue }, SET_VALUE_DELAY);
        };
        return ScoreControl;
    }());
    exports.ScoreControl = ScoreControl;
});
define("client/src/game/SkillButton", ["require", "exports", "client/src/resource", "client/src/SoundManager"], function (require, exports, res, SoundManager_5) {
    "use strict";
    var SkillButton = (function () {
        function SkillButton() {
            this._maskRadius = 0;
            this._showEnergy = 0;
            this._mouseDown = false;
            this._maxEnergy = 12;
            this.spr = new createjs.Container();
        }
        SkillButton.prototype.init = function (icon, bg1, bg2, bg3) {
            var _this = this;
            var width;
            var height;
            var bitmap1 = new createjs.Bitmap(bg1);
            bitmap1.regX = bg1.width / 2;
            bitmap1.regY = bg1.height / 2;
            width = bg1.width;
            height = bg1.height;
            var bitmap2 = new createjs.Bitmap(bg2);
            bitmap2.regX = bg2.width / 2;
            bitmap2.regY = bg2.height / 2;
            this._mask = bitmap2.mask = new createjs.Shape();
            this._maskRadius = Math.max(bg2.width, bg2.height) * 1.5; //1.5 === sqrt(2)
            this._bg2 = bitmap2;
            var iconBitmap = new createjs.Bitmap(icon);
            iconBitmap.regX = icon.width / 2;
            iconBitmap.regY = icon.height / 2;
            this._iconBitmap = iconBitmap;
            var iconY = -5;
            this._iconBitmap.y = iconY;
            var bitmap3 = new createjs.Bitmap(bg3);
            bitmap3.regX = bg3.width / 2;
            bitmap3.regY = bg3.height / 2;
            this._bg3 = bitmap3;
            this.spr.addChild(bitmap1);
            this.spr.addChild(bitmap2);
            this.spr.addChild(bitmap3);
            this.spr.addChild(iconBitmap);
            this.spr.mouseChildren = false;
            this.spr.addEventListener('mousedown', function () {
                _this._mouseDown = true;
                _this._iconBitmap.y = iconY + 5 * res.GLOBAL_SCALE;
            });
            this.spr.addEventListener('pressup', function () {
                _this._mouseDown = false;
                _this._iconBitmap.y = iconY;
                if (_this.isEnergyFull()) {
                    if (_this.onClick)
                        _this.onClick();
                }
            });
            var shape = new createjs.Shape();
            this.spr.hitArea = shape;
            {
                var g = shape.graphics;
                g.beginFill('white');
                g.drawRect(-width / 2, -height / 2, width, height);
                g.endFill();
            }
            var y0 = this._iconBitmap.y;
            var y1 = y0 - 20;
            this._iconAnimation = createjs.Tween.get(this._iconBitmap, { loop: true }).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(100).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(5000 / 3);
            this._iconAnimation.setPaused(true);
            this._draw();
        };
        SkillButton.prototype.addEnergy = function (n) {
            var MAX_ENERGY = this.getMaxEnergy();
            if (n > 0 && this._showEnergy < MAX_ENERGY) {
                this._showEnergy += n;
                if (this._showEnergy > MAX_ENERGY) {
                    this._showEnergy = MAX_ENERGY;
                }
                if (this._showEnergy === MAX_ENERGY) {
                    SoundManager_5.SoundManager.playEffect('skillReady');
                }
                this._draw();
            }
        };
        SkillButton.prototype.clearEnergy = function () {
            if (this._showEnergy != 0) {
                this._showEnergy = 0;
                this._draw();
            }
        };
        SkillButton.prototype.isEnergyFull = function () {
            return this._showEnergy >= this.getMaxEnergy();
        };
        SkillButton.prototype.getMaxEnergy = function () {
            return this._maxEnergy;
        };
        SkillButton.prototype.setMaxEnergy = function (eng) {
            this._maxEnergy = eng | 0;
            if (this._maxEnergy == 0)
                this._maxEnergy = 1;
        };
        SkillButton.prototype._draw = function () {
            var g = this._mask.graphics;
            g.clear();
            if (this._showEnergy > 0) {
                this._bg2.visible = true;
                var percent = this._showEnergy / this.getMaxEnergy();
                var p0 = -Math.PI * 0.5;
                var p1 = p0 + percent * Math.PI * 2;
                g.beginFill('white');
                g.moveTo(0, 0);
                g.arc(0, 0, this._maskRadius, p0, p1, false);
                g.lineTo(0, 0);
                g.endFill();
            }
            else {
                this._bg2.visible = false;
            }
            this._bg3.visible = this._showEnergy >= this._maxEnergy;
            if (this._showEnergy >= this.getMaxEnergy()) {
                this._iconAnimation.setPaused(false);
            }
            else {
                this._iconAnimation.setPosition(0, 0);
                this._iconAnimation.setPaused(true);
            }
        };
        return SkillButton;
    }());
    exports.SkillButton = SkillButton;
});
define("client/src/game/skill/IGameSkill", ["require", "exports"], function (require, exports) {
    "use strict";
    var EmptySkill = (function () {
        function EmptySkill() {
        }
        EmptySkill.prototype.init = function (game) { };
        /**清理 */
        EmptySkill.prototype.clear = function () { };
        /**图像资源 */
        EmptySkill.prototype.getSkillResource = function () { return []; };
        EmptySkill.prototype.update = function () { };
        /**是否要阻止用户的操作 */
        EmptySkill.prototype.isPreventUserInteract = function () { return false; };
        EmptySkill.prototype.isPreventPhysics = function () { return false; };
        EmptySkill.prototype.isPreventGameOver = function () { return false; };
        /**是否在释放中 */
        EmptySkill.prototype.isCasting = function () { return false; };
        /**释放技能 */
        EmptySkill.prototype.startSkill = function () { };
        EmptySkill.prototype.getMaxEnergy = function () { return 12; };
        EmptySkill.prototype.triggerSkillEnd = function () { };
        EmptySkill.prototype.triggerClick = function (pt) { };
        return EmptySkill;
    }());
    exports.EmptySkill = EmptySkill;
});
define("client/src/game/skill/BaseSkill", ["require", "exports", "client/src/resource", "client/src/hall/HallUI", "shared/PetSkillDesc"], function (require, exports, res, HallUI_49, PetSkillDesc_2) {
    "use strict";
    var GC = res.GraphicConstant;
    //const SKILL_DURATION = 1.0;
    var BaseSkill = (function () {
        function BaseSkill() {
            this.spr = new createjs.Container();
            this._SKILL_EFFECT_PERCENT = 2 / 3;
            this._SKILL_DURATION = 3.0;
            //旋转的背景
            this._backgroundRotateBitmap = new createjs.Bitmap(null);
            this._iconBitmap = new createjs.Bitmap(null);
            this._isStarted = false;
            this._startTick = 0;
            this._effectTick = 0;
            this._endTick = 0;
            this._center = {
                x: GC.SCREEN_WIDTH / 2,
                y: GC.SCREEN_HEIGHT / 2 + 50 * res.GLOBAL_SCALE
            };
            this._energy = 12;
            this.spr.visible = false;
            this.spr.addChild(this._backgroundRotateBitmap);
            this.spr.addChild(this._iconBitmap);
        }
        BaseSkill.prototype.init = function (game) {
            this._game = game;
            var petid = -1;
            try {
                petid = game._gameStartInfo.pets[0];
            }
            catch (e) { }
            if (PetSkillDesc_2.PetSkillDesc[petid]) {
                this._energy = PetSkillDesc_2.PetSkillDesc[petid].energy;
            }
        };
        BaseSkill.prototype.clear = function () {
        };
        BaseSkill.prototype.getSkillResource = function () {
            return [
                { id: 'images/Skill/技能特效.png', src: 'images/Skill/技能特效.png' }
            ];
        };
        BaseSkill.prototype.update = function () {
            if (this._isStarted) {
                this._updateIconBitmap();
                this._backgroundRotateBitmap.rotation += 2;
                this._backgroundRotateBitmap.visible = this._game.tick < this._effectTick;
                if (this._game.tick == this._effectTick) {
                    this._takeEffect();
                }
            }
            if (this._isStarted && this._game.tick >= this._endTick) {
                this.spr.visible = false;
                this._applySkillEffect();
                this._isStarted = false;
            }
        };
        BaseSkill.prototype._updateIconBitmap = function () {
            var bitmap = this._iconBitmap;
            if (!bitmap.image) {
                var image = bitmap.image = HallUI_49.HallUI.instance.getPetImage(this._game.mainPetId);
                if (image) {
                    bitmap.regX = image.width / 2;
                    bitmap.regY = image.height / 2;
                    bitmap.scaleX = 3;
                    bitmap.scaleY = 3;
                }
            }
            var p0 = res.POSITIONS.SKILL_BUTTON;
            var p1 = this._center;
            p1 = { x: p1.x, y: p1.y - 40 - 50 };
            var tick = this._game.tick - this._startTick;
            var tick2 = this._effectTick - this._startTick;
            var p = tick / tick2;
            if (p >= 1)
                p = 1;
            var EAMOUNT = 0.8;
            if (p <= 1 - EAMOUNT) {
                p = p / (1 - EAMOUNT);
                bitmap.x = p0.x + (p1.x - p0.x) * p;
                bitmap.y = p0.y + (p1.y - p0.y) * p;
            }
            else {
                var ease = createjs.Ease.getElasticOut(1.5, 0.3);
                p = 1 - (1 - p) / EAMOUNT;
                bitmap.x = p1.x;
                bitmap.y = p1.y + 40 * ease(p);
            }
            bitmap.visible = p < 1;
        };
        BaseSkill.prototype.isPreventUserInteract = function () {
            return this.isCasting();
        };
        BaseSkill.prototype.isPreventPhysics = function () {
            return this.isCasting();
        };
        BaseSkill.prototype.isCasting = function () {
            return this._isStarted;
        };
        BaseSkill.prototype.isPreventGameOver = function () {
            return this.isCasting();
        };
        BaseSkill.prototype.startSkill = function () {
            if (!this._isStarted) {
                this._isStarted = true;
                this._startTick = this._game.tick;
                this._effectTick = this._game.tick + (this._SKILL_DURATION * this._SKILL_EFFECT_PERCENT / res.GraphicConstant.TICK_TIME) | 0;
                this._endTick = this._game.tick + (this._SKILL_DURATION / res.GraphicConstant.TICK_TIME) | 0;
                //中间旋转的东西 
                if (!this._backgroundRotateBitmap.image) {
                    var bitmap = this._backgroundRotateBitmap;
                    var image = bitmap.image = this._game.getImage('images/Skill/技能特效.png');
                    bitmap.regX = image.width / 2;
                    bitmap.regY = image.height / 2;
                    bitmap.x = GC.SCREEN_WIDTH / 2;
                    bitmap.y = GC.SCREEN_HEIGHT / 2;
                    bitmap.scaleX = GC.SCREEN_HEIGHT / image.width * 1.45;
                    bitmap.scaleY = GC.SCREEN_HEIGHT / image.height * 1.45;
                    bitmap.compositeOperation = 'lighter';
                }
                this.spr.visible = true;
            }
        };
        //在中间的那一帧调用
        BaseSkill.prototype._takeEffect = function () {
        };
        //在最后调用的
        BaseSkill.prototype._applySkillEffect = function () {
        };
        BaseSkill.prototype.getMaxEnergy = function () { return this._energy; };
        BaseSkill.prototype.triggerSkillEnd = function () { };
        BaseSkill.prototype.triggerClick = function (pt) { };
        return BaseSkill;
    }());
    exports.BaseSkill = BaseSkill;
});
define("client/src/game/skill/BaseTransformBallSkill", ["require", "exports", "client/src/game/skill/BaseSkill", "client/src/game/Ball"], function (require, exports, BaseSkill_1, Ball_3) {
    "use strict";
    exports.Ball = Ball_3.Ball;
    var BaseTransformBallSkill = (function (_super) {
        __extends(BaseTransformBallSkill, _super);
        function BaseTransformBallSkill() {
            _super.call(this);
            this._SKILL_EFFECT_PERCENT = 2 / 4;
            this._SKILL_DURATION = 4.0;
        }
        BaseTransformBallSkill.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret = ret.concat([
                { id: 'skill_ball_indicator', src: 'images/Skill/game_skill_eff_piglet_03.png' },
                { id: 'skill_ball_indicator_white', src: 'images/Skill/game_skill_eff_piglet_04.png' },
            ]);
            return ret;
        };
        BaseTransformBallSkill.prototype.update = function () {
            _super.prototype.update.call(this);
            if (this._isStarted) {
                var tick = this._game.tick - this._startTick;
                var effectTick = this._effectTick - this._startTick;
                if (tick >= effectTick) {
                    var pp = (tick - effectTick) / (this._endTick - this._effectTick);
                    pp *= 4; //这里加速一下，随便调整一下
                    if (pp > 1)
                        pp = 1;
                    this.showIndicatorEffect(pp);
                }
            }
            else {
                this.hideIndicatorEffect();
            }
        };
        BaseTransformBallSkill.prototype._takeEffect = function () {
            var balls = this.getTransformBalls();
            this._createIndicatorEffect(balls);
            for (var _i = 0, balls_1 = balls; _i < balls_1.length; _i++) {
                var ball = balls_1[_i];
                ball.skillHighlight = true;
                ball.noEnergy = true;
            }
        };
        BaseTransformBallSkill.prototype._applySkillEffect = function () {
            var balls = [];
            for (var _i = 0, _a = this._game.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (ball.skillHighlight) {
                    ball.skillHighlight = false;
                    balls.push(ball);
                }
            }
            this._game.transformToMainColor(balls);
        };
        //下面三个需要在子类中重载
        BaseTransformBallSkill.prototype.getTransformBalls = function () {
            return [];
        };
        BaseTransformBallSkill.prototype._createIndicatorEffect = function (balls) {
            var image1 = this._game.getImage('skill_ball_indicator');
            var image2 = this._game.getImage('skill_ball_indicator_white');
            var spr = this.spr;
            var _loop_3 = function(ball) {
                pos = ball.position;
                var bitmap1 = new createjs.Bitmap(image1);
                var bitmap2 = new createjs.Bitmap(image2);
                bitmap1.set({
                    x: pos.x,
                    y: pos.y,
                    regX: image1.width / 2,
                    regY: image1.height / 2,
                });
                bitmap2.set({
                    x: pos.x,
                    y: pos.y,
                    regX: image2.width / 2,
                    regY: image2.height / 2
                });
                spr.addChild(bitmap1);
                spr.addChild(bitmap2);
                createjs.Tween.get(bitmap1).to({ scaleX: 1.5, scaleY: 1.5 }, 700).to({ alpha: 0 }, 400);
                createjs.Tween.get(bitmap2).to({ alpha: 0, scaleX: 1.5, scaleY: 1.5 }, 700).wait(400).call(function () {
                    spr.removeChild(bitmap1);
                    spr.removeChild(bitmap2);
                });
            };
            var pos;
            for (var _i = 0, balls_2 = balls; _i < balls_2.length; _i++) {
                var ball = balls_2[_i];
                _loop_3(ball);
            }
        };
        BaseTransformBallSkill.prototype.showIndicatorEffect = function (percent) {
        };
        BaseTransformBallSkill.prototype.hideIndicatorEffect = function () {
        };
        return BaseTransformBallSkill;
    }(BaseSkill_1.BaseSkill));
    exports.BaseTransformBallSkill = BaseTransformBallSkill;
});
define("client/src/game/skill/Skill1", ["require", "exports", "client/src/game/skill/BaseTransformBallSkill", "client/src/resource", "shared/PetSkillDesc"], function (require, exports, BaseTransformBallSkill_1, resource_16, PetSkillDesc_3) {
    "use strict";
    //转化画面中央的果冻
    var Skill1 = (function (_super) {
        __extends(Skill1, _super);
        function Skill1() {
            _super.call(this);
            this._radius = 160;
            this._effectBitmap = new createjs.Bitmap(null);
            this.spr.addChildAt(this._effectBitmap, 1);
            this._effectBitmap.visible = false;
        }
        Skill1.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_3.PetSkillDesc[0];
            this._radius = desc.skillParam1 / 2 + (this._game.getSkillLevel() - 1) * (desc.skillParamGrown / 2);
        };
        Skill1.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret.push({ id: 'images/Skill/技能范围指示器.png', src: 'images/Skill/技能范围指示器.png' });
            return ret;
        };
        Skill1.prototype.getTransformBalls = function () {
            var balls = this._game.balls;
            var main = this._game.getMainBallDefine();
            var sqrRadius = this._radius * this._radius;
            var center = this._center;
            var ret = [];
            var y0 = this._center.y - this._radius;
            var y1 = this._center.y + this._radius;
            for (var _i = 0, balls_3 = balls; _i < balls_3.length; _i++) {
                var ball = balls_3[_i];
                var pos = ball.position;
                if (!ball.skillHighlight && ball.status == 'normal' && !ball.isBomb && ball.position.y >= y0 && ball.position.y <= y1) {
                    ret.push(ball);
                }
            }
            return ret;
        };
        Skill1.prototype.showIndicatorEffect = function (percent) {
            var bitmap = this._effectBitmap;
            var image;
            if (!bitmap.image) {
                image = bitmap.image = this._game.getImage('images/Skill/技能范围指示器.png');
                bitmap.regX = image.width / 2;
                bitmap.regY = image.height / 2;
                bitmap.x = this._center.x;
                bitmap.y = this._center.y;
            }
            else {
                image = bitmap.image;
            }
            bitmap.visible = true;
            var sizeX = resource_16.GraphicConstant.SCREEN_WIDTH;
            var sizeY = this._radius * 2;
            bitmap.scaleX = sizeX / image.width;
            bitmap.scaleY = sizeY / image.height * percent;
        };
        Skill1.prototype.hideIndicatorEffect = function () {
            this._effectBitmap.visible = false;
        };
        return Skill1;
    }(BaseTransformBallSkill_1.BaseTransformBallSkill));
    exports.Skill1 = Skill1;
});
define("client/src/game/skill/Skill2", ["require", "exports", "client/src/game/skill/BaseTransformBallSkill", "client/src/util", "shared/PetSkillDesc"], function (require, exports, BaseTransformBallSkill_2, util, PetSkillDesc_4) {
    "use strict";
    //转化画面中央的果冻
    var Skill2 = (function (_super) {
        __extends(Skill2, _super);
        function Skill2() {
            _super.call(this);
            this._radius = 160;
            this._effectBitmap = new createjs.Bitmap(null);
            this.spr.addChildAt(this._effectBitmap, 1);
            this._effectBitmap.visible = false;
        }
        Skill2.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_4.PetSkillDesc[1];
            this._radius = desc.skillParam1 / 2 + (this._game.getSkillLevel() - 1) * (desc.skillParamGrown / 2);
        };
        Skill2.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret.push({ id: 'images/Skill/圆形范围指示器.png', src: 'images/Skill/圆形范围指示器.png' });
            return ret;
        };
        Skill2.prototype.getTransformBalls = function () {
            var balls = this._game.balls;
            var main = this._game.getMainBallDefine();
            var sqrRadius = this._radius * this._radius;
            var center = this._center;
            var ret = [];
            for (var _i = 0, balls_4 = balls; _i < balls_4.length; _i++) {
                var ball = balls_4[_i];
                var pos = ball.position;
                if (!ball.skillHighlight && ball.status == 'normal' && !ball.isBomb && util.sqrDistance(ball.position, center) < sqrRadius) {
                    ret.push(ball);
                }
            }
            return ret;
        };
        Skill2.prototype.showIndicatorEffect = function (percent) {
            var bitmap = this._effectBitmap;
            var image;
            if (!bitmap.image) {
                image = bitmap.image = this._game.getImage('images/Skill/圆形范围指示器.png');
                bitmap.regX = image.width / 2;
                bitmap.regY = image.height / 2;
                bitmap.x = this._center.x;
                bitmap.y = this._center.y;
            }
            else {
                image = bitmap.image;
            }
            bitmap.visible = true;
            var size = this._radius * 2;
            bitmap.scaleX = size / image.width * percent;
            bitmap.scaleY = size / image.height * percent;
        };
        Skill2.prototype.hideIndicatorEffect = function () {
            this._effectBitmap.visible = false;
        };
        return Skill2;
    }(BaseTransformBallSkill_2.BaseTransformBallSkill));
    exports.Skill2 = Skill2;
});
define("client/src/game/skill/BaseBombBallSkill", ["require", "exports", "client/src/game/skill/BaseSkill", "client/src/game/Ball"], function (require, exports, BaseSkill_2, Ball_4) {
    "use strict";
    exports.Ball = Ball_4.Ball;
    var BaseBombBallSkill = (function (_super) {
        __extends(BaseBombBallSkill, _super);
        function BaseBombBallSkill() {
            _super.call(this);
            this._isBallNoEnergy = false; /**由子类设置，爆炸的球是不是没有能量的 */
            this._SKILL_EFFECT_PERCENT = 0.8;
        }
        BaseBombBallSkill.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            return ret;
        };
        BaseBombBallSkill.prototype.update = function () {
            _super.prototype.update.call(this);
            if (this._isStarted) {
                var tick = this._game.tick - this._startTick;
                var effectTick = this._effectTick - this._startTick;
                if (tick >= effectTick) {
                    var pp = (tick - effectTick) / (this._endTick - this._effectTick);
                    if (pp > 1)
                        pp = 1;
                    this.showIndicatorEffect(pp);
                }
            }
            else {
                this.hideIndicatorEffect();
            }
        };
        BaseBombBallSkill.prototype._takeEffect = function () {
            var balls = this.getBombBalls();
            for (var _i = 0, balls_5 = balls; _i < balls_5.length; _i++) {
                var ball = balls_5[_i];
                ball.skillHighlight = true;
                ball.noEnergy = this._isBallNoEnergy;
            }
            //let balls: Ball[] = [];
            balls = [];
            for (var _a = 0, _b = this._game.balls; _a < _b.length; _a++) {
                var ball = _b[_a];
                if (ball.skillHighlight) {
                    ball.skillHighlight = false;
                    if (!ball.isBomb && ball.status === 'normal') {
                        balls.push(ball);
                    }
                }
            }
            this._game.bombTheBalls(balls);
            for (var _c = 0, balls_6 = balls; _c < balls_6.length; _c++) {
                var ball = balls_6[_c];
                ball.bombTick += 40 * 0.3;
            }
            this._currentBombBalls = balls;
        };
        BaseBombBallSkill.prototype._applySkillEffect = function () {
            /*
            let balls = [];
            for(let ball of this._game.balls)
            {
                if (ball.skillHighlight)
                {
                    ball.skillHighlight = false;
                    if (!ball.isBomb && ball.status === 'normal')
                    {
                        balls.push(ball);
                    }
                }
            }
            this._game.bombTheBalls(balls);
            */
        };
        //下面三个需要在子类中重载
        BaseBombBallSkill.prototype.getBombBalls = function () {
            return [];
        };
        BaseBombBallSkill.prototype.showIndicatorEffect = function (percent) {
        };
        BaseBombBallSkill.prototype.hideIndicatorEffect = function () {
        };
        return BaseBombBallSkill;
    }(BaseSkill_2.BaseSkill));
    exports.BaseBombBallSkill = BaseBombBallSkill;
});
define("client/src/game/skill/Skill3", ["require", "exports", "client/src/game/skill/BaseBombBallSkill", "shared/PetSkillDesc"], function (require, exports, BaseBombBallSkill_1, PetSkillDesc_5) {
    "use strict";
    //随机消除一种宠物（被消除宠物不会增加技能条）
    var Skill3 = (function (_super) {
        __extends(Skill3, _super);
        function Skill3() {
            _super.call(this);
            this._maxCount = 998;
        }
        Skill3.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_5.PetSkillDesc[2];
            //this._maxCount = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
            this._energy = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
            //console.log('当前技能所需能量为:' + this._energy);
            this._isBallNoEnergy = true;
        };
        Skill3.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret.push({ id: 'skill/圆形范围指示器', src: 'images/Skill/圆形范围指示器.png' });
            return ret;
        };
        Skill3.prototype._takeEffect = function () {
            var _this = this;
            _super.prototype._takeEffect.call(this);
            var balls = this._currentBombBalls;
            var circleImage = this._game.getImage('skill/圆形范围指示器');
            var _loop_4 = function(ball) {
                var bitmap = new createjs.Bitmap(circleImage);
                bitmap.set({
                    regX: circleImage.width / 2,
                    regY: circleImage.height / 2,
                    x: ball.position.x,
                    y: ball.position.y,
                    scaleX: 0, scaleY: 0,
                });
                toScale = 80 / circleImage.width * 1.5;
                this_2.spr.addChild(bitmap);
                createjs.Tween.get(bitmap).to({ scaleX: toScale, scaleY: toScale }, 600).call(function () { return _this.spr.removeChild(bitmap); });
            };
            var this_2 = this;
            var toScale;
            for (var _i = 0, balls_7 = balls; _i < balls_7.length; _i++) {
                var ball = balls_7[_i];
                _loop_4(ball);
            }
        };
        Skill3.prototype.getBombBalls = function () {
            var balls = this._game.balls.filter(function (x) { return !x.isBomb; });
            //随机选一个颜色
            if (balls.length === 0)
                return [];
            var color = balls[(Math.random() * balls.length) | 0].color;
            balls = balls.filter(function (x) { return x.color === color && x.status === 'normal'; });
            if (balls.length > this._maxCount) {
                var count = balls.length;
                for (var i = 0; i < count; ++i) {
                    var j = (Math.random() * count) | 0;
                    if (i != j) {
                        var tmp = balls[i];
                        balls[i] = balls[j];
                        balls[j] = tmp;
                    }
                }
                balls.length = this._maxCount;
            }
            return balls;
        };
        return Skill3;
    }(BaseBombBallSkill_1.BaseBombBallSkill));
    exports.Skill3 = Skill3;
});
define("client/src/game/skill/Skill4", ["require", "exports", "client/src/game/skill/BaseBombBallSkill", "shared/PetSkillDesc"], function (require, exports, BaseBombBallSkill_2, PetSkillDesc_6) {
    "use strict";
    //随机消除一部分果冻
    var Skill4 = (function (_super) {
        __extends(Skill4, _super);
        function Skill4() {
            _super.call(this);
            this._maxCount = 10;
        }
        Skill4.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_6.PetSkillDesc[3];
            this._maxCount = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        Skill4.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret.push({ id: 'skill/圆形范围指示器', src: 'images/Skill/圆形范围指示器.png' });
            return ret;
        };
        Skill4.prototype._takeEffect = function () {
            var _this = this;
            _super.prototype._takeEffect.call(this);
            var balls = this._currentBombBalls;
            var circleImage = this._game.getImage('skill/圆形范围指示器');
            var _loop_5 = function(ball) {
                var bitmap = new createjs.Bitmap(circleImage);
                bitmap.set({
                    regX: circleImage.width / 2,
                    regY: circleImage.height / 2,
                    x: ball.position.x,
                    y: ball.position.y,
                    scaleX: 0, scaleY: 0,
                });
                toScale = 80 / circleImage.width * 1.5;
                this_3.spr.addChild(bitmap);
                createjs.Tween.get(bitmap).to({ scaleX: toScale, scaleY: toScale }, 600).call(function () { return _this.spr.removeChild(bitmap); });
            };
            var this_3 = this;
            var toScale;
            for (var _i = 0, balls_8 = balls; _i < balls_8.length; _i++) {
                var ball = balls_8[_i];
                _loop_5(ball);
            }
        };
        Skill4.prototype.getBombBalls = function () {
            //选出可以炸的球
            var balls = this._game.balls.filter(function (x) { return !x.isBomb && x.status === 'normal'; });
            //随机一下
            for (var i = 0; i < balls.length; ++i) {
                var a = (Math.random() * balls.length) | 0;
                var b = (Math.random() * balls.length) | 0;
                if (a !== b && (a < balls.length && b < balls.length)) {
                    var tmp = balls[a];
                    balls[a] = balls[b];
                    balls[b] = tmp;
                }
            }
            if (balls.length > this._maxCount) {
                balls.length = this._maxCount;
            }
            return balls;
        };
        return Skill4;
    }(BaseBombBallSkill_2.BaseBombBallSkill));
    exports.Skill4 = Skill4;
});
define("client/src/game/skill/Skill5", ["require", "exports", "client/src/game/skill/BaseBombBallSkill", "client/src/util", "shared/PetSkillDesc"], function (require, exports, BaseBombBallSkill_3, util, PetSkillDesc_7) {
    "use strict";
    //消除画面中央圆形区域的所有宠物。
    var Skill5 = (function (_super) {
        __extends(Skill5, _super);
        function Skill5() {
            _super.call(this);
            this._radius = 160;
            this._effectBitmap = new createjs.Bitmap(null);
            this.spr.addChildAt(this._effectBitmap, 1);
            this._effectBitmap.visible = false;
        }
        Skill5.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_7.PetSkillDesc[4];
            this._radius = desc.skillParam1 / 2 + (this._game.getSkillLevel() - 1) * (desc.skillParamGrown / 2);
        };
        Skill5.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret.push({ id: 'images/Skill/圆形范围指示器.png', src: 'images/Skill/圆形范围指示器.png' });
            return ret;
        };
        Skill5.prototype.getBombBalls = function () {
            var balls = this._game.balls;
            var main = this._game.getMainBallDefine();
            var sqrRadius = this._radius * this._radius;
            var center = this._center;
            var ret = [];
            for (var _i = 0, balls_9 = balls; _i < balls_9.length; _i++) {
                var ball = balls_9[_i];
                var pos = ball.position;
                if (!ball.skillHighlight && ball.status == 'normal' && !ball.isBomb && util.sqrDistance(ball.position, center) < sqrRadius) {
                    ret.push(ball);
                }
            }
            return ret;
        };
        Skill5.prototype.showIndicatorEffect = function (percent) {
            var bitmap = this._effectBitmap;
            var image;
            if (!bitmap.image) {
                image = bitmap.image = this._game.getImage('images/Skill/圆形范围指示器.png');
                bitmap.regX = image.width / 2;
                bitmap.regY = image.height / 2;
                bitmap.x = this._center.x;
                bitmap.y = this._center.y;
            }
            else {
                image = bitmap.image;
            }
            bitmap.visible = true;
            var size = this._radius * 2;
            bitmap.scaleX = size / image.width * percent;
            bitmap.scaleY = size / image.height * percent;
        };
        Skill5.prototype.hideIndicatorEffect = function () {
            this._effectBitmap.visible = false;
        };
        return Skill5;
    }(BaseBombBallSkill_3.BaseBombBallSkill));
    exports.Skill5 = Skill5;
});
define("client/src/game/skill/Skill6", ["require", "exports", "client/src/game/skill/BaseBombBallSkill", "client/src/resource", "shared/PetSkillDesc"], function (require, exports, BaseBombBallSkill_4, resource_17, PetSkillDesc_8) {
    "use strict";
    //消除屏幕两列宠物
    var Skill6 = (function (_super) {
        __extends(Skill6, _super);
        function Skill6() {
            _super.call(this);
            this._x0 = 0;
            this._x1 = 1;
            this._width = 70;
            this._effectBitmap1 = new createjs.Bitmap(null);
            this._effectBitmap2 = new createjs.Bitmap(null);
            this.spr.addChildAt(this._effectBitmap1, 1);
            this._effectBitmap1.visible = false;
            this.spr.addChildAt(this._effectBitmap2, 1);
            this._effectBitmap2.visible = false;
        }
        Skill6.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_8.PetSkillDesc[5];
            this._width = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
            this._x0 = resource_17.GraphicConstant.SCREEN_WIDTH / 3;
            this._x1 = resource_17.GraphicConstant.SCREEN_WIDTH / 3 * 2;
        };
        Skill6.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret.push({ id: 'images/Skill/技能范围指示器.png', src: 'images/Skill/技能范围指示器.png' });
            return ret;
        };
        Skill6.prototype.getBombBalls = function () {
            var balls = this._game.balls;
            var main = this._game.getMainBallDefine();
            var x0 = this._x0;
            var x1 = this._x1;
            var radius = this._width / 2;
            var ret = [];
            for (var _i = 0, balls_10 = balls; _i < balls_10.length; _i++) {
                var ball = balls_10[_i];
                var pos = ball.position;
                if (!ball.skillHighlight &&
                    (Math.abs(pos.x - x0) <= radius || Math.abs(pos.x - x1) <= radius) &&
                    ball.status == 'normal' && !ball.isBomb) {
                    ret.push(ball);
                }
            }
            return ret;
        };
        Skill6.prototype.showIndicatorEffect = function (percent) {
            var bitmap1 = this._effectBitmap1;
            var bitmap2 = this._effectBitmap2;
            var image;
            if (!bitmap1.image) {
                image = bitmap1.image = bitmap2.image = this._game.getImage('images/Skill/技能范围指示器.png');
                bitmap1.regX = bitmap2.regX = image.width / 2;
                bitmap1.regY = bitmap2.regY = 0;
                bitmap1.scaleX = bitmap2.scaleX = this._width / image.width;
                bitmap1.x = this._x0;
                bitmap2.x = this._x1;
            }
            else {
                image = bitmap1.image;
            }
            bitmap1.visible = true;
            bitmap2.visible = true;
            var pp = (percent * resource_17.GraphicConstant.SCREEN_HEIGHT) / image.height;
            bitmap1.scaleY = bitmap2.scaleY = pp;
        };
        Skill6.prototype.hideIndicatorEffect = function () {
            this._effectBitmap1.visible = false;
            this._effectBitmap2.visible = false;
        };
        return Skill6;
    }(BaseBombBallSkill_4.BaseBombBallSkill));
    exports.Skill6 = Skill6;
});
define("client/src/game/skill/Skill7", ["require", "exports", "client/src/game/skill/BaseBombBallSkill", "client/src/resource", "shared/PetSkillDesc"], function (require, exports, BaseBombBallSkill_5, resource_18, PetSkillDesc_9) {
    "use strict";
    //将中间两排高度的所有宠物转化为自身宠物。（被转化的宠物被消除不会增加宠物技能条）两个球的直径
    var Skill7 = (function (_super) {
        __extends(Skill7, _super);
        function Skill7() {
            _super.call(this);
            this._height = 150;
            this._effectBitmap1 = new createjs.Bitmap(null);
            this._effectBitmap2 = new createjs.Bitmap(null);
            this.spr.addChildAt(this._effectBitmap1, 1);
            this._effectBitmap1.visible = false;
            this.spr.addChildAt(this._effectBitmap2, 1);
            this._effectBitmap2.visible = false;
        }
        Skill7.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_9.PetSkillDesc[6];
            this._height = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        Skill7.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret.push({ id: 'images/Skill/技能范围指示器.png', src: 'images/Skill/技能范围指示器.png' });
            return ret;
        };
        Skill7.prototype.getBombBalls = function () {
            var balls = this._game.balls;
            var main = this._game.getMainBallDefine();
            var height = this._height;
            var y0 = this._center.y - height / 2;
            var y1 = this._center.y + height / 2;
            var ret = [];
            for (var _i = 0, balls_11 = balls; _i < balls_11.length; _i++) {
                var ball = balls_11[_i];
                var pos = ball.position;
                if (!ball.skillHighlight && pos.y >= y0 && pos.y <= y1 && ball.status == 'normal' && !ball.isBomb) {
                    ret.push(ball);
                }
            }
            return ret;
        };
        Skill7.prototype.showIndicatorEffect = function (percent) {
            var bitmap1 = this._effectBitmap1;
            var bitmap2 = this._effectBitmap2;
            var image; //= this._game.getImage('images/Skill/技能范围指示器.png');
            if (!bitmap1.image) {
                image = bitmap1.image = bitmap2.image = this._game.getImage('images/Skill/技能范围指示器.png');
                bitmap1.scaleX = bitmap2.scaleX = resource_18.GraphicConstant.SCREEN_WIDTH / image.width;
                bitmap1.regY = bitmap2.regY = image.height / 2;
                bitmap2.scaleY = -1;
            }
            image = bitmap1.image;
            var centery = this._center.y;
            bitmap1.y = centery - (percent * this._height / 2);
            bitmap2.y = centery + (percent * this._height / 2);
            bitmap1.visible = bitmap2.visible = true;
            /*
            let bitmap = this._effectBitmap;
            let image: HTMLImageElement;
            if (!bitmap.image)
            {
                image = bitmap.image = this._game.getImage('images/Skill/技能范围指示器.png');
                bitmap.regX = 0;
                bitmap.regY = image.height / 2;
                bitmap.x = 0;
                bitmap.y = this._center.y;
                bitmap.scaleY = this._height / image.height;
            }
            else
            {
                image = bitmap.image as HTMLImageElement;
            }
            let maxscale = GC.SCREEN_WIDTH / image.width;
            bitmap.visible = true;
            bitmap.scaleX = maxscale * percent;*/
        };
        Skill7.prototype.hideIndicatorEffect = function () {
            this._effectBitmap1.visible = false;
            this._effectBitmap2.visible = false;
        };
        return Skill7;
    }(BaseBombBallSkill_5.BaseBombBallSkill));
    exports.Skill7 = Skill7;
});
define("client/src/game/skill/Skill8", ["require", "exports", "client/src/game/skill/BaseBombBallSkill", "client/src/resource", "shared/PetSkillDesc", "client/src/resource"], function (require, exports, BaseBombBallSkill_6, resource_19, PetSkillDesc_10, res) {
    "use strict";
    /**
     * 返回一个函数，用来计算点到直线的距离
     */
    function distanceCalc(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var length = Math.sqrt(dx * dx + dy * dy);
        return function (x0, y0) {
            return Math.abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / length;
        };
    }
    //消除一个X形
    var Skill8 = (function (_super) {
        __extends(Skill8, _super);
        function Skill8() {
            _super.call(this);
            this._y0 = 283;
            this._y1 = 767;
            this._width = 60;
            //	private _effectBitmap1 = new createjs.Bitmap(null);
            //	private _effectBitmap2 = new createjs.Bitmap(null);
            this._effectBitmaps = [];
            //		this.spr.addChildAt(this._effectBitmap1, 1);
            //		this._effectBitmap1.visible = false;
            //		this.spr.addChildAt(this._effectBitmap2, 1);
            //		this._effectBitmap2.visible = false;
            //this._SKILL_EFFECT_PERCENT = 0.1;
            //this._SKILL_DURATION = 5;
            this._SKILL_DURATION = 2;
        }
        Skill8.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_10.PetSkillDesc[7];
            this._width = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
            this._y0 *= res.GLOBAL_SCALE;
            this._y1 *= res.GLOBAL_SCALE;
        };
        Skill8.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret.push({ id: 'images/Skill/技能范围指示器.png', src: 'images/Skill/技能范围指示器.png' });
            return ret;
        };
        Skill8.prototype.getBombBalls = function () {
            var balls = this._game.balls;
            //let main = this._game.getMainBallDefine();
            var radius = this._width / 2;
            var y0 = this._y0;
            var y1 = this._y1;
            var calc1 = distanceCalc(0, y0, resource_19.GraphicConstant.SCREEN_WIDTH, y1);
            var calc2 = distanceCalc(resource_19.GraphicConstant.SCREEN_WIDTH, y0, 0, y1);
            var ret = [];
            for (var _i = 0, balls_12 = balls; _i < balls_12.length; _i++) {
                var ball = balls_12[_i];
                var pos = ball.position;
                if (!ball.skillHighlight &&
                    (calc1(pos.x, pos.y) <= radius || calc2(pos.x, pos.y) <= radius) &&
                    ball.status == 'normal' && !ball.isBomb) {
                    ret.push(ball);
                }
            }
            return ret;
        };
        Skill8.prototype.showIndicatorEffect = function (percent) {
            var bitmap1;
            var bitmap2;
            var bitmap3;
            var bitmap4;
            var y0 = this._y0;
            var y1 = this._y1;
            var center = {
                x: resource_19.GraphicConstant.SCREEN_WIDTH / 2,
                y: (this._y0 + this._y1) / 2
            };
            if (this._effectBitmaps.length == 0) {
                var image = this._game.getImage('images/Skill/技能范围指示器.png');
                var wantLength = Math.sqrt(resource_19.GraphicConstant.SCREEN_WIDTH * resource_19.GraphicConstant.SCREEN_WIDTH + (y1 - y0) * (y1 - y0)) + 80;
                bitmap1 = new createjs.Bitmap(image);
                bitmap1.set({
                    regX: image.width / 2,
                    regY: image.height / 2,
                    scaleX: wantLength / image.width,
                    scaleY: 2,
                    x: center.x,
                    y: center.y,
                    visible: false,
                });
                bitmap2 = bitmap1.clone();
                bitmap3 = bitmap1.clone();
                bitmap4 = bitmap1.clone();
                bitmap1.rotation = Math.atan2(this._y1 - this._y0, resource_19.GraphicConstant.SCREEN_WIDTH) * 180 / Math.PI;
                bitmap2.rotation = Math.atan2(this._y1 - this._y0, -resource_19.GraphicConstant.SCREEN_WIDTH) * 180 / Math.PI + 180;
                bitmap3.rotation = Math.atan2(this._y1 - this._y0, resource_19.GraphicConstant.SCREEN_WIDTH) * 180 / Math.PI + 180;
                bitmap4.rotation = Math.atan2(this._y1 - this._y0, -resource_19.GraphicConstant.SCREEN_WIDTH) * 180 / Math.PI;
                this.spr.addChild(bitmap1, bitmap2, bitmap3, bitmap4);
                this._effectBitmaps.push(bitmap1, bitmap2, bitmap3, bitmap4);
            }
            else {
                bitmap1 = this._effectBitmaps[0];
                bitmap2 = this._effectBitmaps[1];
                bitmap3 = this._effectBitmaps[2];
                bitmap4 = this._effectBitmaps[3];
            }
            var lerp = function (pos1, pos2, pp) {
                return {
                    x: pos1.x + pp * (pos2.x - pos1.x),
                    y: pos1.y + pp * (pos2.y - pos1.y),
                };
            };
            bitmap1.visible = true;
            bitmap2.visible = true;
            bitmap3.visible = true;
            bitmap4.visible = true;
            var vx = resource_19.GraphicConstant.SCREEN_WIDTH;
            var vy = y1 - y0;
            var vlen = Math.sqrt(vx * vx + vy * vy);
            vx /= vlen;
            vy /= vlen;
            var v1 = { x: vy, y: -vx };
            var moveDist = this._width * 0.5;
            var pos1 = {
                x: center.x + v1.x * moveDist,
                y: center.y + v1.y * moveDist,
            };
            var pos3 = {
                x: center.x - v1.x * moveDist,
                y: center.y - v1.y * moveDist,
            };
            bitmap1.set(lerp(center, pos1, percent));
            bitmap3.set(lerp(center, pos3, percent));
            var v2 = { x: -v1.x, y: v1.y };
            var pos2 = {
                x: center.x + v2.x * moveDist,
                y: center.y + v2.y * moveDist,
            };
            var pos4 = {
                x: center.x - v2.x * moveDist,
                y: center.y - v2.y * moveDist,
            };
            bitmap2.set(lerp(center, pos2, percent));
            bitmap4.set(lerp(center, pos4, percent));
        };
        Skill8.prototype.hideIndicatorEffect = function () {
            for (var _i = 0, _a = this._effectBitmaps; _i < _a.length; _i++) {
                var bmp = _a[_i];
                bmp.visible = false;
            }
        };
        return Skill8;
    }(BaseBombBallSkill_6.BaseBombBallSkill));
    exports.Skill8 = Skill8;
});
define("client/src/game/skill/Skill9", ["require", "exports", "client/src/game/skill/BaseSkill", "shared/PetSkillDesc"], function (require, exports, BaseSkill_3, PetSkillDesc_11) {
    "use strict";
    var Skill9 = (function (_super) {
        __extends(Skill9, _super);
        function Skill9() {
            _super.call(this);
            this._time = 3;
            this._SKILL_EFFECT_PERCENT = 0.6;
        }
        Skill9.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_11.PetSkillDesc[8];
            this._time = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        Skill9.prototype.startSkill = function () {
            if (!this._isStarted) {
            }
            _super.prototype.startSkill.call(this);
        };
        //在中间的那一帧调用
        Skill9.prototype._takeEffect = function () {
            var _this = this;
            var bitmap = this._iconBitmap.clone();
            bitmap.visible = true;
            var text = new createjs.Text("Time+" + this._time + "s", '700 40px SimHei', 'white');
            text.set({ x: 74, y: 55 });
            text.textAlign = 'center';
            text.shadow = new createjs.Shadow('black', 2, 2, 1);
            this.spr.addChild(text);
            text.visible = false;
            this.spr.addChild(bitmap);
            createjs.Tween.get(bitmap).to({ x: 74, y: 74, rotation: 360 * 4, scaleX: 0.2, scaleY: 0.2 }, 500).call(function () {
                _this.spr.removeChild(bitmap);
                text.visible = true;
            }).wait(500).call(function () {
                createjs.Tween.get(text).to({ y: text.y - 15, alpha: 0 }, 200).call(function () {
                    _this.spr.removeChild(text);
                });
                ;
            });
        };
        //在最后调用的
        Skill9.prototype._applySkillEffect = function () {
            this._game.addGameTime(this._time);
        };
        return Skill9;
    }(BaseSkill_3.BaseSkill));
    exports.Skill9 = Skill9;
});
define("client/src/game/skill/Skill10", ["require", "exports", "client/src/game/skill/BaseSkill", "shared/PetSkillDesc"], function (require, exports, BaseSkill_4, PetSkillDesc_12) {
    "use strict";
    //随机选几个球，变成炸弹
    var Skill10 = (function (_super) {
        __extends(Skill10, _super);
        function Skill10() {
            _super.call(this);
        }
        Skill10.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            //	let desc = PetSkillDesc[8];
            //	this._time = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        Skill10.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret.push({ id: 'skill/圆形范围指示器', src: 'images/Skill/圆形范围指示器.png' });
            return ret;
        };
        //在中间的那一帧调用
        Skill10.prototype._takeEffect = function () {
            var _this = this;
            var count = 0;
            var desc = PetSkillDesc_12.PetSkillDesc[9];
            var p1 = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
            var p2 = desc.skillParam2 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
            count = (p1 + (p2 - p1 + 1) * Math.random()) | 0; //[p1,p2]之间的整数
            //选出可以变成炸弹的球
            var balls = this._game.balls.filter(function (x) { return !x.isBomb && x.status === 'normal'; });
            //随机一下
            for (var i = 0; i < balls.length; ++i) {
                var a = (Math.random() * balls.length) | 0;
                var b = (Math.random() * balls.length) | 0;
                if (a !== b && (a < balls.length && b < balls.length)) {
                    var tmp = balls[a];
                    balls[a] = balls[b];
                    balls[b] = tmp;
                }
            }
            if (balls.length > count)
                balls.length = count;
            for (var _i = 0, balls_13 = balls; _i < balls_13.length; _i++) {
                var ball = balls_13[_i];
                ball.skillHighlight = true;
            }
            var circleImage = this._game.getImage('skill/圆形范围指示器');
            var _loop_6 = function(ball) {
                var bitmap = new createjs.Bitmap(circleImage);
                bitmap.set({
                    regX: circleImage.width / 2,
                    regY: circleImage.height / 2,
                    x: ball.position.x,
                    y: ball.position.y,
                    scaleX: 0, scaleY: 0,
                });
                toScale = 80 / circleImage.width * 1.5;
                this_4.spr.addChild(bitmap);
                createjs.Tween.get(bitmap).to({ scaleX: toScale, scaleY: toScale }, 600).call(function () { return _this.spr.removeChild(bitmap); });
            };
            var this_4 = this;
            var toScale;
            for (var _a = 0, balls_14 = balls; _a < balls_14.length; _a++) {
                var ball = balls_14[_a];
                _loop_6(ball);
            }
        };
        //在最后调用的
        Skill10.prototype._applySkillEffect = function () {
            var balls = [];
            for (var _i = 0, _a = this._game.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (ball.skillHighlight) {
                    ball.skillHighlight = false;
                    balls.push(ball);
                }
            }
            this._game.turnBallToBomb(balls);
        };
        return Skill10;
    }(BaseSkill_4.BaseSkill));
    exports.Skill10 = Skill10;
});
define("client/src/game/skill/BaseTimeSkill", ["require", "exports", "client/src/game/skill/IGameSkill", "client/src/resource", "client/src/resource", "client/src/hall/HallUI"], function (require, exports, IGameSkill_1, resource_20, res, HallUI_50) {
    "use strict";
    var ANIMATION_DURATION = 2;
    var BaseTimeSkill = (function (_super) {
        __extends(BaseTimeSkill, _super);
        function BaseTimeSkill() {
            _super.apply(this, arguments);
            this.spr = new createjs.Container();
            this.bgSpr = new createjs.Container();
            this.duration = 4; //由子类设置，每次持续的时间
            this.isStarted = false;
            this.remainTime = 0;
            this._iconBitmap = new createjs.Bitmap(null);
            this._backgroundRotateBitmap = new createjs.Bitmap(null);
            this._center = {
                x: resource_20.GraphicConstant.SCREEN_WIDTH / 2,
                y: resource_20.GraphicConstant.SCREEN_HEIGHT / 2 + 50 * res.GLOBAL_SCALE
            };
        }
        BaseTimeSkill.prototype.init = function (game) {
            this.game = game;
            {
                var bitmap = this.blinkBitmap = new createjs.Bitmap(null);
                //bitmap.scaleX = GC.SCREEN_WIDTH / bitmap.image.width;
                //bitmap.scaleY = GC.SCREEN_HEIGHT / bitmap.image.height;
                bitmap.alpha = 0;
                bitmap.visible = false;
                this.spr.addChild(bitmap);
            }
            this.blinkTween = createjs.Tween.get(this.blinkBitmap, { loop: true, paused: true })
                .to({ alpha: 1 }, 500)
                .to({ alpha: 0 }, 500);
            this.spr.addChild(this._backgroundRotateBitmap);
            this.spr.addChild(this._iconBitmap);
            this.bgSpr.visible = false;
            this._bgShape = new createjs.Shape();
            this.bgSpr.addChild(this._bgShape);
        };
        BaseTimeSkill.prototype.clear = function () {
            this._stopSkill();
        };
        BaseTimeSkill.prototype.getSkillResource = function () {
            return [
                { id: 'images/Skill/技能特效.png', src: 'images/Skill/技能特效.png' },
                { id: 'time_skill_blink_bitmap', src: 'images/Game/_0054_图层-7.png' },
                { id: 'time_skill_bg', src: 'images/Skill/game_skill_eff_donald.png' },
            ];
        };
        BaseTimeSkill.prototype.update = function () {
            if (this.isStarted) {
                var tick = this.game.tick;
                //这里是起始放动画的时间
                if (tick < this._effectTick) {
                    this._iconBitmap.visible = true;
                    //中间旋转的东西 
                    if (!this._backgroundRotateBitmap.image) {
                        var bitmap = this._backgroundRotateBitmap;
                        var image = bitmap.image = this.game.getImage('images/Skill/技能特效.png');
                        bitmap.regX = image.width / 2;
                        bitmap.regY = image.height / 2;
                        bitmap.x = resource_20.GraphicConstant.SCREEN_WIDTH / 2;
                        bitmap.y = resource_20.GraphicConstant.SCREEN_HEIGHT / 2;
                        bitmap.scaleX = resource_20.GraphicConstant.SCREEN_HEIGHT / image.width * 1.45;
                        bitmap.scaleY = resource_20.GraphicConstant.SCREEN_HEIGHT / image.height * 1.45;
                        bitmap.compositeOperation = 'lighter';
                    }
                    this._backgroundRotateBitmap.visible = true;
                    this._backgroundRotateBitmap.rotation += 2;
                    this._updateIconBitmap();
                    if (this._timeBox)
                        this._timeBox.spr.visible = false;
                }
                else if (tick == this._effectTick) {
                    this._iconBitmap.visible = false;
                    this._backgroundRotateBitmap.visible = false;
                    this.blinkBitmap.visible = true;
                    this.blinkTween.setPaused(false);
                    if (!this.blinkBitmap.image) {
                        var image = this.blinkBitmap.image = this.game.getImage('time_skill_blink_bitmap');
                        this.blinkBitmap.scaleX = resource_20.GraphicConstant.SCREEN_WIDTH / image.width;
                        this.blinkBitmap.scaleY = resource_20.GraphicConstant.SCREEN_HEIGHT / image.height;
                    }
                    if (!this._timeBox) {
                        this._timeBox = new TimeBox(this._iconBitmap.image, this.game.getImage('images/Game/skillbg1.png'), this.game.getImage('images/Game/skillbg2.png'));
                        this._timeBox.spr.set({ x: 320, y: 172 });
                        this.spr.addChild(this._timeBox.spr);
                    }
                    this._timeBox.spr.visible = true;
                    this._timeBox.setPercent(1);
                    this.start();
                }
                //技能持续的阶段
                if (tick >= this._effectTick) {
                    this.remainTime -= this.game.getDeltaTime() / 1000;
                    this._timeBox.setPercent(this.remainTime / this.duration);
                    if (this.remainTime <= 0) {
                        this._stopSkill();
                    }
                    this.bgSpr.visible = true;
                    {
                        var shape = this._bgShape;
                        var g = shape.graphics;
                        g.clear();
                        var mtx = new createjs.Matrix2D();
                        mtx.identity();
                        mtx.translate(0, -tick * 2);
                        g.beginBitmapFill(this.game.getImage('time_skill_bg'), null, mtx);
                        g.drawRect(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
                        g.endFill();
                    }
                }
                else {
                    this.bgSpr.visible = false;
                }
            }
            else {
                this.bgSpr.visible = false;
            }
        };
        BaseTimeSkill.prototype.isPreventUserInteract = function () {
            return this.isStarted && this.game.tick < this._effectTick;
        };
        BaseTimeSkill.prototype.isPreventPhysics = function () {
            return this.isStarted && this.game.tick < this._effectTick;
        };
        BaseTimeSkill.prototype.isPreventGameOver = function () {
            return this.isStarted && this.game.tick < this._effectTick;
        };
        BaseTimeSkill.prototype.isCasting = function () {
            return this.isStarted;
        };
        BaseTimeSkill.prototype.startSkill = function () {
            if (!this.isStarted) {
                this.spr.visible = true;
                this._startTick = this.game.tick;
                this._effectTick = this._startTick + ((ANIMATION_DURATION / resource_20.GraphicConstant.TICK_TIME) | 0);
                this.isStarted = true;
                this.remainTime = this.duration;
            }
            else {
                this.remainTime = this.duration;
            }
        };
        BaseTimeSkill.prototype.getMaxEnergy = function () {
            return 12;
        };
        BaseTimeSkill.prototype.triggerSkillEnd = function () { };
        BaseTimeSkill.prototype._stopSkill = function () {
            if (this.isStarted) {
                this.isStarted = false;
                this.blinkBitmap.visible = false;
                this.blinkTween.setPaused(true);
                this.stop();
                this.spr.visible = false;
            }
        };
        BaseTimeSkill.prototype._updateIconBitmap = function () {
            var bitmap = this._iconBitmap;
            if (!bitmap.image) {
                var image = bitmap.image = HallUI_50.HallUI.instance.getPetImage(this.game.mainPetId);
                if (image) {
                    bitmap.regX = image.width / 2;
                    bitmap.regY = image.height / 2;
                    bitmap.scaleX = 3;
                    bitmap.scaleY = 3;
                }
            }
            var p0 = res.POSITIONS.SKILL_BUTTON;
            var p1 = this._center;
            p1 = { x: p1.x, y: p1.y - 40 - 50 };
            var tick = this.game.tick - this._startTick;
            var tick2 = this._effectTick - this._startTick;
            var p = tick / tick2;
            if (p >= 1)
                p = 1;
            var EAMOUNT = 0.8;
            if (p <= 1 - EAMOUNT) {
                p = p / (1 - EAMOUNT);
                bitmap.x = p0.x + (p1.x - p0.x) * p;
                bitmap.y = p0.y + (p1.y - p0.y) * p;
            }
            else {
                var ease = createjs.Ease.getElasticOut(1.5, 0.3);
                p = 1 - (1 - p) / EAMOUNT;
                bitmap.x = p1.x;
                bitmap.y = p1.y + 40 * ease(p);
            }
        };
        //由子类重写 start() stop()总是保证对称调用的
        BaseTimeSkill.prototype.start = function () {
        };
        //由子类重写 start() stop()总是保证对称调用的
        BaseTimeSkill.prototype.stop = function () {
        };
        return BaseTimeSkill;
    }(IGameSkill_1.EmptySkill));
    exports.BaseTimeSkill = BaseTimeSkill;
    var TimeBox = (function () {
        function TimeBox(petImage, bg1Image, bg2Image) {
            this.spr = new createjs.Container();
            var bitmap1 = new createjs.Bitmap(bg1Image);
            bitmap1.regX = bg1Image.width / 2;
            bitmap1.regY = bg1Image.height / 2;
            this.spr.addChild(bitmap1);
            var bitmap2 = new createjs.Bitmap(bg2Image);
            bitmap2.regX = bg2Image.width / 2;
            bitmap2.regY = bg2Image.height / 2;
            this.spr.addChild(bitmap2);
            var icon = new createjs.Bitmap(petImage);
            icon.regX = petImage.width / 2;
            icon.regY = petImage.height / 2;
            this.spr.addChild(icon);
            this._bitmap2 = bitmap2;
            this._mask = new createjs.Shape();
            bitmap2.mask = this._mask;
        }
        TimeBox.prototype.setPercent = function (pp) {
            if (pp < 0)
                pp = 0;
            else if (pp > 1)
                pp = 1;
            if (pp === 0) {
                this._bitmap2.visible = false;
            }
            else if (pp === 1) {
                this._bitmap2.visible = true;
                this._bitmap2.mask = null;
            }
            else {
                this._bitmap2.visible = true;
                this._bitmap2.mask = this._mask;
                var width = this._bitmap2.image.width;
                var height = this._bitmap2.image.height;
                var g = this._mask.graphics;
                g.clear();
                g.beginFill('white');
                var x = -width / 2;
                var y = -height / 2;
                g.drawRect(x, y + height * (1 - pp), width, height * pp);
                g.endFill();
            }
        };
        return TimeBox;
    }());
});
define("client/src/game/skill/Skill11", ["require", "exports", "client/src/game/skill/BaseTimeSkill", "shared/PetSkillDesc"], function (require, exports, BaseTimeSkill_1, PetSkillDesc_13) {
    "use strict";
    var Skill11 = (function (_super) {
        __extends(Skill11, _super);
        function Skill11() {
            _super.call(this);
            this.backupMinLinkCount = 3;
        }
        Skill11.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_13.PetSkillDesc[10];
            this.duration = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        Skill11.prototype.start = function () {
            this.backupMinLinkCount = this.game.minLinkCount;
            console.log('技能开始，连接数变成1');
            this.game.minLinkCount = 1;
        };
        Skill11.prototype.stop = function () {
            this.game.minLinkCount = this.backupMinLinkCount;
            console.log('技能结束，连接数恢复成' + this.backupMinLinkCount);
        };
        return Skill11;
    }(BaseTimeSkill_1.BaseTimeSkill));
    exports.Skill11 = Skill11;
});
define("client/src/game/skill/Skill12", ["require", "exports", "client/src/game/skill/IGameSkill", "client/src/resource", "shared/PetSkillDesc"], function (require, exports, IGameSkill_2, resource_21, PetSkillDesc_14) {
    "use strict";
    //下次连接可同种类果冻消除
    //下一次连接不会受到颜色的限制，任意的球都能互相连接
    var Skill12 = (function (_super) {
        __extends(Skill12, _super);
        function Skill12() {
            _super.call(this);
            this.spr = new createjs.Container();
            this.isStarted = false;
        }
        Skill12.prototype.init = function (game) {
            this.game = game;
            {
                var bitmap = this.blinkBitmap = new createjs.Bitmap(null);
                bitmap.alpha = 0;
                bitmap.visible = false;
                this.spr.addChild(bitmap);
            }
            this.blinkTween = createjs.Tween.get(this.blinkBitmap, { loop: true, paused: true })
                .to({ alpha: 1 }, 300)
                .to({ alpha: 0 }, 300);
        };
        Skill12.prototype.clear = function () {
            this.triggerSkillEnd();
        };
        Skill12.prototype.getSkillResource = function () {
            return [
                { id: 'time_skill_blink_bitmap', src: 'images/Game/_0054_图层-7.png' }
            ];
        };
        Skill12.prototype.update = function () {
        };
        Skill12.prototype.startSkill = function () {
            if (!this.isStarted) {
                this.isStarted = true;
                this.blinkBitmap.visible = true;
                this.blinkTween.setPaused(false);
                if (!this.blinkBitmap.image) {
                    var image = this.blinkBitmap.image = this.game.getImage('time_skill_blink_bitmap');
                    this.blinkBitmap.scaleX = resource_21.GraphicConstant.SCREEN_WIDTH / image.width;
                    this.blinkBitmap.scaleY = resource_21.GraphicConstant.SCREEN_HEIGHT / image.height;
                }
                this.game.nextLinkIgnoreColor = true;
                var desc = PetSkillDesc_14.PetSkillDesc[11];
                this.game.nextLinkIgnoreColor_MaxCount = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
                console.log("\u6280\u80FD\u5F00\u59CB\uFF0C\u4E0B\u4E00\u6B21\u6D88\u9664\u5FFD\u7565\u989C\u8272\uFF0C\u6700\u5927\u957F\u5EA6" + this.game.nextLinkIgnoreColor_MaxCount);
            }
        };
        Skill12.prototype.triggerSkillEnd = function () {
            if (this.isStarted) {
                this.isStarted = false;
                this.blinkBitmap.visible = false;
                this.blinkTween.setPaused(true);
            }
        };
        return Skill12;
    }(IGameSkill_2.EmptySkill));
    exports.Skill12 = Skill12;
});
define("client/src/game/skill/Skill13", ["require", "exports", "client/src/game/skill/IGameSkill", "client/src/resource", "client/src/resource", "shared/PetSkillDesc"], function (require, exports, IGameSkill_3, resource_22, res, PetSkillDesc_15) {
    "use strict";
    //消除动画持续时间
    var SKILL_DURATION = 0.5;
    //根据玩家点击方向消除一列果冻
    var Skill13 = (function (_super) {
        __extends(Skill13, _super);
        function Skill13() {
            _super.call(this);
            this.spr = new createjs.Container();
            this.width = 160;
            //isWaitClick表示用户点击了一下技能按钮，下一次点击会触发消除
            this.isWaitClick = false;
            //isStarted表示开始消除了
            this.isStarted = false;
            this.startTick = 0;
            this.endTick = 0;
            this._center = {
                x: resource_22.GraphicConstant.SCREEN_WIDTH / 2,
                y: resource_22.GraphicConstant.SCREEN_HEIGHT / 2 + 50 * res.GLOBAL_SCALE
            };
        }
        Skill13.prototype.init = function (game) {
            this.game = game;
            {
                var bitmap = this.blinkBitmap = new createjs.Bitmap(null);
                bitmap.alpha = 0;
                bitmap.visible = false;
                this.spr.addChild(bitmap);
            }
            this.blinkTween = createjs.Tween.get(this.blinkBitmap, { loop: true, paused: true })
                .to({ alpha: 1 }, 300)
                .to({ alpha: 0 }, 300);
            this.effectBitmap = new createjs.Bitmap(null);
            this.spr.addChild(this.effectBitmap);
            var desc = PetSkillDesc_15.PetSkillDesc[12];
            this.width = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        Skill13.prototype.clear = function () {
            if (this.blinkBitmap) {
                this.blinkBitmap.visible = false;
                this.blinkTween.setPaused(true);
            }
        };
        Skill13.prototype.getSkillResource = function () {
            return [
                { id: 'time_skill_blink_bitmap', src: 'images/Game/_0054_图层-7.png' },
                { id: 'images/Skill/技能范围指示器.png', src: 'images/Skill/技能范围指示器.png' }
            ];
        };
        Skill13.prototype.isPreventUserInteract = function () {
            return this.isCasting();
        };
        Skill13.prototype.isPreventPhysics = function () {
            return this.isCasting();
        };
        Skill13.prototype.isCasting = function () {
            return this.isStarted;
        };
        Skill13.prototype.update = function () {
            if (this.isStarted) {
                var t0 = this.startTick;
                var t1 = this.endTick;
                var t = this.game.tick;
                var p = (t - t0) / (t1 - t0);
                if (t >= t1) {
                    this.isStarted = false;
                    this.applyFinal();
                    this.hideIndicator();
                }
                else {
                    this.showIndicator(p);
                }
            }
        };
        Skill13.prototype.startSkill = function () {
            if (!this.isWaitClick) {
                this.isWaitClick = true;
                this.blinkBitmap.visible = true;
                this.blinkTween.setPaused(false);
                if (!this.blinkBitmap.image) {
                    var image = this.blinkBitmap.image = this.game.getImage('time_skill_blink_bitmap');
                    this.blinkBitmap.scaleX = resource_22.GraphicConstant.SCREEN_WIDTH / image.width;
                    this.blinkBitmap.scaleY = resource_22.GraphicConstant.SCREEN_HEIGHT / image.height;
                }
                this.game.skillWantNextClick = true;
            }
        };
        Skill13.prototype.triggerClick = function (pt) {
            if (this.isWaitClick) {
                this.clickPt = pt;
                this.isWaitClick = false;
                this.blinkBitmap.visible = false;
                this.blinkTween.setPaused(true);
                //开始技能
                this.isStarted = true;
                this.startTick = this.game.tick;
                this.endTick = (this.startTick + SKILL_DURATION / res.GraphicConstant.TICK_TIME) | 0;
                this.applyFirst();
            }
        };
        //在技能释放的一开始调用，选中将要爆炸的球
        Skill13.prototype.applyFirst = function () {
            var x0 = this.clickPt.x - this.width / 2;
            var x1 = x0 + this.width;
            for (var _i = 0, _a = this.game.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (!ball.isBomb && ball.status === 'normal' &&
                    ball.position.x >= x0 && ball.position.x <= x1) {
                    ball.skillHighlight = true;
                }
            }
        };
        //技能结束的时候调用，炸掉球
        Skill13.prototype.applyFinal = function () {
            var arr = [];
            for (var _i = 0, _a = this.game.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (ball.skillHighlight) {
                    ball.skillHighlight = false;
                    if (ball.status === 'normal' && !ball.isBomb) {
                        arr.push(ball);
                    }
                }
            }
            this.game.bombTheBalls(arr);
        };
        Skill13.prototype.showIndicator = function (percent) {
            var bitmap = this.effectBitmap;
            bitmap.visible = true;
            if (!bitmap.image) {
                var image = bitmap.image = this.game.getImage('images/Skill/技能范围指示器.png');
                bitmap.regX = image.width / 2;
                bitmap.regY = 0;
                bitmap.scaleX = this.width / image.width;
            }
            bitmap.x = this.clickPt.x;
            bitmap.scaleY = (percent * resource_22.GraphicConstant.SCREEN_HEIGHT) / bitmap.image.height;
        };
        Skill13.prototype.hideIndicator = function () {
            this.effectBitmap.visible = false;
        };
        return Skill13;
    }(IGameSkill_3.EmptySkill));
    exports.Skill13 = Skill13;
});
define("client/src/game/skill/Skill14", ["require", "exports", "client/src/game/skill/IGameSkill"], function (require, exports, IGameSkill_4) {
    "use strict";
    //todo: 暂时不做
    var Skill14 = (function (_super) {
        __extends(Skill14, _super);
        function Skill14() {
            _super.apply(this, arguments);
            this.spr = new createjs.Container();
        }
        return Skill14;
    }(IGameSkill_4.EmptySkill));
    exports.Skill14 = Skill14;
});
define("client/src/game/skill/Skill15", ["require", "exports", "client/src/game/skill/BaseTimeSkill", "shared/PetSkillDesc"], function (require, exports, BaseTimeSkill_2, PetSkillDesc_16) {
    "use strict";
    var Skill15 = (function (_super) {
        __extends(Skill15, _super);
        function Skill15() {
            _super.call(this);
            this.backupMinLinkCount = 3;
        }
        Skill15.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_16.PetSkillDesc[14];
            this.duration = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        Skill15.prototype.start = function () {
            console.log('技能开始，子弹时间开始,持续时间:' + this.duration);
            this.game.setTimeScale(0.1);
        };
        Skill15.prototype.stop = function () {
            console.log('技能结束，子弹时间结束');
            this.game.setTimeScale(1);
        };
        return Skill15;
    }(BaseTimeSkill_2.BaseTimeSkill));
    exports.Skill15 = Skill15;
});
define("client/src/game/skill/Skill16", ["require", "exports", "client/src/game/skill/BaseSkill", "client/src/util", "shared/PetSkillDesc"], function (require, exports, BaseSkill_5, util, PetSkillDesc_17) {
    "use strict";
    var Skill16 = (function (_super) {
        __extends(Skill16, _super);
        function Skill16() {
            _super.call(this);
        }
        Skill16.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_17.PetSkillDesc[15];
            this._energy = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        //在中间的那一帧调用
        Skill16.prototype._takeEffect = function () {
            var color = util.randomChoose(this._game.BALL_RES).color;
            for (var _i = 0, _a = this._game.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (ball.color === color && !ball.isBomb && ball.status === 'normal') {
                    ball.skillHighlight = true;
                }
            }
        };
        //在最后调用的
        Skill16.prototype._applySkillEffect = function () {
            var arr = [];
            for (var _i = 0, _a = this._game.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (ball.skillHighlight) {
                    ball.skillHighlight = false;
                    if (ball.status === 'normal' && !ball.isBomb) {
                        arr.push(ball);
                    }
                }
            }
            this._game.raiseUpBalls(arr);
        };
        return Skill16;
    }(BaseSkill_5.BaseSkill));
    exports.Skill16 = Skill16;
});
define("client/src/game/skill/Skill17", ["require", "exports", "client/src/game/skill/BaseTimeSkill", "shared/PetSkillDesc"], function (require, exports, BaseTimeSkill_3, PetSkillDesc_18) {
    "use strict";
    var Skill17 = (function (_super) {
        __extends(Skill17, _super);
        function Skill17() {
            _super.call(this);
            this.backupMinLinkCount = 3;
        }
        Skill17.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_18.PetSkillDesc[16];
            this.duration = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        Skill17.prototype.start = function () {
            console.log('技能开始，金币翻倍开始,持续时间:' + this.duration);
            this.game.setCoinScale(2);
        };
        Skill17.prototype.stop = function () {
            console.log('技能结束，金币翻倍结束');
            this.game.setCoinScale(1);
        };
        return Skill17;
    }(BaseTimeSkill_3.BaseTimeSkill));
    exports.Skill17 = Skill17;
});
define("client/src/game/skill/Skill18", ["require", "exports", "client/src/game/skill/BaseBombBallSkill", "client/src/resource", "shared/PetSkillDesc"], function (require, exports, BaseBombBallSkill_7, resource_23, PetSkillDesc_19) {
    "use strict";
    //将中间两排高度的所有宠物转化为自身宠物。（被转化的宠物被消除不会增加宠物技能条）两个球的直径
    var BASE_Y = 781;
    var Skill18 = (function (_super) {
        __extends(Skill18, _super);
        function Skill18() {
            _super.call(this);
            this._height = 150;
            this._effectBitmap = new createjs.Bitmap(null);
            this.spr.addChildAt(this._effectBitmap, 1);
            this._effectBitmap.visible = false;
        }
        Skill18.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_19.PetSkillDesc[17];
            this._height = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        Skill18.prototype.getSkillResource = function () {
            var ret = _super.prototype.getSkillResource.call(this);
            ret.push({ id: 'images/Skill/技能范围指示器.png', src: 'images/Skill/技能范围指示器.png' });
            return ret;
        };
        Skill18.prototype.getBombBalls = function () {
            var balls = this._game.balls;
            var main = this._game.getMainBallDefine();
            var height = this._height;
            var y0 = BASE_Y - this._height;
            var y1 = BASE_Y;
            var ret = [];
            for (var _i = 0, balls_15 = balls; _i < balls_15.length; _i++) {
                var ball = balls_15[_i];
                var pos = ball.position;
                if (!ball.skillHighlight && pos.y >= y0 && pos.y <= y1 && ball.status == 'normal' && !ball.isBomb) {
                    ret.push(ball);
                }
            }
            return ret;
        };
        Skill18.prototype.showIndicatorEffect = function (percent) {
            var bitmap = this._effectBitmap;
            var image;
            if (!bitmap.image) {
                image = bitmap.image = this._game.getImage('images/Skill/技能范围指示器.png');
                bitmap.regX = 0;
                bitmap.regY = image.height / 2;
                bitmap.x = 0;
                bitmap.y = BASE_Y - this._height / 2;
                bitmap.scaleY = this._height / image.height;
            }
            else {
                image = bitmap.image;
            }
            var maxscale = resource_23.GraphicConstant.SCREEN_WIDTH / image.width;
            bitmap.visible = true;
            bitmap.scaleX = maxscale * percent;
        };
        Skill18.prototype.hideIndicatorEffect = function () {
            this._effectBitmap.visible = false;
        };
        return Skill18;
    }(BaseBombBallSkill_7.BaseBombBallSkill));
    exports.Skill18 = Skill18;
});
define("client/src/game/skill/Skill19", ["require", "exports", "client/src/game/skill/BaseTimeSkill", "shared/PetSkillDesc"], function (require, exports, BaseTimeSkill_4, PetSkillDesc_20) {
    "use strict";
    var Skill19 = (function (_super) {
        __extends(Skill19, _super);
        function Skill19() {
            _super.call(this);
            this.backupMinLinkCount = 3;
        }
        Skill19.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_20.PetSkillDesc[18];
            this.duration = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        Skill19.prototype.start = function () {
            console.log('技能开始，乱炸,持续时间:' + this.duration);
            this.game.wantBombAsBomb = true;
        };
        Skill19.prototype.stop = function () {
            console.log('技能结束，乱炸');
            this.game.wantBombAsBomb = false;
        };
        return Skill19;
    }(BaseTimeSkill_4.BaseTimeSkill));
    exports.Skill19 = Skill19;
});
define("client/src/game/skill/Skill20", ["require", "exports", "client/src/game/skill/BaseSkill", "shared/PetSkillDesc"], function (require, exports, BaseSkill_6, PetSkillDesc_21) {
    "use strict";
    //直接将狂热进度条充满。
    var Skill20 = (function (_super) {
        __extends(Skill20, _super);
        function Skill20() {
            _super.call(this);
        }
        Skill20.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            var desc = PetSkillDesc_21.PetSkillDesc[19];
            this._energy = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        //在中间的那一帧调用
        Skill20.prototype._takeEffect = function () {
        };
        //在最后调用的
        Skill20.prototype._applySkillEffect = function () {
            this._game.addToFullFever();
        };
        return Skill20;
    }(BaseSkill_6.BaseSkill));
    exports.Skill20 = Skill20;
});
define("client/src/game/skill/Skill21", ["require", "exports", "client/src/game/skill/BaseSkill", "shared/PetSkillDesc"], function (require, exports, BaseSkill_7, PetSkillDesc_22) {
    "use strict";
    //随机选几个球，变成炸弹
    var Skill21 = (function (_super) {
        __extends(Skill21, _super);
        function Skill21() {
            _super.call(this);
        }
        Skill21.prototype.init = function (game) {
            _super.prototype.init.call(this, game);
            //	let desc = PetSkillDesc[8];
            //	this._time = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
        };
        //在中间的那一帧调用
        Skill21.prototype._takeEffect = function () {
            var count = 0;
            var desc = PetSkillDesc_22.PetSkillDesc[20];
            var p1 = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
            var p2 = desc.skillParam2 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
            count = (p1 + (p2 - p1 + 1) * Math.random()) | 0; //[p1,p2]之间的整数
            //选出可以变成炸弹的球
            var balls = this._game.balls.filter(function (x) { return !x.isBomb && x.status === 'normal'; });
            //随机一下
            for (var i = 0; i < balls.length; ++i) {
                var a = (Math.random() * balls.length) | 0;
                var b = (Math.random() * balls.length) | 0;
                if (a !== b && (a < balls.length && b < balls.length)) {
                    var tmp = balls[a];
                    balls[a] = balls[b];
                    balls[b] = tmp;
                }
            }
            if (balls.length > count)
                balls.length = count;
            for (var _i = 0, balls_16 = balls; _i < balls_16.length; _i++) {
                var ball = balls_16[_i];
                ball.skillHighlight = true;
            }
        };
        //在最后调用的
        Skill21.prototype._applySkillEffect = function () {
            var balls = [];
            for (var _i = 0, _a = this._game.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (ball.skillHighlight) {
                    ball.skillHighlight = false;
                    balls.push(ball);
                }
            }
            this._game.turnBallToBomb(balls, 5);
        };
        return Skill21;
    }(BaseSkill_7.BaseSkill));
    exports.Skill21 = Skill21;
});
define("client/src/game/skill/AllSkill", ["require", "exports", "client/src/game/skill/Skill1", "client/src/game/skill/Skill2", "client/src/game/skill/Skill3", "client/src/game/skill/Skill4", "client/src/game/skill/Skill5", "client/src/game/skill/Skill6", "client/src/game/skill/Skill7", "client/src/game/skill/Skill8", "client/src/game/skill/Skill9", "client/src/game/skill/Skill10", "client/src/game/skill/Skill11", "client/src/game/skill/Skill12", "client/src/game/skill/Skill13", "client/src/game/skill/Skill14", "client/src/game/skill/Skill15", "client/src/game/skill/Skill16", "client/src/game/skill/Skill17", "client/src/game/skill/Skill18", "client/src/game/skill/Skill19", "client/src/game/skill/Skill20", "client/src/game/skill/Skill21"], function (require, exports, Skill1_1, Skill2_1, Skill3_1, Skill4_1, Skill5_1, Skill6_1, Skill7_1, Skill8_1, Skill9_1, Skill10_1, Skill11_1, Skill12_1, Skill13_1, Skill14_1, Skill15_1, Skill16_1, Skill17_1, Skill18_1, Skill19_1, Skill20_1, Skill21_1) {
    "use strict";
    var skillCreator = [
        Skill1_1.Skill1,
        Skill2_1.Skill2,
        Skill3_1.Skill3,
        Skill4_1.Skill4,
        Skill5_1.Skill5,
        Skill6_1.Skill6,
        Skill7_1.Skill7,
        Skill8_1.Skill8,
        Skill9_1.Skill9,
        Skill10_1.Skill10,
        Skill11_1.Skill11,
        Skill12_1.Skill12,
        Skill13_1.Skill13,
        Skill14_1.Skill14,
        Skill15_1.Skill15,
        Skill16_1.Skill16,
        Skill17_1.Skill17,
        Skill18_1.Skill18,
        Skill19_1.Skill19,
        Skill20_1.Skill20,
        Skill21_1.Skill21
    ];
    function createSkill(id) {
        if (skillCreator[id])
            return new skillCreator[id];
        return null;
    }
    exports.createSkill = createSkill;
});
define("client/src/game/GameAnimation", ["require", "exports", "client/src/resource", "client/src/MiniImageLoader", "client/src/game/Ball", "client/src/resource", "client/src/game/GameUtil", "client/src/util"], function (require, exports, resource_24, MiniImageLoader_1, Ball_5, res, GameUtil, util) {
    "use strict";
    var GameAnimation = (function () {
        function GameAnimation(_game) {
            this.feverScoreLayer = new createjs.Container();
            this.feverEffectLayer = new createjs.Container();
            this._realFeverScore = 0;
            this._showFeverScore = 0;
            this.game = _game;
        }
        GameAnimation.prototype.init = function () {
            _INIT_MY_RES();
            // init fever animation
            {
                var bitmaps = [];
                for (var i = 0; i < 6; ++i)
                    bitmaps.push(this.game.getImage('fever_bg_' + i));
                this._feverEffectBitmap = new createjs.Bitmap(null);
                this._feverEffectBitmap.x = -79;
                this._feverEffectBitmap.y = 75 + 104;
                //this._feverEffectBitmap.visible = false;
                this._feverEffectTween = new createjs.Tween(this._feverEffectBitmap, { loop: true, paused: true });
                for (var i = 0; i < bitmaps.length; ++i) {
                    this._feverEffectTween.wait(500 / bitmaps.length).set({ image: bitmaps[i] }, this._feverEffectBitmap);
                }
                this.feverEffectLayer.addChild(this._feverEffectBitmap);
            }
            //this.playFeverEffect();
        };
        GameAnimation.prototype.playFeverEffect = function () {
            this.feverEffectLayer.visible = true;
            this._feverEffectTween.setPaused(false);
        };
        GameAnimation.prototype.stopFeverEffect = function () {
            if (this.feverEffectLayer)
                this.feverEffectLayer.visible = false;
            if (this._feverEffectTween)
                this._feverEffectTween.setPaused(true);
        };
        /**
         * 飘一个当前点了第几个球的数字
         */
        GameAnimation.prototype.flyLinkCountTip = function (x, y, n) {
            this.clearLinkCountTip();
            if (!CACHED_LINE_COUNT_IMAGES.result)
                return;
            x += 35 * res.GLOBAL_SCALE;
            y -= 10 * res.GLOBAL_SCALE;
            n = (n | 0).toString();
            var container = new createjs.Container();
            var xx = 0;
            for (var i = 0; i < n.length; ++i) {
                var nn = parseInt(n[i]);
                var bitmap = new createjs.Bitmap(CACHED_LINE_COUNT_IMAGES.result[nn]);
                bitmap.x = xx;
                bitmap.y = 0;
                container.addChild(bitmap);
                xx += bitmap.image.width;
            }
            container.x = x;
            container.y = y;
            this.game.animationLayer.addChild(container);
            createjs.Tween.get(container).to({ y: y - 30, alpha: 1 }, 200);
            this._linkCountUI = container;
        };
        GameAnimation.prototype.clearLinkCountTip = function () {
            if (this._linkCountUI) {
                this._linkCountUI.parent.removeChild(this._linkCountUI);
                this._linkCountUI = null;
            }
        };
        /**
         * 收金币动画
         */
        GameAnimation.prototype.receiveCoinAnimation = function (x, y) {
            var image = this.game.getImage('images/Game/金币icon.png');
            var bitmap = new createjs.Bitmap(image);
            bitmap.regX = image.width / 2;
            bitmap.regY = image.height / 2;
            bitmap.x = x;
            bitmap.y = y;
            bitmap.scaleX = bitmap.scaleY = res.GLOBAL_SCALE;
            this.game.animationLayer.addChild(bitmap);
            createjs.Tween.get(bitmap).to(res.POSITIONS.COIN_CENTER, 300, createjs.Ease.cubicInOut).call(function (obj) {
                if (obj.parent)
                    obj.parent.removeChild(obj);
            }, [bitmap]);
        };
        GameAnimation.prototype.showScoreAnimation = function (score, linkCount, x, y, toFever) {
            var UP_AMOUNT = 20 * res.GLOBAL_SCALE; //向上飞行多少
            var UP_DURATION = 200; //向上飞行时间
            var DELAY_TIME = 500; //等待多少时间
            var TO_TARGET_DURATION = 300; //飞往目的地的时间
            //目标位置
            var tx, ty;
            if (toFever) {
                tx = res.POSITIONS.FEVER_SCORE_CENTER.x;
                ty = res.POSITIONS.FEVER_SCORE_CENTER.y;
            }
            else {
                tx = res.POSITIONS.SCORE_CENTER.x;
                ty = res.POSITIONS.SCORE_CENTER.y + 50 * res.GLOBAL_SCALE;
            }
            if (!SCORE_NUMBER.result)
                return;
            var scoreImage = null;
            var scoreImageIndex = -1;
            if (linkCount >= 5 && linkCount <= 7) {
                scoreImageIndex = 0;
            }
            else if (linkCount >= 8 && linkCount <= 10) {
                scoreImageIndex = 1;
            }
            else if (linkCount >= 11 && linkCount <= 14) {
                scoreImageIndex = 2;
            }
            else if (linkCount >= 15 && linkCount <= 19) {
                scoreImageIndex = 3;
            }
            else if (linkCount >= 20 && linkCount <= 29) {
                scoreImageIndex = 4;
            }
            else if (linkCount >= 30) {
                scoreImageIndex = 5;
            }
            scoreImage = LINK_SHOW_IMAGES[scoreImageIndex] ? LINK_SHOW_IMAGES[scoreImageIndex].result : null;
            var container = new createjs.Container();
            container.x = x;
            container.y = y;
            var bitmaps = GameUtil.createDigitBitmap(score, SCORE_NUMBER.result, true);
            var numberHeight = 0;
            for (var _i = 0, bitmaps_3 = bitmaps; _i < bitmaps_3.length; _i++) {
                var x_1 = bitmaps_3[_i];
                container.addChild(x_1);
                numberHeight = x_1.image.height;
            }
            var scoreImageBitmap = null;
            if (scoreImage) {
                scoreImageBitmap = new createjs.Bitmap(scoreImage);
                scoreImageBitmap.x = -scoreImage.width / 2;
                scoreImageBitmap.y = -scoreImage.height - numberHeight;
                container.addChild(scoreImageBitmap);
            }
            var bounds = container.getBounds();
            var right = container.x + bounds.x + bounds.width;
            var left = container.x - bounds.x - bounds.width;
            if (right > resource_24.GraphicConstant.SCREEN_WIDTH) {
                container.x = resource_24.GraphicConstant.SCREEN_WIDTH - bounds.x - bounds.width;
            }
            if (left < 0) {
                container.x = -bounds.x;
            }
            createjs.Tween.get(container)
                .to({ y: y - UP_AMOUNT }, UP_DURATION)
                .wait(DELAY_TIME)
                .call(GameUtil.removeSelfCallback, [scoreImageBitmap])
                .to({ x: tx, y: ty }, TO_TARGET_DURATION, createjs.Ease.circInOut)
                .call(GameUtil.removeSelfCallback, [container]);
            this.game.animationLayer3.addChild(container);
            return UP_DURATION + DELAY_TIME + TO_TARGET_DURATION;
        };
        GameAnimation.prototype.playEnergyFullAnimation = function () {
            if (!ENERGY_FULL_EFFECT_IMAGE.result)
                return;
            var bitmap = new createjs.Bitmap(ENERGY_FULL_EFFECT_IMAGE.result);
            bitmap.regX = bitmap.image.width / 2;
            bitmap.regY = bitmap.image.height / 2;
            bitmap.x = res.POSITIONS.SKILL_BUTTON.x;
            bitmap.y = res.POSITIONS.SKILL_BUTTON.y;
            this.game.animationLayer.addChild(bitmap);
            bitmap.scaleX = 0.2;
            bitmap.scaleY = 0.2;
            createjs.Tween.get(bitmap).to({
                scaleX: 0.8,
                scaleY: 0.8
            }, 500).call(GameUtil.removeSelfCallback, [bitmap]);
        };
        GameAnimation.prototype.playBombAnimation = function (x, y) {
            if (!BOMB_ANIM.result)
                return;
            var bitmap = new createjs.Bitmap(null);
            bitmap.x = x - BOMB_ANIM.result[0].width / 2;
            bitmap.y = y - BOMB_ANIM.result[0].height / 2;
            this.game.animationLayer.addChild(bitmap);
            util.animTween(bitmap, BOMB_ANIM.result, 800, true);
        };
        GameAnimation.prototype.receiveEnergyAnimation = function (ball) {
            if (ball.bitmap && ball.bitmap.image) {
                var bitmap = new createjs.Bitmap(ball.bitmap.image);
                bitmap.regX = ball.bitmap.regX;
                bitmap.regY = ball.bitmap.regY;
                bitmap.x = ball.position.x;
                bitmap.y = ball.position.y;
                bitmap.scaleX = bitmap.scaleY = 0.8 / Ball_5.BALL_BITMAP_RESAMPLE;
                this.game.animationLayer.addChild(bitmap);
                var toX = resource_24.GraphicConstant.SCREEN_WIDTH * 0.16;
                var toY = resource_24.GraphicConstant.SCREEN_HEIGHT * 0.9;
                createjs.Tween.get(bitmap).to({
                    x: toX, y: toY, alpha: 0.1
                }, 400, createjs.Ease.cubicInOut).call(function (bmp) {
                    if (bmp.parent)
                        bmp.parent.removeChild(bmp);
                }, [bitmap]);
            }
        };
        GameAnimation.prototype.receiveFeverAnimation = function (ball) {
            //和receiveEnergyAnimation 一样，就是目标位置不一样
            if (ball.bitmap && ball.bitmap.image) {
                var bitmap = new createjs.Bitmap(ball.bitmap.image);
                bitmap.regX = ball.bitmap.regX;
                bitmap.regY = ball.bitmap.regY;
                bitmap.x = ball.position.x;
                bitmap.y = ball.position.y;
                bitmap.scaleX = bitmap.scaleY = 0.8 / Ball_5.BALL_BITMAP_RESAMPLE;
                this.game.animationLayer.addChild(bitmap);
                var toX = res.POSITIONS.FEVER_CENTER.x;
                var toY = res.POSITIONS.FEVER_CENTER.y;
                createjs.Tween.get(bitmap).to({
                    x: toX, y: toY, alpha: 0.1
                }, 400, createjs.Ease.cubicInOut).call(function (bmp) {
                    if (bmp.parent)
                        bmp.parent.removeChild(bmp);
                }, [bitmap]);
            }
        };
        /**显示fever bonus分数 */
        GameAnimation.prototype.showFeverScore = function (n) {
            var _this = this;
            if (!SCORE_NUMBER.result)
                return;
            var TEXT_SIZE = 30 * res.GLOBAL_SCALE;
            /*
                    if (!this._feverBonusText)
                    {
                        this._feverBonusText = new createjs.Text('FEVER BONUS', `${TEXT_SIZE}px SimHei`);
                        this._feverBonusText.textAlign = 'center';
                        this._feverBonusText.x = res.POSITIONS.FEVER_SCORE_CENTER.x;
                        this._feverBonusText.y = res.POSITIONS.FEVER_SCORE_CENTER.y;
                    }
            
                    if (!this._feverBonusText.parent)
                    {
                        this.feverScoreLayer.addChild(this._feverBonusText);
                    }
            */
            if (!this._feverBonusBitmap) {
                this._feverBonusBitmap = new createjs.Bitmap(null);
                this._feverBonusBitmap.x = 320;
                this._feverBonusBitmap.y = 189;
                this.feverScoreLayer.addChild(this._feverBonusBitmap);
            }
            if (!this._feverBonusBitmap.image) {
                this._feverBonusBitmap.image = FEVER_BONUS_IMAGE.result;
                if (this._feverBonusBitmap.image)
                    this._feverBonusBitmap.regX = this._feverBonusBitmap.image.width / 2;
            }
            this._feverBonusBitmap.visible = true;
            // fever score
            if (!this._feverBonusScore) {
                this._feverBonusScore = new createjs.Container();
                this._feverBonusScore.x = res.POSITIONS.FEVER_SCORE_CENTER.x;
                this._feverBonusScore.y = res.POSITIONS.FEVER_SCORE_CENTER.y + TEXT_SIZE + SCORE_NUMBER.result[0].height;
            }
            if (!this._feverBonusScore.parent) {
                this.feverScoreLayer.addChild(this._feverBonusScore);
            }
            if (this._feverScoreTween) {
                this._feverScoreTween.setPaused(true);
                this._feverScoreTween = null;
            }
            this._realFeverScore = n;
            var obj = new GameUtil.ScoreTweenHelper(this._showFeverScore, function (val) {
                if (val != _this._showFeverScore) {
                    _this._showFeverScore = val;
                    _this._internalSetFeverScore(val);
                }
            });
            var tween = this._feverScoreTween = createjs.Tween.get(obj).to({ value: this._realFeverScore }, 1000);
            /*
                    this._feverBonusScore.removeAllChildren();
                    let digits = GameUtil.createDigitBitmap(n, SCORE_NUMBER.result, true);
                    for (let d of digits)
                    {
                        this._feverBonusScore.addChild(d);
                    }
            */
        };
        /**将fever bonus分数飞到真实的分数上面 */
        GameAnimation.prototype.collectFeverScore = function () {
            /*
            if (this._feverBonusText && this._feverBonusText.parent)
            {
                this._feverBonusText.parent.removeChild(this._feverBonusText);
            }
            */
            if (this._feverBonusBitmap) {
                this._feverBonusBitmap.visible = false;
            }
            if (this._feverBonusScore && this._feverBonusScore.parent) {
                this._internalSetFeverScore(this._realFeverScore);
                createjs.Tween.get(this._feverBonusScore)
                    .to({
                    x: res.POSITIONS.SCORE_CENTER.x,
                    y: res.POSITIONS.SCORE_CENTER.y
                }, 300)
                    .call(GameUtil.removeSelfCallback, [this._feverBonusScore]);
                this._feverBonusScore = null;
            }
            if (this._feverScoreTween) {
                this._feverScoreTween.setPaused(true);
                this._feverScoreTween = null;
            }
            this._showFeverScore = 0;
            this._realFeverScore = 0;
            this._internalSetFeverScore(0);
        };
        GameAnimation.prototype._internalSetFeverScore = function (n) {
            if (!this._feverBonusScore)
                return;
            this._feverBonusScore.removeAllChildren();
            var digits = GameUtil.createDigitBitmap(n, SCORE_NUMBER.result, true);
            for (var _i = 0, digits_1 = digits; _i < digits_1.length; _i++) {
                var d = digits_1[_i];
                this._feverBonusScore.addChild(d);
            }
        };
        GameAnimation.prototype.blinkTimeWarning = function () {
            if (!TIME_WARNING_MASK.result)
                return;
            var bitmap = new createjs.Bitmap(TIME_WARNING_MASK.result);
            bitmap.scaleX = resource_24.GraphicConstant.SCREEN_WIDTH / bitmap.image.width;
            bitmap.scaleY = resource_24.GraphicConstant.SCREEN_HEIGHT / bitmap.image.height;
            bitmap.alpha = 0;
            this.game.animationLayer2.addChild(bitmap);
            createjs.Tween.get(bitmap).to({ alpha: 1 }, 300).to({ alpha: 0 }, 300).call(GameUtil.removeSelfCallback, [bitmap]);
        };
        GameAnimation.prototype.showBombNumAnimation = function (x, y, n, delay) {
            var digits = BOMB_NUM_IMAGES.map(function (x) { return x.result; });
            if (digits.some(function (x) { return !x; }))
                return;
            var bitmaps = GameUtil.createDigitBitmap(n, digits, false);
            if (bitmaps.length > 0) {
                var cc = new createjs.Container();
                for (var _i = 0, bitmaps_4 = bitmaps; _i < bitmaps_4.length; _i++) {
                    var x_2 = bitmaps_4[_i];
                    cc.addChild(x_2);
                }
                cc.x = x;
                cc.y = y + bitmaps[0].image.height / 2;
                this.game.animationLayer.addChild(cc);
                var t = createjs.Tween.get(cc);
                if (delay > 0) {
                    cc.visible = false;
                    t.wait(delay * 1000).set({ visible: true });
                }
                t.wait(500).to({ alpha: 0 }, 1000).call(GameUtil.removeSelfCallback, [cc]);
            }
        };
        GameAnimation.prototype.clear = function () {
            this.stopFeverEffect();
            if (this._feverScoreTween) {
                this._feverScoreTween.setPaused(true);
                this._feverScoreTween = null;
            }
        };
        GameAnimation.prototype.showStartFever = function () {
            if (!START_FEVER_IMAGE.result)
                return;
            var image = START_FEVER_IMAGE.result;
            var bitmap = new createjs.Bitmap(image);
            bitmap.set({
                regX: image.width / 2,
                regY: image.height / 2,
                x: 320,
                y: 300,
                scaleX: 0,
                scaleY: 0
            });
            this.game.animationLayer3.addChild(bitmap);
            createjs.Tween.get(bitmap).to({ scaleX: 1, scaleY: 1 }, 500, createjs.Ease.elasticOut).wait(500).call(GameUtil.removeSelfCallback, [bitmap]);
        };
        GameAnimation.prototype.showTimeOver = function () {
            if (!TIME_OVER_IMAGE.result)
                return;
            var image = TIME_OVER_IMAGE.result;
            var bitmap = new createjs.Bitmap(image);
            bitmap.set({
                regX: image.width / 2,
                regY: image.height / 2,
                x: 320,
                y: 300,
                scaleX: 0,
                scaleY: 0
            });
            this.game.animationLayer3.addChild(bitmap);
            createjs.Tween.get(bitmap).to({ scaleX: 1, scaleY: 1 }, 800, createjs.Ease.elasticOut).wait(2000).call(GameUtil.removeSelfCallback, [bitmap]);
        };
        GameAnimation.prototype.showBonusTime = function () {
            if (!BONUS_TIME_IMAGE.result)
                return;
            this.hideBonusTime();
            var image = BONUS_TIME_IMAGE.result;
            var bitmap = new createjs.Bitmap(image);
            bitmap.set({
                regX: image.width / 2,
                regY: image.height / 2,
                x: 320,
                y: 300,
                scaleX: 0,
                scaleY: 0
            });
            this._bonusTimeBitmap = bitmap;
            this.game.animationLayer3.addChild(bitmap);
            createjs.Tween.get(bitmap).wait(3500).to({ scaleX: 1, scaleY: 1 }, 800, createjs.Ease.elasticOut);
        };
        GameAnimation.prototype.hideBonusTime = function () {
            if (this._bonusTimeBitmap) {
                this.game.animationLayer3.removeChild(this._bonusTimeBitmap);
                this._bonusTimeBitmap = null;
            }
        };
        return GameAnimation;
    }());
    exports.GameAnimation = GameAnimation;
    var CACHED_LINE_COUNT_IMAGES = new MiniImageLoader_1.MiniImageLoader('images/Game/连线数量.png', function (image) { return util.cutRowImages(image, 11, res.GLOBAL_SCALE); });
    var SCORE_NUMBER = new MiniImageLoader_1.MiniImageLoader('images/Game/连线结算数字.png', function (image) { return util.cutRowImages(image, 11, res.GLOBAL_SCALE); });
    var LINK_SHOW_IMAGES = [
        new MiniImageLoader_1.MiniImageLoader('images/Game/good.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/verygood.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/great.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/excellent.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/won.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/fan.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
    ];
    var ENERGY_FULL_EFFECT_IMAGE = new MiniImageLoader_1.MiniImageLoader('images/Game/圆形范围指示器.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); });
    var BOMB_ANIM = new MiniImageLoader_1.MiniImageLoader('images/Game/BombAnimation.png', function (image) { return util.cutRowImages(image, 16, res.GLOBAL_SCALE * 2); });
    var TIME_WARNING_MASK = new MiniImageLoader_1.MiniImageLoader('images/Game/_0054_图层-7.png', function (image) { return image; });
    var BOMB_NUM_IMAGES = [
        new MiniImageLoader_1.MiniImageLoader('images/Game/-_0000_0.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/-_0001_1.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/-_0002_2.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/-_0003_3.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/-_0004_4.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/-_0005_5.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/-_0006_6.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/-_0007_7.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/-_0008_8.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
        new MiniImageLoader_1.MiniImageLoader('images/Game/-_0009_9.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); }),
    ];
    var START_FEVER_IMAGE = new MiniImageLoader_1.MiniImageLoader("images/Game/狂热.png", function (image) { return image; });
    var TIME_OVER_IMAGE = new MiniImageLoader_1.MiniImageLoader("images/Game/timeup.png", function (image) { return image; });
    var BONUS_TIME_IMAGE = new MiniImageLoader_1.MiniImageLoader("images/Game/爆蛋阶段.png", function (image) { return image; });
    var FEVER_BONUS_IMAGE = new MiniImageLoader_1.MiniImageLoader("images/Game/game_num_fever_txt.png", function (image) { return image; });
    function _INIT_MY_RES() {
        CACHED_LINE_COUNT_IMAGES.init();
        SCORE_NUMBER.init();
        ENERGY_FULL_EFFECT_IMAGE.init();
        BOMB_ANIM.init();
        for (var _i = 0, LINK_SHOW_IMAGES_1 = LINK_SHOW_IMAGES; _i < LINK_SHOW_IMAGES_1.length; _i++) {
            var x = LINK_SHOW_IMAGES_1[_i];
            x.init();
        }
        TIME_WARNING_MASK.init();
        for (var _a = 0, BOMB_NUM_IMAGES_1 = BOMB_NUM_IMAGES; _a < BOMB_NUM_IMAGES_1.length; _a++) {
            var x = BOMB_NUM_IMAGES_1[_a];
            x.init();
        }
        START_FEVER_IMAGE.init();
        TIME_OVER_IMAGE.init();
        BONUS_TIME_IMAGE.init();
        FEVER_BONUS_IMAGE.init();
    }
});
define("client/src/game/FeverBar", ["require", "exports", "client/src/resource", "client/src/MiniImageLoader"], function (require, exports, res, MiniImageLoader_2) {
    "use strict";
    /**原图高度 */
    var IMAGE_HEIGHT = 37;
    /**原图左中右的宽度 */
    var IMAGE_LEFT_WIDTH = 17;
    var IMAGE_CENTER_WIDTH = 3;
    var IMAGE_RIGHT_WIDTH = 17;
    /**中间缩放部分的宽度 */
    var DRAW_CENTER_WIDTH = 233;
    var FeverBar = (function (_super) {
        __extends(FeverBar, _super);
        function FeverBar() {
            _super.call(this);
            this.image = new MiniImageLoader_2.MiniImageLoader('images/Game/Fever.png', function (image) { return image; });
            this.percent = 0;
            this.x = 196 * res.GLOBAL_SCALE;
            this.y = 1000 * res.GLOBAL_SCALE;
            this.setBounds(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
            this.image.init();
        }
        Object.defineProperty(FeverBar.prototype, "value", {
            get: function () { return this.percent; },
            set: function (val) {
                if (val < 0)
                    val = 0;
                else if (val > 1)
                    val = 1;
                this.percent = val;
            },
            enumerable: true,
            configurable: true
        });
        FeverBar.prototype.draw = function (ctx, ignoreCache) {
            if (!this.isVisible)
                return false;
            if (this.percent <= 0)
                return false;
            if (!this.image.result)
                return false;
            var image = this.image.result;
            var SCALE = res.GLOBAL_SCALE;
            var DRAW_HEIGHT = (IMAGE_HEIGHT * SCALE) | 0;
            var x = this.x | 0;
            var y = this.y | 0;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            //draw left
            {
                var DRAW_WIDTH = (IMAGE_LEFT_WIDTH * SCALE) | 0;
                ctx.drawImage(image, 0, 0, IMAGE_LEFT_WIDTH, IMAGE_HEIGHT, x, y, DRAW_WIDTH, DRAW_HEIGHT);
                x += DRAW_WIDTH;
            }
            //draw center
            {
                var DRAW_WIDTH = (DRAW_CENTER_WIDTH * this.percent * SCALE) | 0;
                ctx.drawImage(image, IMAGE_LEFT_WIDTH, 0, IMAGE_CENTER_WIDTH, IMAGE_HEIGHT, x, y, DRAW_WIDTH, DRAW_HEIGHT);
                x += DRAW_WIDTH;
            }
            //draw right
            {
                var DRAW_WIDTH = (IMAGE_RIGHT_WIDTH * SCALE) | 0;
                ctx.drawImage(image, IMAGE_LEFT_WIDTH + IMAGE_CENTER_WIDTH, 0, IMAGE_RIGHT_WIDTH, IMAGE_HEIGHT, x, y, DRAW_WIDTH, DRAW_HEIGHT);
                x += DRAW_WIDTH;
            }
            return true;
        };
        FeverBar.prototype.isVisible = function () { return this.visible; };
        return FeverBar;
    }(createjs.DisplayObject));
    exports.FeverBar = FeverBar;
});
define("GameWorkerMain", ["require", "exports", "client/src/resource"], function (require, exports, res) {
    "use strict";
    var GC = res.GraphicConstant;
    function createWorker() {
        var url = 'scripts/worker.js';
        try {
            url = window['_APP_VERSION_OBJECT'].webworker_url;
        }
        catch (e) { }
        return new Worker(url);
    }
    exports.createWorker = createWorker;
    var g;
    function main(obj) {
        //console.log('hello world webworker',obj);
        obj.onmessage = onMessage;
        obj.onerror = function (e) {
            e.cmd = 'error';
            obj.postMessage(e);
        };
        obj.postMessage({ cmd: 'ready', id: worldId });
        g = obj;
    }
    exports.main = main;
    function onMessage(e) {
        var obj = e.data;
        switch (obj.cmd) {
            case 'start': return start(obj);
            case 'stop': return stop(obj);
            case 'addBall': return addBall(obj);
            case 'delBall': return delBall(obj);
            case 'initPhysics': return initPhysics(obj);
            case 'pause':
                pausePhysics = true;
                break;
            case 'resume':
                pausePhysics = false;
                break;
            case 'shake':
                return shake(obj);
            case 'timeScale':
                timeScale = obj.timeScale;
                break;
            case 'raiseUpBalls':
                raiseUpBalls(obj.ids);
                break;
            default:
                throw new Error('unknown message:' + obj);
        }
    }
    exports.onMessage = onMessage;
    var world;
    var worldId = -1;
    var timerId;
    var allBalls = {};
    var pausePhysics = false;
    var timeScale = 1;
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    function start(obj) {
        if (world) {
            throw new Error('already started');
        }
        timeScale = 1;
        worldId = obj.id;
        world = new Box2D.Dynamics.b2World(new b2Vec2(0, 9.8), true);
        var HALF_BOUND_EDGE = 10;
        //create static bottom chain
        {
            var chain = res.BOTTOM_STATIC_CHAIN_POINT;
            var bodydef = new Box2D.Dynamics.b2BodyDef();
            bodydef.type = Box2D.Dynamics.b2Body.b2_staticBody;
            var body = world.CreateBody(bodydef);
            for (var i = 0; i < chain.length; ++i) {
                var p0 = chain[i - 1];
                var p1 = chain[i];
                var p2 = chain[i + 1];
                var p3 = chain[i + 2];
                if (p1 && p2) {
                    var v1 = new b2Vec2(res.ToBox2DUnit(p1.x), res.ToBox2DUnit(p1.y));
                    var v2 = new b2Vec2(res.ToBox2DUnit(p2.x), res.ToBox2DUnit(p2.y));
                    var shape = Box2D.Collision.Shapes.b2PolygonShape.AsEdge(v1, v2);
                    body.CreateFixture2(shape);
                }
            }
            //left right
            {
                var p1 = { x: 0, y: 0 }, p2 = { x: 0, y: GC.SCREEN_HEIGHT };
                var v1 = new b2Vec2(res.ToBox2DUnit(p1.x), res.ToBox2DUnit(p1.y));
                var v2 = new b2Vec2(res.ToBox2DUnit(p2.x), res.ToBox2DUnit(p2.y));
                var shape = Box2D.Collision.Shapes.b2PolygonShape.AsEdge(v1, v2);
                body.CreateFixture2(shape);
            }
            {
                var p1 = { x: GC.SCREEN_WIDTH, y: 0 }, p2 = { x: GC.SCREEN_WIDTH, y: GC.SCREEN_HEIGHT };
                var v1 = new b2Vec2(res.ToBox2DUnit(p1.x), res.ToBox2DUnit(p1.y));
                var v2 = new b2Vec2(res.ToBox2DUnit(p2.x), res.ToBox2DUnit(p2.y));
                var shape = Box2D.Collision.Shapes.b2PolygonShape.AsEdge(v1, v2);
                body.CreateFixture2(shape);
            }
        }
        pausePhysics = false;
        timerId = setInterval(update, GC.TICK_TIME * 1000);
    }
    //技能功能：将一系列球移动到最上面
    function raiseUpBalls(ids) {
        if (!Array.isArray(ids))
            return;
        var baseY = res.ToBox2DUnit(232);
        var y = baseY;
        var x0 = 0;
        var x1 = 0;
        var width = res.ToBox2DUnit(GC.SCREEN_WIDTH);
        var centerX = width;
        var flag = true;
        x0 = x1 = width / 2;
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            var body = allBalls[id];
            if (body) {
                var radius = res.ToBox2DUnit(body['_balldef'].radius) * 1.1;
                var x = void 0;
                //下面那么麻烦是因为，把一系列球移动到上面(y < baseY)
                //并且，平均分配在中心的两边
                //x0表示扩展到左边的坐标，x1表示扩展到右边的坐标
                x = flag ? x0 - radius : x1 + radius;
                if (x - radius <= 0 || x + radius >= width) {
                    y -= radius * 2;
                    x0 = x1 = width / 2;
                    x = flag ? x0 - radius : x1 + radius;
                }
                if (flag)
                    x0 -= radius * 2;
                else
                    x1 += radius * 2;
                flag = !flag;
                body.SetPosition(new b2Vec2(x, y));
            }
        }
    }
    function stop(obj) {
        clearInterval(timerId);
        timerId = null;
        world = null;
        worldId = -1;
        allBalls = {};
    }
    function initPhysics(obj) {
        if (obj.id != worldId) {
            throw new Error('worldId not matched');
        }
        for (var i = 0; i < 50; ++i) {
            world.Step(GC.TICK_TIME, 2, 2);
        }
        postMessage({ cmd: 'initPhysicsReady', id: worldId });
    }
    function update() {
        if (pausePhysics)
            return;
        var t0 = Date.now();
        world.Step(GC.TICK_TIME * timeScale, 2, 2);
        var t1 = Date.now();
        var balls = [];
        for (var id in allBalls) {
            var ball = allBalls[id];
            var pos = ball.GetPosition();
            pos = {
                x: res.FromBox2DUnit(pos.x),
                y: res.FromBox2DUnit(pos.y)
            };
            balls.push({
                id: id,
                pos: pos,
                rot: ball.GetAngle()
            });
        }
        g.postMessage({ cmd: 'update', balls: balls, time: t1 - t0, id: worldId });
    }
    function addBall(obj) {
        var id = obj.id;
        var x = obj.x;
        var y = obj.y;
        var radius = obj.radius;
        if (id in allBalls) {
            throw new Error("ball.id=" + id + " already created");
        }
        var def = new Box2D.Dynamics.b2BodyDef();
        def.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        def.allowSleep = true;
        def.bullet = false;
        def.position.Set(res.ToBox2DUnit(x), res.ToBox2DUnit(y));
        var body = world.CreateBody(def);
        {
            var shape = new Box2D.Collision.Shapes.b2CircleShape(res.ToBox2DUnit(radius));
            var fixture = body.CreateFixture2(shape, 0.7);
            fixture.SetRestitution(0);
            fixture.SetFriction(2);
        }
        var earPos = obj.earPos;
        var earRadius = obj.earRadius;
        if (earPos && earPos.length) {
            for (var i = 0; i < earPos.length; ++i) {
                var shape = new Box2D.Collision.Shapes.b2CircleShape(res.ToBox2DUnit(earRadius));
                shape.SetLocalPosition(new Box2D.Common.Math.b2Vec2(res.ToBox2DUnit(earPos[i].x), res.ToBox2DUnit(earPos[i].y)));
                var fixture = body.CreateFixture2(shape, 0.7);
                fixture.SetRestitution(0);
                fixture.SetFriction(10);
            }
        }
        body['_balldef'] = obj;
        allBalls[id] = body;
    }
    function delBall(obj) {
        var id = obj.id;
        if (!(id in allBalls)) {
            throw new Error("Ball.id=" + id + " not exists");
        }
        var ball = allBalls[id];
        delete allBalls[id];
        world.DestroyBody(ball);
    }
    function shake(obj) {
        var power = +obj.power;
        for (var key in allBalls) {
            var body = allBalls[key];
            if (Math.random() < 0.6) {
                var pos = body.GetPosition().Copy();
                pos.x += res.ToBox2DUnit(10);
                var impuls = new b2Vec2(0, -(0.4 + Math.random() * 0.05));
                impuls.y *= res.GLOBAL_SCALE * power;
                body.ApplyImpulse(impuls, pos);
            }
        }
    }
});
define("shared/WeeklyTaskDefine", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.ALL_WEEKLY_TASK_TYPE = [
        "gameCombo",
        "gameExp",
        "gameCoin",
        "gameBomb",
        "gameSkill",
        "gameScore",
        "gameLink",
        "gameBall",
        "gameExpBomb",
        "gameTimeBomb",
        "gameCoinBomb",
        "gameScoreBomb",
        "gameBallX",
        "totalExpBomb",
        "totalTimeBomb",
        "totalCoinBomb",
        "totalScoreBomb",
        "totalBall",
        "totalExp",
        "totalBomb",
        "totalScore",
        "totalBallX",
        "totalSkillX",
    ];
    //分裂WeeklyTaskType，使得它更容易使用
    //例如 "gameExpBomb" => ["game", "expBomb"]
    function splitWeeklyTaskType(type, param) {
        var prefix;
        var tail;
        if (type.substr(0, 4) === 'game') {
            prefix = 'game';
            tail = type.substr(4);
        }
        else if (type.substr(0, 5) === 'total') {
            prefix = 'total';
            tail = type.substr(5);
        }
        else {
            return null;
        }
        if (tail.length > 0) {
            tail = tail[0].toLowerCase() + tail.substr(1);
        }
        if (tail === 'ballX') {
            tail = 'ball' + param;
        }
        else if (tail === 'skillX') {
            tail = 'skill' + param;
        }
        return [prefix, tail];
    }
    exports.splitWeeklyTaskType = splitWeeklyTaskType;
    var TASK_SETS;
    function getCurrentWeeklyTaskSet() {
        var now = Date.now();
        if (TASK_SETS) {
            for (var _i = 0, TASK_SETS_1 = TASK_SETS; _i < TASK_SETS_1.length; _i++) {
                var t = TASK_SETS_1[_i];
                if (now >= t.from && now <= t.to)
                    return t;
            }
        }
        return null;
    }
    exports.getCurrentWeeklyTaskSet = getCurrentWeeklyTaskSet;
    //这是一个标准的模板
    var TASK_LIST1 = [
        { type: "gameCombo", maxCount: 20, failCount: 3, prizeType: "coin", prizeCount: 500, desc: "连击达到20次" },
        { type: "gameExp", maxCount: 40, failCount: 3, prizeType: "coin", prizeCount: 500, desc: "单局获得40经验" },
        { type: "gameCoin", maxCount: 120, failCount: 3, prizeType: "coin", prizeCount: 500, desc: "单局获得120金币" },
        { type: "gameBomb", maxCount: 4, failCount: 3, prizeType: "coin", prizeCount: 500, desc: "单局触发4个炸弹" },
        { type: "gameSkill", maxCount: 2, failCount: 3, prizeType: "coin", prizeCount: 500, desc: "单局触发技能2次" },
        { type: "gameScore", maxCount: 200000, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据获得200000分' },
        { type: 'gameLink', maxCount: 12, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单局连接12个果冻' },
        { type: 'gameBall', maxCount: 230, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单局消除230个果冻' },
        { type: 'gameExpBomb', maxCount: 1, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据触发1个经验炸弹' },
        { type: 'gameTimeBomb', maxCount: 1, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据触发1个时间炸弹' },
        { type: 'gameCoinBomb', maxCount: 1, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据触发1个金币炸弹' },
        { type: 'gameScoreBomb', maxCount: 1, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据触发1个分数炸弹' },
        { type: 'totalExpBomb', maxCount: 6, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发6个经验炸弹' },
        { type: 'totalTimeBomb', maxCount: 6, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发6个时间炸弹' },
        { type: 'totalCoinBomb', maxCount: 6, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发6个金币炸弹' },
        { type: 'totalScoreBomb', maxCount: 6, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发6个分数炸弹' },
        { type: 'totalBall', maxCount: 1500, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计消除1500个果冻' },
        { type: 'totalExp', maxCount: 240, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计获得240经验' },
        { type: 'totalBomb', maxCount: 24, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发24个爆炸点' },
        { type: 'totalScore', maxCount: 300000, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计获得300000分' },
        { type: 'totalBallX', maxCount: 300, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计消除{果冻X}300个' },
        { type: 'totalSkillX', maxCount: 6, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发{果冻X}技能6次' },
        { type: 'gameBallX', maxCount: 50, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据消除{果冻X}50个' },
    ];
    var TASK_LIB; /* = [
        null,
        { type: "gameCombo", maxCount: 20, failCount: 3, desc: "连击达到20次" }
        , { type: "gameExp", maxCount: 40, failCount: 3, desc: "单局获得40经验" }
        , { type: "gameCoin", maxCount: 120, failCount: 3, desc: "单局获得120金币" }
        , { type: "gameBomb", maxCount: 4, failCount: 3, desc: "单局触发4个炸弹" }
        , { type: "gameSkill", maxCount: 2, failCount: 3, desc: "单局触发技能2次" }
        , { type: "gameScore", maxCount: 200000, failCount: 3, desc: "单据获得200000分" }
        , { type: 'gameLink', maxCount: 12, failCount: 3, desc: "单局连接12个果冻" }
        , { type: 'gameBall', maxCount: 230, failCount: 3, desc: "单局消除230个果冻" }
        , { type: 'gameExpBomb', maxCount: 1, failCount: 3, desc: "单据触发1个经验炸弹" }
        , { type: 'gameTimeBomb', maxCount: 1, failCount: 3, desc: "单据触发1个时间炸弹" }
        , { type: 'gameCoinBomb', maxCount: 1, failCount: 3, desc: "单据触发1个金币炸弹" }
        , { type: 'gameScoreBomb', maxCount: 1, failCount: 3, desc: "单据触发1个分数炸弹" }
        , { type: 'totalExpBomb', maxCount: 6, failCount: 0, desc: "累计触发6个经验炸弹" }
        , { type: 'totalTimeBomb', maxCount: 6, failCount: 0, desc: "累计触发6个时间炸弹" }
        , { type: 'totalCoinBomb', maxCount: 6, failCount: 0, desc: "累计触发6个金币炸弹" }
        , { type: 'totalScoreBomb', maxCount: 6, failCount: 0, desc: "累计触发6个分数炸弹" }
        , { type: 'totalBall', maxCount: 1500, failCount: 0, desc: "累计消除1500个果冻" }
        , { type: 'totalExp', maxCount: 240, failCount: 0, desc: "累计获得240经验" }
        , { type: 'totalBomb', maxCount: 24, failCount: 0, desc: "累计触发24个爆炸点" }
        , { type: 'totalScore', maxCount: 300000, failCount: 0, desc: "累计获得300000分" }
        , { type: 'totalBallX', maxCount: 300, failCount: 0, desc: "累计消除\"{果冻X}\"300个" }
        , { type: 'totalSkillX', maxCount: 6, failCount: 0, desc: "累计触发\"{果冻X}\"技能6次" }
        , { type: 'gameBallX', maxCount: 50, failCount: 3, desc: "单据消除\"{果冻X}\"50个" }
        , { type: "gameCombo", maxCount: 60, failCount: 5, desc: "连击达到60次" }
        , { type: "gameExp", maxCount: 60, failCount: 5, desc: "单局获得60经验" }
        , { type: "gameCoin", maxCount: 180, failCount: 5, desc: "单局获得180金币" }
        , { type: "gameBomb", maxCount: 6, failCount: 5, desc: "单局触发6个炸弹" }
        , { type: "gameSkill", maxCount: 3, failCount: 5, desc: "单局触发技能3次" }
        , { type: "gameScore", maxCount: 600000, failCount: 5, desc: "单据获得600000分" }
        , { type: 'gameLink', maxCount: 18, failCount: 5, desc: "单局连接18个果冻" }
        , { type: 'gameBall', maxCount: 280, failCount: 5, desc: "单局消除280个果冻" }
        , { type: 'gameExpBomb', maxCount: 2, failCount: 5, desc: "单据触发2个经验炸弹" }
        , { type: 'gameTimeBomb', maxCount: 2, failCount: 5, desc: "单据触发2个时间炸弹" }
        , { type: 'gameCoinBomb', maxCount: 2, failCount: 5, desc: "单据触发2个金币炸弹" }
        , { type: 'gameScoreBomb', maxCount: 2, failCount: 5, desc: "单据触发2个分数炸弹" }
        , { type: 'totalExpBomb', maxCount: 9, failCount: 0, desc: "累计触发9个经验炸弹" }
        , { type: 'totalTimeBomb', maxCount: 9, failCount: 0, desc: "累计触发9个时间炸弹" }
        , { type: 'totalCoinBomb', maxCount: 9, failCount: 0, desc: "累计触发9个金币炸弹" }
        , { type: 'totalScoreBomb', maxCount: 9, failCount: 0, desc: "累计触发9个分数炸弹" }
        , { type: 'totalBall', maxCount: 2250, failCount: 0, desc: "累计消除2250个果冻" }
        , { type: 'totalExp', maxCount: 360, failCount: 0, desc: "累计获得360经验" }
        , { type: 'totalBomb', maxCount: 36, failCount: 0, desc: "累计触发36个爆炸点" }
        , { type: 'totalScore', maxCount: 450000, failCount: 0, desc: "累计获得450000分" }
        , { type: 'totalBallX', maxCount: 450, failCount: 0, desc: "累计消除\"{果冻X}\"450个" }
        , { type: 'totalSkillX', maxCount: 9, failCount: 0, desc: "累计触发\"{果冻X}\"技能9次" }
        , { type: 'gameBallX', maxCount: 60, failCount: 5, desc: "单据消除\"{果冻X}\"60个" }
        , { type: "gameCombo", maxCount: 80, failCount: 0, desc: "连击达到80次" }
        , { type: "gameExp", maxCount: 90, failCount: 0, desc: "单局获得90经验" }
        , { type: "gameCoin", maxCount: 270, failCount: 0, desc: "单局获得270金币" }
        , { type: "gameBomb", maxCount: 9, failCount: 0, desc: "单局触发9个炸弹" }
        , { type: "gameSkill", maxCount: 4, failCount: 0, desc: "单局触发技能4次" }
        , { type: "gameScore", maxCount: 1000000, failCount: 0, desc: "单据获得1000000分" }
        , { type: 'gameLink', maxCount: 25, failCount: 0, desc: "单局连接25个果冻" }
        , { type: 'gameBall', maxCount: 360, failCount: 0, desc: "单局消除360个果冻" }
        , { type: 'gameExpBomb', maxCount: 3, failCount: 0, desc: "单据触发3个经验炸弹" }
        , { type: 'gameTimeBomb', maxCount: 3, failCount: 0, desc: "单据触发3个时间炸弹" }
        , { type: 'gameCoinBomb', maxCount: 3, failCount: 0, desc: "单据触发3个金币炸弹" }
        , { type: 'gameScoreBomb', maxCount: 3, failCount: 0, desc: "单据触发3个分数炸弹" }
        , { type: 'totalExpBomb', maxCount: 15, failCount: 0, desc: "累计触发15个经验炸弹" }
        , { type: 'totalTimeBomb', maxCount: 15, failCount: 0, desc: "累计触发15个时间炸弹" }
        , { type: 'totalCoinBomb', maxCount: 15, failCount: 0, desc: "累计触发15个金币炸弹" }
        , { type: 'totalScoreBomb', maxCount: 15, failCount: 0, desc: "累计触发15个分数炸弹" }
        , { type: 'totalBall', maxCount: 3600, failCount: 0, desc: "累计消除3600个果冻" }
        , { type: 'totalExp', maxCount: 800, failCount: 0, desc: "累计获得800经验" }
        , { type: 'totalBomb', maxCount: 54, failCount: 0, desc: "累计触发54个爆炸点" }
        , { type: 'totalScore', maxCount: 10000000, failCount: 0, desc: "累计获得10000000分" }
        , { type: 'totalBallX', maxCount: 800, failCount: 0, desc: "累计消除\"{果冻X}\"800个" }
        , { type: 'totalSkillX', maxCount: 15, failCount: 0, desc: "累计触发\"{果冻X}\"技能15次" }
        , { type: 'gameBallX', maxCount: 90, failCount: 0, desc: "单据消除\"{果冻X}\"90个" }
        , { type: "gameCombo", maxCount: 120, failCount: 0, desc: "连击达到120次" }
        , { type: "gameExp", maxCount: 120, failCount: 0, desc: "单局获得120经验" }
        , { type: "gameCoin", maxCount: 400, failCount: 0, desc: "单局获得400金币" }
        , { type: "gameBomb", maxCount: 13, failCount: 0, desc: "单局触发13个炸弹" }
        , { type: "gameSkill", maxCount: 6, failCount: 0, desc: "单局触发技能6次" }
        , { type: "gameScore", maxCount: 1500000, failCount: 0, desc: "单据获得1500000分" }
        , { type: 'gameLink', maxCount: 32, failCount: 0, desc: "单局连接32个果冻" }
        , { type: 'gameBall', maxCount: 500, failCount: 0, desc: "单局消除500个果冻" }
        , { type: 'gameExpBomb', maxCount: 3, failCount: 0, desc: "单据触发3个经验炸弹" }
        , { type: 'gameTimeBomb', maxCount: 3, failCount: 0, desc: "单据触发3个时间炸弹" }
        , { type: 'gameCoinBomb', maxCount: 3, failCount: 0, desc: "单据触发3个金币炸弹" }
        , { type: 'gameScoreBomb', maxCount: 3, failCount: 0, desc: "单据触发3个分数炸弹" }
        , { type: 'totalExpBomb', maxCount: 25, failCount: 0, desc: "累计触发25个经验炸弹" }
        , { type: 'totalTimeBomb', maxCount: 25, failCount: 0, desc: "累计触发25个时间炸弹" }
        , { type: 'totalCoinBomb', maxCount: 25, failCount: 0, desc: "累计触发25个金币炸弹" }
        , { type: 'totalScoreBomb', maxCount: 25, failCount: 0, desc: "累计触发25个分数炸弹" }
        , { type: 'totalBall', maxCount: 5400, failCount: 0, desc: "累计消除5400个果冻" }
        , { type: 'totalExp', maxCount: 1200, failCount: 0, desc: "累计获得1200经验" }
        , { type: 'totalBomb', maxCount: 80, failCount: 0, desc: "累计触发80个爆炸点" }
        , { type: 'totalScore', maxCount: 15000000, failCount: 0, desc: "累计获得15000000分" }
        , { type: 'totalBallX', maxCount: 1200, failCount: 0, desc: "累计消除\"{果冻X}\"1200个" }
        , { type: 'totalSkillX', maxCount: 22.5, failCount: 0, desc: "累计触发\"{果冻X}\"技能22.5次" }
        , { type: 'gameBallX', maxCount: 90, failCount: 0, desc: "单据消除\"{果冻X}\"90个" }
    ]
    */
    function merge(obj1, obj2) {
        var obj3 = {};
        for (var key in obj1)
            obj3[key] = obj1[key];
        for (var key in obj2)
            obj3[key] = obj2[key];
        return obj3;
    }
    if (typeof process === 'object') {
        var parse = require("csv-parse/lib/sync");
        var iconv = require("iconv-lite");
        var fs = require('fs');
        var assert = require('assert');
        //读取任务模板
        var task_lib_records = parse(iconv.decode(fs.readFileSync(__dirname + '/WeeklyTaskLib.csv'), 'gbk'));
        TASK_LIB = [];
        TASK_LIB.push(null);
        for (var i = 1; i < task_lib_records.length; ++i) {
            var line = task_lib_records[i];
            var type = line[0];
            var count = parseInt(line[1]);
            var failCount = parseInt(line[2]);
            var desc = line[3];
            assert(TASK_LIST1.some(function (x) { return x.type === type; }), "\u4EFB\u52A1\u7C7B\u578Btype\u4E00\u5B9A\u8981\u6709\u6548\u7684,type=" + type);
            assert(count >= 0, 'count must be number >= 0');
            assert(failCount >= 0 && failCount <= 5, 'failCount must be a number >= 0 && <= 5');
            assert(typeof desc === 'string', 'desc must be a string');
            TASK_LIB.push({ type: type, maxCount: count, failCount: failCount, desc: desc });
        }
        console.log("\u8BFB\u53D6\u4E86" + (task_lib_records.length - 1) + "\u6761\u5192\u9669\u4EFB\u52A1\u6A21\u677F");
        //读取所有任务们
        TASK_SETS = [];
        var currentTaskSet;
        var task_records = parse(iconv.decode(fs.readFileSync(__dirname + '/WeeklyTask.csv'), 'gbk'));
        for (var i = 0; i < task_records.length; ++i) {
            var line_1 = task_records[i];
            if (line_1[0] === 'id') {
                if (currentTaskSet)
                    TASK_SETS.push(currentTaskSet);
                currentTaskSet = {
                    id: line_1[1],
                    from: Date.parse(line_1[3]),
                    to: Date.parse(line_1[5]),
                    tasks: []
                };
                assert(currentTaskSet.from >= Date.parse('2000') && currentTaskSet.from <= Date.parse('3000'), 'from 日期必须正确');
                assert(currentTaskSet.to >= Date.parse('2000') && currentTaskSet.to <= Date.parse('3000'), 'from 日期必须正确');
                assert(currentTaskSet.to >= currentTaskSet.from, 'from,to 日期必须正确');
                assert(TASK_SETS.every(function (x) { return x.id != currentTaskSet.id; }), 'id不能有重复的');
            }
            else {
                assert(currentTaskSet);
                var task = TASK_LIB[parseInt(line_1[0])];
                var prizeObj = {};
                assert(task, '必须是一个有效的任务id');
                if (line_1[1]) {
                    var prizeType = line_1[1];
                    var prizeCount = parseInt(line_1[2]);
                    assert(['coin', 'heart', 'diamond'].indexOf(prizeType) >= 0, '必须是一个有效的奖励类型,type=' + prizeType);
                    assert(prizeCount >= 0, '奖励数量必须>=0');
                    prizeObj.prizeType = prizeType;
                    prizeObj.prizeCount = prizeCount;
                }
                currentTaskSet.tasks.push(merge(task, prizeObj));
            }
        }
        if (currentTaskSet)
            TASK_SETS.push(currentTaskSet);
        console.log('冒险任务：');
        for (var _i = 0, TASK_SETS_2 = TASK_SETS; _i < TASK_SETS_2.length; _i++) {
            var wt = TASK_SETS_2[_i];
            console.log("  id=" + wt.id + ", " + new Date(wt.from).toLocaleString() + " => " + new Date(wt.to).toLocaleString() + ", \u4E00\u5171" + wt.tasks.length + "\u6761\u4EFB\u52A1");
        }
        exports.initConfig = function (config) {
            config.TASK_SETS = TASK_SETS;
        };
    }
    else {
        var config = self.__GET_GAME_CONFIG();
        TASK_SETS = config.TASK_SETS;
        if (!TASK_SETS)
            alert('error load weekly task');
    }
});
define("client/src/game/GamePausePanel", ["require", "exports", "client/src/hall/HallUI", "client/src/ImageButton", "client/src/GameStage", "client/src/GameLink", "client/src/SoundManager", "client/src/resource"], function (require, exports, HallUI_51, ImageButton_34, GameStage_6, GameLink_28, SoundManager_6, res) {
    "use strict";
    var GamePausePanel = (function () {
        function GamePausePanel(game) {
            var _this = this;
            this.spr = new createjs.Container();
            {
                var bg = new createjs.Bitmap(HallUI_51.HallUI.getImage('hall/dialog_bg'));
                bg.set({
                    x: (res.GraphicConstant.SCREEN_WIDTH - bg.image.width) / 2,
                    y: 212
                });
                this.spr.addChild(bg);
            }
            var pause_text = new createjs.Bitmap(game.getImage('pause_text'));
            pause_text.set({ x: 227, y: 369 });
            this.spr.addChild(pause_text);
            var title = new createjs.Bitmap(HallUI_51.HallUI.getImage('hall/dialog_title'));
            title.x = (res.GraphicConstant.SCREEN_WIDTH - title.image.width) / 2;
            title.y = 76 + 212;
            this.spr.addChild(title);
            var btnok = new ImageButton_34.ImageButton(game.getImage('continue_button'));
            btnok.set({ x: 454, y: 511 });
            this.spr.addChild(btnok);
            var btncancel = new ImageButton_34.ImageButton(game.getImage('exit_button'));
            btncancel.set({ x: 202, y: 511 });
            this.spr.addChild(btncancel);
            btnok.onClick = function () {
                game._resumeGame();
                _this.hide();
            };
            btncancel.onClick = function () {
                GameStage_6.GameStage.instance.closeGame();
                GameLink_28.GameLink.instance.sendCancelGame();
                SoundManager_6.SoundManager.playBg('bgMain');
                _this.hide();
            };
        }
        GamePausePanel.prototype.show = function () {
            this.spr.visible = true;
        };
        GamePausePanel.prototype.hide = function () {
            this.spr.visible = false;
        };
        return GamePausePanel;
    }());
    exports.GamePausePanel = GamePausePanel;
});
define("client/src/game/GameTutorialDefine", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.TutorialDefine = [
        {
            x: 114, y: 481,
            saying: '\n欢迎来到果冻物语~\n下面请根据提示完成\n引导内容。',
        },
        {
            //自动高亮3个可以连接的球
            //允许用户连接这3个球
            //如果用户没有立即连接成功的话，显示saying2
            //连接爆炸完成之后，才显示后面的步骤
            x: 78, y: 350,
            saying: '果冻堆中存在着各种\n各样的果冻，3个或\n以上临近的果冻可以\n连接消除。',
            saying2: '试着连接高亮的果冻\n获得分数吧~',
            action: 'linkThree',
            wait: 1.3,
        },
        {
            x: 110, y: 478,
            saying: '干得不错！\n每次连接的果冻越多\n获得的分数就越多~',
        },
        {
            x: 110, y: 478,
            saying: '单次链接7个或以上\n的果冻时会在结尾处\n生成一个炸弹，点击\n炸弹会引爆炸弹周围\n的果冻。',
        },
        {
            //连接7个
            //一定要连接完成7个的
            x: 114, y: 289,
            saying: '试着一次性连接7个\n果冻吧~',
            action: 'linkSeven',
            wait: 1.3
        },
        {
            //高亮炸弹，并且只能点击炸弹
            x: 114, y: 289,
            saying: '炸弹出现了！由于炸\n弹点击就能引爆，使\n用得当的话是高combo\n高分的关键所在！',
            action: 'linkBomb',
            wait: 1.3,
        },
        {
            x: 114, y: 289,
            saying: '另外单次连接果冻数\n量达到10个或以\n上时炸弹可能会突变\n为更强力的特殊炸弹。',
            action: 'showBombInfo',
            ySpan: 65,
            bombInfo: [
                { x: 101, y: 271, text: '普通炸弹，点击后炸掉所有\n接触炸弹的果冻' },
                { x: 101, y: 271, text: '经验炸弹，使用后此局结算\n时携带宠物额外增加10点经验。' },
                { x: 101, y: 271, text: '金币炸弹，使用后此局结算\n金币额外增加10个。' },
                { x: 101, y: 271, text: '分数炸弹，使用后此次引爆\n获得分数翻倍增加。' },
                { x: 101, y: 271, text: '时间炸弹，使用后游戏倒计\n时增加两秒。' },
            ]
        },
        {
            //高亮一下技能按钮
            x: 102, y: 712,
            saying: '除了炸弹，游戏中每\n个果冻还有自己的技\n能。当消除一定数量\n的果冻后点击左下果\n冻就可释放宠物技能。',
            action: 'showSkill',
            blinkSkill: true,
        },
        {
            x: 116, y: 483,
            saying: '引导完毕，在游戏中\n尝试下刚刚引导的内\n容吧~'
        }
    ];
});
define("client/src/game/GameTutorial", ["require", "exports", "client/src/game/Game", "client/src/game/GameTutorialDefine", "client/src/ImageButton", "client/src/resource", "client/src/util", "client/src/MiniImageLoader"], function (require, exports, Game_1, GameTutorialDefine_1, ImageButton_35, res, util, MiniImageLoader_3) {
    "use strict";
    var GC = res.GraphicConstant;
    var GameTutorial = (function () {
        function GameTutorial(game) {
            this.spr = new createjs.Container();
            this.stepIndex = 0;
            this.balls = []; //选中的球们
            this.waitCallList = [];
            this.blinkBalls = false;
            this.lastTime = 0;
            this.ballBlinkFlag = true;
            this.isSkillBlink = false;
            this.skillBlinkFlag = true;
            this.fingerShow = false;
            this.fingerCurrentBall = 0;
            this.fingerNextBall = 0;
            FINGER_IMAGE.init();
            this.game = game;
            this.maskCanvas = document.createElement('canvas');
            this.maskCanvas.width = GC.SCREEN_WIDTH;
            this.maskCanvas.height = GC.SCREEN_HEIGHT;
            this.mask = new createjs.Bitmap(this.maskCanvas);
            this.spr.addChild(this.mask);
        }
        Object.defineProperty(GameTutorial.prototype, "action", {
            get: function () { return this.step && this.step.action; },
            enumerable: true,
            configurable: true
        });
        GameTutorial.prototype.getResource = function () {
            return [
                { id: 'tutorial/pet', src: 'images/tutorial/pet.png' },
                { id: 'tutorial/frame', src: 'images/tutorial/frame.png' },
                { id: 'tutorial/bombinfo', src: 'images/tutorial/bombinfo.png' },
                { id: 'tutorial/back', src: 'images/tutorial/后退.png' },
            ];
        };
        GameTutorial.prototype.canTouchBall = function (ball) {
            if (this.step) {
                if (['linkThree', 'linkSeven', 'linkBomb'].indexOf(this.action) >= 0) {
                    var ret = this.balls.indexOf(ball) >= 0;
                    if (ret)
                        this.blinkBalls = false;
                    return ret;
                }
                return false;
            }
            return true;
        };
        GameTutorial.prototype.canLinkBall = function (ball) {
            if (this.step) {
                if (['linkThree', 'linkSeven', 'linkBomb'].indexOf(this.action) >= 0) {
                    return this.balls.indexOf(ball) >= 0;
                }
                return false;
            }
            return true;
        };
        GameTutorial.prototype.canBombBalls = function (balls) {
            if (this.step) {
                if (['linkThree', 'linkSeven', 'linkBomb'].indexOf(this.action) >= 0) {
                    return balls.length === this.balls.length;
                }
                return false;
            }
            return true;
        };
        GameTutorial.prototype.isPreventPhysics = function () {
            if (this.step) {
                return this.waitCallList.length > 0;
            }
            return false;
        };
        GameTutorial.prototype.isTimePaused = function () {
            if (this.step)
                return true;
        };
        GameTutorial.prototype.isRunning = function () {
            return !!this.step;
        };
        //当连接成功了一次的时候调用一下，在某些阶段，自动进入下一阶段
        GameTutorial.prototype.triggerBomb = function () {
            var _this = this;
            if (this.step) {
                if (this.balls && this.balls.length > 0) {
                    this.balls = [];
                    if (typeof this.step.wait === 'number') {
                        this._waitCall(this.step.wait, function () { return _this._nextStep(); });
                    }
                    else {
                        this._nextStep();
                    }
                }
            }
        };
        //总是在mouseup时候调用
        GameTutorial.prototype.triggerClick = function (pt) {
            if (this.step) {
                if (this.waitCallList.length > 0)
                    return;
                if (this.backButton) {
                    if (Math.abs(pt.x - this.backButton.x) <= this.backButton.width / 2 &&
                        Math.abs(pt.y - this.backButton.y) <= this.backButton.height / 2) {
                        this._back();
                        return;
                    }
                }
                if (typeof this.step.saying2 === 'string') {
                    this._setPet(this.step.x, this.step.y, this.step.saying2);
                }
                if (this.action === 'linkThree' || this.action === 'linkSeven') {
                    this.blinkBalls = true;
                }
                if (!(this.balls && this.balls.length > 0)) {
                    this._nextStep();
                }
            }
        };
        //正式开始教程
        GameTutorial.prototype.start = function () {
            this.stepIndex = 0;
            this.step = GameTutorialDefine_1.TutorialDefine[0];
            this.fingerBitmap = new createjs.Bitmap(null);
            this.fingerBitmap.visible = false;
            this.fingerBitmap.set({
                regX: 34, regY: 32
            });
            this.spr.addChild(this.fingerBitmap);
            this._startStep(this.step);
            var btn = new ImageButton_35.ImageButton(this.game.getImage('tutorial/back'));
            this.spr.addChild(btn);
            btn.x = btn.width / 2 + 30;
            btn.y = btn.height / 2 + 30;
            this.backButton = btn;
        };
        GameTutorial.prototype.update = function () {
            var _this = this;
            for (var i = 0; i < this.waitCallList.length;) {
                if (this.game.tick >= this.waitCallList[i].tick) {
                    this.waitCallList[i].func();
                    this.waitCallList.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
            if (this.balls && this.balls.length >= 2) {
                var refindlink = false;
                for (var i = 0; i < this.balls.length - 1; ++i) {
                    if (!this.game.canLink(this.balls[i], this.balls[i + 1])) {
                        refindlink = true;
                        break;
                    }
                }
                if (refindlink) {
                    this._findLinkBalls(this.step.x, this.step.y + 30, this.balls.length);
                    this._resetFinger();
                }
            }
            if (this.blinkBalls) {
                var now = Date.now();
                if (now - this.lastTime >= 400) {
                    this.balls.forEach(function (x) { return x.skillHighlight = _this.ballBlinkFlag; });
                    this.ballBlinkFlag = !this.ballBlinkFlag;
                    this.lastTime = now;
                }
            }
            else {
                if (!this.ballBlinkFlag) {
                    this.balls.forEach(function (x) { return x.skillHighlight = _this.ballBlinkFlag; });
                    this.ballBlinkFlag = true;
                }
            }
            if (this.balls && this.balls.length > 0) {
                var repaint = false;
                if (this.balls.length != this.paintPoints.length) {
                    repaint = true;
                }
                else {
                    for (var i = 0; i < this.balls.length; ++i) {
                        var x = this.balls[i].position.x;
                        var y = this.balls[i].position.y;
                        if (Math.abs(x - this.paintPoints[i].x) >= 5 || Math.abs(y - this.paintPoints[i].y) >= 5) {
                            repaint = true;
                        }
                    }
                }
                if (repaint) {
                    this._paintMask();
                    this._highlightBalls();
                }
            }
            //blink skill
            if (this.isSkillBlink) {
                var now = Date.now();
                if (now - this.lastTime >= 400) {
                    this._paintMask();
                    if (this.skillBlinkFlag)
                        this._paintHighlighCircles(89, 1010, 80);
                    this.skillBlinkFlag = !this.skillBlinkFlag;
                    this.lastTime = now;
                }
            }
            this._updateFinger();
        };
        GameTutorial.prototype._back = function () {
            var _this = this;
            if (this.stepIndex > 0 && this.waitCallList.length === 0) {
                this.stepIndex--;
                this.step = GameTutorialDefine_1.TutorialDefine[this.stepIndex];
                this.game.balls.forEach(function (ball) {
                    if (ball.isBomb && ball.status === 'normal') {
                        _this.game.bombTheBomb(ball);
                    }
                });
                this._startStep(this.step);
            }
        };
        GameTutorial.prototype._startStep = function (step) {
            console.log('进入教程：' + JSON.stringify(step));
            this._hideFinger();
            if (this.bombInfoBitmap) {
                this.bombInfoBitmap.visible = false;
            }
            this.blinkBalls = false;
            this.step = step;
            this.balls = [];
            this._paintMask();
            this._setPet(step.x, step.y, step.saying);
            this.isSkillBlink = step.blinkSkill;
            if (typeof this.action === 'string' &&
                typeof this['_startAction_' + this.action] === 'function') {
                this['_startAction_' + this.action]();
            }
        };
        GameTutorial.prototype._nextStep = function () {
            if (GameTutorialDefine_1.TutorialDefine[this.stepIndex + 1]) {
                this.step = GameTutorialDefine_1.TutorialDefine[this.stepIndex + 1];
                ++this.stepIndex;
                this._startStep(this.step);
            }
            else {
                this.step = null;
                this.spr.visible = false;
            }
        };
        //等待n秒，进入下一步
        GameTutorial.prototype._waitCall = function (n, func) {
            this.waitCallList.push({
                tick: this.game.tick + n / GC.TICK_TIME,
                func: func
            });
        };
        //设置宠物说话。
        GameTutorial.prototype._setPet = function (x, y, text) {
            if (!this.petIcon) {
                this.petIcon = new createjs.Bitmap(this.game.getImage('tutorial/pet'));
                this.petIcon.regX = this.petIcon.image.width / 2;
                this.petIcon.regY = this.petIcon.image.height / 2;
                this.petTextFrame = new createjs.Bitmap(this.game.getImage('tutorial/frame'));
                this.petText = new createjs.Text('', '22px SimHei', 'white');
                this.petText.lineHeight = 22;
                this.spr.addChild(this.petIcon);
                this.spr.addChild(this.petTextFrame);
                this.spr.addChild(this.petText);
            }
            this.petIcon.x = x;
            this.petIcon.y = y;
            this.petIcon.scaleX = -1.5;
            this.petIcon.scaleY = 1.5;
            this.petTextFrame.x = x + 25;
            this.petTextFrame.y = y - 180;
            this.petText.x = x + 40;
            this.petText.y = y - 176;
            this.petText.text = text;
            this.petIcon.visible = true;
            this.petText.visible = true;
            this.petTextFrame.visible = true;
        };
        //隐藏说话的宠物
        GameTutorial.prototype._hidePet = function () {
            if (this.petIcon) {
                this.petIcon.visible = false;
                this.petText.visible = false;
                this.petTextFrame.visible = false;
            }
        };
        //清空mask
        GameTutorial.prototype._paintMask = function () {
            /*let g = this.mask.graphics;
            g.clear();
            g.beginFill('rgba(0,0,0,0.8)');
            g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
            g.endFill();
            */
            var ctx = this.maskCanvas.getContext('2d');
            ctx.clearRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
        };
        //画一个高亮的园
        GameTutorial.prototype._paintHighlighCircles = function (x, y, radius) {
            var ctx = this.maskCanvas.getContext('2d');
            {
                ctx.save();
                ctx.fillStyle = 'rgba(1,1,1,1)';
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        };
        GameTutorial.prototype._startAction_linkThree = function () {
            this.balls = [];
            this._findLinkBalls(this.step.x, this.step.y + 30, 3);
            this._resetFinger();
        };
        GameTutorial.prototype._startAction_linkSeven = function () {
            this.balls = [];
            this._findLinkBalls(this.step.x, this.step.y + 30, 7);
            this._resetFinger();
        };
        GameTutorial.prototype._startAction_linkBomb = function () {
            for (var _i = 0, _a = this.game.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (ball.isBomb) {
                    this.balls = [ball];
                    this._highlightBalls();
                    this._resetFinger();
                    break;
                }
            }
        };
        GameTutorial.prototype._startAction_showBombInfo = function () {
            if (!this.bombInfoBitmap) {
                this.bombInfoBitmap = new createjs.Bitmap(this.game.getImage('tutorial/bombinfo'));
                this.bombInfoBitmap.x = 99;
                this.bombInfoBitmap.y = 353;
                this.spr.addChild(this.bombInfoBitmap);
            }
            this.bombInfoBitmap.visible = true;
        };
        GameTutorial.prototype._findLinkBalls = function (x, y, count) {
            var _this = this;
            this.balls = [];
            var distSqr = (Game_1.Game.MAX_LINK_DISTANCE - 10) * (Game_1.Game.MAX_LINK_DISTANCE - 10);
            var balls = this.game.balls.filter(function (x) { return !x.isBomb && x.status === 'normal' && x.position.y > y; });
            var game = this.game;
            function link(currentBalls, count) {
                if (count <= 0)
                    return currentBalls;
                var lastBall = currentBalls[currentBalls.length - 1];
                var pos = lastBall.position;
                game.nextLinkIgnoreColor = true; //临时设置成true，下面调用canLink的时候就会忽略颜色匹配了。
                var nextBalls = balls.filter(function (x) {
                    if (currentBalls.indexOf(x) < 0 && util.sqrDistance(x.position, pos) <= distSqr && game.canLink(lastBall, x))
                        return true;
                    return false;
                }).map(function (ball) {
                    //为了让nextBalls按照越靠近右下方向的排序。（pi/4的夹角，越小越靠近右下方向）
                    var angle = Math.atan2(ball.position.y - pos.y, ball.position.x - pos.x);
                    var dist;
                    if (angle > 0) {
                        dist = Math.abs(angle - Math.PI / 4);
                    }
                    else {
                        dist = Math.PI - Math.abs(-angle - 3 * Math.PI / 4);
                    }
                    return { ball: ball, dist: dist };
                });
                game.nextLinkIgnoreColor = false;
                nextBalls.sort(function (a, b) { return a.dist - b.dist; });
                for (var i = 0; i < nextBalls.length; ++i) {
                    var arr = currentBalls.slice();
                    arr.push(nextBalls[i].ball);
                    var ret = link(arr, count - 1);
                    if (ret)
                        return ret;
                }
                return null;
            }
            for (var _i = 0, balls_17 = balls; _i < balls_17.length; _i++) {
                var ball = balls_17[_i];
                var ret = link([ball], count - 1);
                if (ret) {
                    this.balls = ret;
                    this._highlightBalls();
                    this.balls.forEach(function (x) {
                        if (x.color !== _this.balls[0].color) {
                            x.changeColor(_this.balls[0].getDefine());
                        }
                    });
                    break;
                }
            }
        };
        GameTutorial.prototype._highlightBalls = function () {
            var _this = this;
            this._paintMask();
            this.paintPoints = [];
            this.balls.forEach(function (x) {
                _this._paintHighlighCircles(x.position.x, x.position.y, _this.balls.length === 1 ? 100 : 75);
                _this.paintPoints.push({ x: x.position.x, y: x.position.y });
            });
        };
        GameTutorial.prototype._resetFinger = function () {
            this.fingerShow = true;
            var bitmap = this.fingerBitmap;
            bitmap.image = FINGER_IMAGE.result;
            if (!this.balls || this.balls.length == 0) {
                bitmap.visible = false;
                return;
            }
            if (this.balls.length >= 1) {
                bitmap.visible = true;
                bitmap.set({
                    x: this.balls[0].position.x,
                    y: this.balls[0].position.y
                });
                this.fingerCurrentBall = 0;
                this.fingerNextBall = 1;
            }
        };
        GameTutorial.prototype._updateFinger = function () {
            if (!this.fingerShow)
                return;
            var bitmap = this.fingerBitmap;
            var balls = this.balls;
            bitmap.image = FINGER_IMAGE.result;
            if (!balls || balls.length === 0) {
                bitmap.visible = false;
                return;
            }
            bitmap.visible = true;
            if (balls.length === 1) {
                bitmap.set({
                    x: this.balls[0].position.x,
                    y: this.balls[0].position.y
                });
                return;
            }
            var step = 10;
            if (this.fingerNextBall >= balls.length) {
                this.fingerCurrentBall = balls.length - 1;
                this.fingerNextBall = balls.length - 2;
                var ball = balls[this.fingerCurrentBall];
                if (ball) {
                    bitmap.x = ball.position.x;
                    bitmap.y = ball.position.y;
                }
            }
            else if (this.fingerNextBall < 0) {
                this.fingerNextBall = 1;
                this.fingerCurrentBall = 0;
                var ball = balls[this.fingerCurrentBall];
                if (ball) {
                    bitmap.x = ball.position.x;
                    bitmap.y = ball.position.y;
                }
            }
            else {
                var ball = balls[this.fingerNextBall];
                if (ball) {
                    var dist = Math.sqrt(util.sqrDistance(ball.position, bitmap));
                    if (dist <= step) {
                        bitmap.x = ball.position.x;
                        bitmap.y = ball.position.y;
                        if (this.fingerNextBall < this.fingerCurrentBall) {
                            --this.fingerNextBall;
                            --this.fingerCurrentBall;
                        }
                        else {
                            ++this.fingerNextBall;
                            ++this.fingerCurrentBall;
                        }
                    }
                    else {
                        var dx = ball.position.x - bitmap.x;
                        var dy = ball.position.y - bitmap.y;
                        bitmap.x += dx / dist * step;
                        bitmap.y += dy / dist * step;
                    }
                }
            }
        };
        GameTutorial.prototype._hideFinger = function () {
            this.fingerShow = false;
            this.fingerBitmap.visible = false;
        };
        return GameTutorial;
    }());
    exports.GameTutorial = GameTutorial;
    var FINGER_IMAGE = new MiniImageLoader_3.MiniImageLoader('images/Game/引导手指.png', function (result) { return result; });
});
define("client/src/game/NeedMoreTimeDialog", ["require", "exports", "client/src/hall/HallUI", "client/src/resource", "client/src/ImageButton", "client/src/GameLink", "client/src/hall/confirm_dialog/ConfirmDialog"], function (require, exports, HallUI_52, resource_25, ImageButton_36, GameLink_29, ConfirmDialog_2) {
    "use strict";
    var NeedMoreTimeDialog = (function () {
        function NeedMoreTimeDialog(game) {
            var _this = this;
            this.spr = new createjs.Container();
            var mask = new createjs.Shape();
            {
                var g = mask.graphics;
                g.beginFill('rgba(0,0,0,0.5)');
                g.drawRect(0, 0, resource_25.GraphicConstant.SCREEN_WIDTH, resource_25.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
            }
            this.spr.addChild(mask);
            //background
            var bg = new createjs.Bitmap(HallUI_52.HallUI.getImage('hall/dialog_bg'));
            bg.set({ x: 45, y: 266 });
            this.spr.addChild(bg);
            //title
            var title = new createjs.Bitmap(game.getImage('more_time_title'));
            title.set({ x: 270, y: 340 });
            this.spr.addChild(title);
            //text1
            var text1 = new createjs.Bitmap(game.getImage('more_time_text1'));
            text1.set({ x: 148, y: 414 });
            this.spr.addChild(text1);
            //text2
            var text2 = new createjs.Bitmap(game.getImage('more_time_text2'));
            text2.set({ x: 69, y: 467 });
            this.spr.addChild(text2);
            var btnGiveUp = new ImageButton_36.ImageButton(game.getImage('more_time_giveup'));
            btnGiveUp.set({ x: 221, y: 588 });
            this.spr.addChild(btnGiveUp);
            btnGiveUp.onClick = function () { return _this._onClickGiveUp(); };
            var btnNeed = new ImageButton_36.ImageButton(game.getImage('more_time_need'));
            btnNeed.set({ x: 426, y: 588 });
            this.spr.addChild(btnNeed);
            btnNeed.onClick = function () { return _this._onClickNeed(); };
            this._diamondText = new createjs.Text('999', '23px SimHei', 'white');
            this._diamondText.set({
                x: 278, y: 494,
                textAlign: 'right'
            });
            this.spr.addChild(this._diamondText);
        }
        NeedMoreTimeDialog.prototype.show = function (onOk, onCancel) {
            this._diamondText.text = GameLink_29.GameLink.instance.diamond.toString();
            this._onOk = onOk;
            this._onCancel = onCancel;
        };
        NeedMoreTimeDialog.prototype._onClickGiveUp = function () {
            if (this._onCancel)
                this._onCancel();
            this._close();
        };
        NeedMoreTimeDialog.prototype._onClickNeed = function () {
            if (GameLink_29.GameLink.instance.diamond < 5) {
                var dlg = new ConfirmDialog_2.ConfirmDialog();
                dlg.show('钻石不足');
                this.spr.addChild(dlg.spr);
                return;
            }
            if (this._onOk)
                this._onOk();
            this._close();
        };
        NeedMoreTimeDialog.prototype._close = function () {
            if (this.spr.parent) {
                this.spr.parent.removeChild(this.spr);
            }
        };
        return NeedMoreTimeDialog;
    }());
    exports.NeedMoreTimeDialog = NeedMoreTimeDialog;
});
define("client/src/game/VSBar", ["require", "exports", "client/src/hall/HallUI"], function (require, exports, HallUI_53) {
    "use strict";
    var VSBar = (function (_super) {
        __extends(VSBar, _super);
        function VSBar() {
            _super.call(this);
            this._width = 355;
            this._height = 38;
            this._percent = 0.5;
            this.hitArea = new createjs.Shape();
        }
        Object.defineProperty(VSBar.prototype, "width", {
            get: function () { return this._width; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VSBar.prototype, "height", {
            get: function () { return this._height; },
            enumerable: true,
            configurable: true
        });
        VSBar.prototype.prepare = function () {
            var redDotImage = HallUI_53.HallUI.getImage('hall/pager_point_empty');
            var yellowDotImage = HallUI_53.HallUI.getImage('hall/pager_point_full');
            var orgImageWidth = [9, 2, 9];
            var orgImageHeight = 20;
            var width = this._width;
            var height = this._height;
            this._redBar = create(redDotImage);
            this._yellowBar = create(yellowDotImage);
            function create(image) {
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ww = [
                    orgImageWidth[0] * height / orgImageHeight,
                    width,
                    orgImageWidth[2] * height / orgImageHeight,
                ];
                ww[1] = width - ww[0] - ww[2];
                var ctx = canvas.getContext('2d');
                var dx = 0;
                var sx = 0;
                ctx.drawImage(image, sx, 0, orgImageWidth[0], orgImageHeight, dx, 0, ww[0], height);
                dx += ww[0];
                sx += orgImageWidth[0];
                ctx.drawImage(image, sx, 0, orgImageWidth[1], orgImageHeight, dx, 0, ww[1], height);
                dx += ww[1];
                sx += orgImageWidth[1];
                ctx.drawImage(image, sx, 0, orgImageWidth[2], orgImageHeight, dx, 0, ww[2], height);
                return canvas;
            }
        };
        VSBar.prototype.draw = function (ctx, ignoreCache) {
            if (!this._redBar) {
                this.prepare();
                if (!this._redBar)
                    return false;
            }
            var x = this.x | 0;
            var y = this.y | 0;
            var width1 = (this._width * this._percent) | 0;
            var width2 = this._width - width1;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, width1, this._height);
            ctx.clip();
            ctx.drawImage(this._yellowBar, x, y);
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.rect(x + width1, y, width2, this._height);
            ctx.clip();
            ctx.drawImage(this._redBar, x, y);
            ctx.restore();
            return true;
        };
        return VSBar;
    }(createjs.DisplayObject));
    exports.VSBar = VSBar;
});
define("client/src/game/MatchUI", ["require", "exports", "client/src/game/VSBar", "client/src/FixSizeBitmap", "client/src/hall/HallUI"], function (require, exports, VSBar_1, FixSizeBitmap_4, HallUI_54) {
    "use strict";
    var ADD_Y = 65;
    var MatchUI = (function () {
        function MatchUI(type) {
            this.spr = new createjs.Container();
            this._faceIcons = [];
            this._scoresText = [];
            this._scores = [];
            this._vsbarPercent = 0.5;
            this._vsbarPercent2 = 0.5;
            this._vsbar = new VSBar_1.VSBar();
            this._vsbar.x = 320 - this._vsbar.width / 2;
            this._vsbar.y = 143 + ADD_Y;
            this.spr.addChild(this._vsbar);
            var defaultIcon = HallUI_54.HallUI.getImage('hall/default_user_headicon');
            var icon1 = new createjs.Bitmap(null);
            icon1.set({ x: 320 - 219, y: 152 + ADD_Y });
            FixSizeBitmap_4.MakeSuitableSize(icon1, 61, 61, defaultIcon);
            icon1.hitArea = new createjs.Shape();
            this.spr.addChild(icon1);
            this._faceIcons.push(icon1);
            var icon2 = new createjs.Bitmap(null);
            icon2.set({ x: 320 + 219, y: 152 + ADD_Y });
            FixSizeBitmap_4.MakeSuitableSize(icon2, 61, 61, defaultIcon);
            icon2.hitArea = new createjs.Shape();
            this.spr.addChild(icon2);
            this._faceIcons.push(icon2);
            var score1 = new createjs.Text('0', '20px SimHei', 'white');
            score1.set({
                textAlign: 'left',
                x: 320 - 163,
                y: 151 + ADD_Y
            });
            this.spr.addChild(score1);
            this._scoresText.push(score1);
            this._scores.push(0);
            var score2 = new createjs.Text('0', '20px SimHei', 'white');
            score2.set({
                textAlign: 'right',
                x: 320 + 163,
                y: 151 + ADD_Y
            });
            this.spr.addChild(score2);
            this._scoresText.push(score2);
            this._scores.push(0);
            if (['44', 'master'].indexOf(type) >= 0) {
                var DOWN_PIXELS = 70;
                this._vsbar2 = new VSBar_1.VSBar();
                this._vsbar2.set({
                    x: 320 - this._vsbar.width / 2,
                    y: 143 + DOWN_PIXELS + ADD_Y
                });
                this.spr.addChild(this._vsbar2);
                var icon3 = new createjs.Bitmap(null);
                icon3.set({ x: 320 - 219, y: 152 + DOWN_PIXELS + ADD_Y });
                FixSizeBitmap_4.MakeSuitableSize(icon3, 61, 61, defaultIcon);
                icon3.hitArea = new createjs.Shape();
                this.spr.addChild(icon3);
                this._faceIcons.push(icon3);
                var icon4 = new createjs.Bitmap(null);
                icon4.set({ x: 320 + 219, y: 152 + DOWN_PIXELS + ADD_Y });
                FixSizeBitmap_4.MakeSuitableSize(icon4, 61, 61, defaultIcon);
                icon4.hitArea = new createjs.Shape();
                this.spr.addChild(icon4);
                this._faceIcons.push(icon4);
                var score3 = new createjs.Text('0', '20px SimHei', 'white');
                score3.set({
                    textAlign: 'left',
                    x: 320 - 163,
                    y: 151 + DOWN_PIXELS + ADD_Y
                });
                this.spr.addChild(score3);
                this._scoresText.push(score3);
                this._scores.push(0);
                var score4 = new createjs.Text('0', '20px SimHei', 'white');
                score4.set({
                    textAlign: 'right',
                    x: 320 + 163,
                    y: 151 + DOWN_PIXELS + ADD_Y
                });
                this.spr.addChild(score4);
                this._scoresText.push(score4);
                this._scores.push(0);
            }
        }
        MatchUI.prototype.setFaceUrl = function (idx, url) {
            if (this._faceIcons[idx]) {
                var image = new Image();
                image.src = url;
                this._faceIcons[idx].image = image;
            }
        };
        MatchUI.prototype.setScore = function (idx, score) {
            if (this._scoresText[idx]) {
                this._scores[idx] = score;
                this._scoresText[idx].text = (score | 0).toString();
                //update percent;
                var s1 = this._scores[0];
                var s2 = this._scores[1];
                var percent = calcPercent(s1, s2);
                if (percent !== this._vsbarPercent) {
                    this._vsbarPercent = percent;
                    if (this._vsbarPercentAnimation) {
                        this._vsbarPercentAnimation.setPaused(true);
                    }
                    this._vsbarPercentAnimation = createjs.Tween.get(this._vsbar).to({ _percent: percent }, 200, createjs.Ease.cubicInOut);
                }
                if (this._vsbar2) {
                    var percent2 = calcPercent(this._scores[2], this._scores[3]);
                    if (percent2 !== this._vsbarPercent2) {
                        this._vsbarPercent2 = percent2;
                        if (this._vsbarPercentAnimation2) {
                            this._vsbarPercentAnimation2.setPaused(true);
                        }
                        this._vsbarPercentAnimation2 = createjs.Tween.get(this._vsbar2).to({ _percent: percent2 }, 200, createjs.Ease.cubicInOut);
                    }
                }
            }
            function calcPercent(s1, s2) {
                var percent = 0.5;
                if (s1 == s2) {
                    percent = 0.5;
                }
                else if (s1 <= 0) {
                    percent = 0;
                }
                else if (s2 <= 0) {
                    percent = 1;
                }
                else {
                    percent = s1 / (s1 + s2);
                }
                return percent;
            }
        };
        return MatchUI;
    }());
    exports.MatchUI = MatchUI;
    window['MatchUI'] = MatchUI;
});
define("client/src/game/Game", ["require", "exports", "client/src/resource", "client/src/GameStage", "client/src/resource", "client/src/game/BallRenderer", "client/src/game/Ball", "client/src/util", "client/src/game/GameImageLoader", "client/src/MiniImageLoader", "client/src/game/GameRules", "client/src/game/GameUtil", "client/src/game/LineRenderer", "client/src/game/ScoreControl", "client/src/game/SkillButton", "client/src/game/skill/AllSkill", "client/src/game/GameAnimation", "client/src/game/FeverBar", "client/src/GameItemDefine", "client/src/GameLink", "client/src/hall/HallUI", "shared/WeeklyTaskDefine", "client/src/SoundManager", "client/src/ImageButton", "client/src/game/GamePausePanel", "client/src/game/GameTutorial", "shared/PetRules", "GameWorkerMain", "client/src/game/MatchUI", "client/src/hall/shared/BitmapText"], function (require, exports, resource_26, GameStage_7, res, BallRenderer_1, Ball_6, util, GameImageLoader_1, MiniImageLoader_4, GameRules, GameUtil, LineRenderer_1, ScoreControl_1, SkillButton_1, AllSkill, GameAnimation_1, FeverBar_1, GameItemDefine, GameLink_30, HallUI_55, WT, SoundManager_7, ImageButton_37, GamePausePanel_1, GameTutorial_1, PetRules, GameWroker, MatchUI_1, BitmapText_6) {
    "use strict";
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var COMBO_TIMEOUT = 3;
    var SHAKE_TIMEOUT = 1;
    /** 炸弹的爆炸半径，圆心落入半径的都被炸掉 */
    var BOMB_RADIUS = Ball_6.Ball.MAX_RADIUS * 2.5 * 1.333;
    //下面的关于fever的数值。假定fever满是1.0（38格）
    /**每个球增加的fever */
    var FEVER_ADD_PER_BALL = 1 / 38;
    /**每秒减少的fever数量 */
    var FEVER_DECREASE_PER_SECOND = 1 / 38;
    /**fever的时候每秒减少的fever数量 */
    var FEVER_DECREASE_WHEN_FEVER_PER_SECOND = 4 / 38;
    /**fever的时候加多少游戏时间 */
    var FEVER_ADD_GAME_TIME = 5;
    /**fever时候分数加的倍数 */
    var FEVER_SCORE_MULTIPY = 1.3;
    // 自动爆炸炸弹
    var AUTO_BOMB_FIRST_DELAY = 2.5;
    var AUTO_BOMB_DELAY = 2;
    var g_CachedWorker = null;
    var g_GameId = 112;
    var Game = (function () {
        /*
            Game 启动流程：
                1. 开始载入图片，同时启动Web Worker
                2. 上面两个都完成之后(_workerReady,_loadComplete)，调用startGame() (在_checkStart()中)
                3. 让Web Worker执行initPhysics
                4. 等到initPhysics完成后(收到initPhysicsReady)，调用startGame2()才正式开始游戏
        */
        /**
         * 构造流程： constructor() ， addChild() , init() 。。。载入资源  startGame()
         *
         */
        function Game() {
            this.id = g_GameId++;
            this.balls = [];
            this.tick = 0;
            this.minLinkCount = 3;
            //由技能设置，下一次连接可以忽略颜色
            this.nextLinkIgnoreColor = false;
            this.nextLinkIgnoreColor_MaxCount = 16;
            //将下一次点击事件发送给技能
            this.skillWantNextClick = false;
            //技能设置，连线周围的球会一起爆炸(是不是球炸的时候，类似于炸弹，会把周围的球一起炸了)
            this.wantBombAsBomb = false;
            // timing
            this._physicsTime = 0;
            this._logicTime = 0;
            this._timeScale = 1;
            this._coinScale = 1; //获得金币的倍率。为了技能
            this._loadComplete = false;
            this._isGameStart = false;
            this._lastShakeTime = 0; /**上一次摇一摇的时间. 配合摇一摇的冷却时间使用 */
            this._totalGameTime = 60 * 1000;
            this._gameStartTime = -1; //实际游戏开始时间
            this._wantStartGameTime = -1;
            this._leftGameTime = 0;
            this._isGamePaused = false; //游戏是否暂停中
            this._lastUpdateTime = -1; /**上一次update的Date.now()，用来计算两次update的间隔 */
            this._isGameOver = false;
            this._isTimeOver = false; /**游戏时间到了，但是游戏没有结束 */
            this._nextAutoBombTime = 0; /**下一次，自动爆炸球的时间。timeover之后，gameover之前。*/
            /**
             * 当时间用完的时候，游戏并不是立刻结束
             * 这个值保存着，最后发生的事件的时候。所以当时间超过了 大约_gameOverCheckTime+1000的时候结束。
             * 所以，当有球发生爆炸的时候，this._gameOverCheckTime = Date.now();
             * */
            this._gameOverCheckTime = 0;
            // linking variable
            this._isLinking = false;
            this._wantDropBall = 0;
            //private _linkCountUI: createjs.Container;
            // bomb
            this._bombBalls = [];
            this._comboCount = 0; /**当前连击次数，默认是0 */
            this._comboTimeoutTime = 0; /**连击次数清0的时间 ms */
            this._comboDisappearTime = 0; /**连击UI消失的时间ms */
            this._bombSoundIndex = 0;
            this._workerReady = false;
            this._physicsPaused = false;
            // fever
            this._isInFever = false;
            this._feverBonusScore = 0;
            //分数统计，用来最后提交给服务器的
            this._score = 0;
            this._coin = 0;
            this._bombCount = 0; //炸炸弹次数
            this._feverCount = 0; //进入fever次数
            this._skillCount = 0;
            this._maxCombo = 0;
            this._maxLink = 0;
            this._expBomb = 0;
            this._timeBomb = 0;
            this._coinBomb = 0;
            this._scoreBomb = 0;
            /**当前提示用来连接的球 */
            this._hintBalls = [];
            /**用来记录最后的操作时间（球爆炸等），超过一定时间，则会显示出提示 */
            this._lastActionTime = 0;
            //在对战模式下，定时发送自己的分数。这个就是用来定时的变量啦
            this._lastSendUpdateTime = 0;
            this._isPreviousNearTimeOver = false;
            this._deltaTime = 0;
            this.bombTheBomb = this._bombTheBomb;
            this.canLink = this._canLink; //make it public
            this._needMoreTimeStatus = 'no'; //还没有显示，显示中，已经显示过了
            this.spr = new createjs.Container();
            this.spr.setBounds(0, 0, resource_26.GraphicConstant.SCREEN_WIDTH, resource_26.GraphicConstant.SCREEN_HEIGHT); //为了让能够接受所有鼠标消息
            this.spr.name = "Game Sprite";
            this._animation = new GameAnimation_1.GameAnimation(this);
            window["game"] = this;
        }
        Object.defineProperty(Game.prototype, "physicsTime", {
            get: function () { return this._physicsTime; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game.prototype, "logicTime", {
            get: function () { return this._logicTime; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game.prototype, "_fever", {
            get: function () { return this.feverBar.value; },
            set: function (val) { this.feverBar.value = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game.prototype, "mainPetId", {
            get: function () { return this._gameStartInfo.pets[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game.prototype, "BALL_RES", {
            /**BALL_RES就是普通球的资源，不包括炸弹 */
            get: function () { return this._BALL_RES; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game.prototype, "isMatch", {
            get: function () { return this._gameStartInfo.isMatch; },
            enumerable: true,
            configurable: true
        });
        Game.prototype.init = function (info) {
            var _this = this;
            SoundManager_7.SoundManager.playBg(null);
            if (!info.isMatch) {
                this._weeklyTask = GameLink_30.GameLink.instance.getCurrentWeeklyTask();
            }
            else {
            }
            this._gameStartInfo = info;
            this._skill = AllSkill.createSkill(PetRules.PET_SKILL[info.pets[0]]);
            if (info.tutorial) {
                this._tutorial = new GameTutorial_1.GameTutorial(this);
            }
            if (g_CachedWorker) {
                this._worker = g_CachedWorker;
                this._workerReady = true;
            }
            else {
                this._worker = GameWroker.createWorker(); //new Worker('script/worker.js');
            }
            var func = function (obj) { return _this._onWorkerMessage(obj); };
            this._worker.addEventListener('message', func);
            this._worker['token'] = func;
            GameStage_7.GameStage.instance.setCssBackground('images/background.jpg');
            var spr = this.spr;
            {
                var mousedown_1 = function (e) { return _this.onMouseDown(e); };
                var mouseup_1 = function (e) { return _this.onMouseUp(e); };
                var mousemove_1 = function (e) { return _this.onMouseMove(e); };
                var stage_1 = this.spr.stage;
                stage_1.addEventListener('stagemousedown', mousedown_1);
                stage_1.addEventListener('stagemouseup', mouseup_1);
                stage_1.addEventListener('stagemousemove', mousemove_1);
                this._clearEvents = function () {
                    stage_1.removeEventListener('stagemousedown', mousedown_1);
                    stage_1.removeEventListener('stagemouseup', mouseup_1);
                    stage_1.removeEventListener('stagemousemove', mousemove_1);
                };
            }
            {
                //let game_task_bg_image = this.getImage('game_task_bg');
                var game_task_bg = new createjs.Bitmap(null);
                //game_task_bg.x = (GC.SCREEN_WIDTH - game_task_bg_image.width) / 2;
                spr.addChild(game_task_bg);
                this.gameTaskBg = game_task_bg;
                if (this.isMatch) {
                    var link = GameLink_30.GameLink.instance;
                    this._matchUI = new MatchUI_1.MatchUI(this._gameStartInfo.matchType);
                    this.spr.addChild(this._matchUI.spr);
                    this._matchUI.setFaceUrl(0, link.faceurl);
                    if (link.matchPlayers[0] && link.matchPlayers[0].faceurl) {
                        this._matchUI.setFaceUrl(1, link.matchPlayers[0].faceurl);
                    }
                }
            }
            {
                this.feverMask = new createjs.Shape();
                {
                    var g = this.feverMask.graphics;
                    g.beginFill('rgba(0,0,0,0.6)');
                    g.drawRect(0, 0, resource_26.GraphicConstant.SCREEN_WIDTH, resource_26.GraphicConstant.SCREEN_HEIGHT);
                    g.endFill();
                }
                this.feverMask.visible = false;
                spr.addChild(this.feverMask);
                this._scoreControl = new ScoreControl_1.ScoreControl(32 * res.GLOBAL_SCALE + "px SimHei");
                this._scoreControl.spr.x = 380 * res.GLOBAL_SCALE;
                this._scoreControl.spr.y = 86 * res.GLOBAL_SCALE;
                spr.addChild(this._scoreControl.spr);
                this._coinControl = new ScoreControl_1.ScoreControl(24 * res.GLOBAL_SCALE + "px SimHei");
                this._coinControl.spr.x = 378 * res.GLOBAL_SCALE;
                this._coinControl.spr.y = 143 * res.GLOBAL_SCALE;
                spr.addChild(this._coinControl.spr);
                this._timerUI = new BitmapText_6.BitmapText();
                this._timerUI.align = 'center';
                this._timerUI.x = 97 * res.GLOBAL_SCALE;
                this._timerUI.y = 105 * res.GLOBAL_SCALE;
                spr.addChild(this._timerUI);
                spr.addChild(this._animation.feverEffectLayer);
                this._skillButton = new SkillButton_1.SkillButton();
                this._skillButton.spr.x = res.POSITIONS.SKILL_BUTTON.x;
                this._skillButton.spr.y = res.POSITIONS.SKILL_BUTTON.y;
                spr.addChild(this._skillButton.spr);
                {
                    //这个其实是没用的，参考下面的setMaxEnergy()
                    this._skillButton.setMaxEnergy(12);
                }
                this.ballRenderLayer = new BallRenderer_1.BallRenderer(this);
                spr.addChild(this.ballRenderLayer);
                /*
                            let feverText = new createjs.Bitmap(null);
                            feverText.name = 'feverText';
                            feverText.set({
                                x: 320,
                                y: 1007
                            });
                            spr.addChild(feverText);
                */
                this.feverBar = new FeverBar_1.FeverBar();
                spr.addChild(this.feverBar);
                this.lineLayer = new LineRenderer_1.LineRenderer();
                //spr.addChild(this.lineLayer);
                this.ballRenderLayer.lineRenderer = this.lineLayer;
                this.paintLayer = new createjs.Shape();
                spr.addChild(this.paintLayer);
                spr.addChild(this._animation.feverScoreLayer);
            }
            this.animationLayer = new createjs.Container();
            this.animationLayer.mouseChildren = false;
            spr.addChild(this.animationLayer);
            this.animationLayer2 = new createjs.Container();
            this.animationLayer2.mouseChildren = false;
            spr.addChild(this.animationLayer2);
            this.comboContainer = new createjs.Container();
            spr.addChild(this.comboContainer);
            this.blackMask = new createjs.Shape();
            {
                var g = this.blackMask.graphics;
                g.beginFill('rgba(0,0,0,0.6)');
                g.drawRect(0, 0, resource_26.GraphicConstant.SCREEN_WIDTH, resource_26.GraphicConstant.SCREEN_HEIGHT);
                g.endFill();
            }
            //spr.addChild(this.blackMask);
            //this.blackMask.visible = false;
            this.ballRenderLayer.maskRenderer = this.blackMask;
            this.animationLayer3 = new createjs.Container();
            spr.addChild(this.animationLayer3);
            this._matchWaitText = new createjs.Text('XXXXXXXXXXX', '30px SimHei', 'white');
            this._matchWaitText.set({
                textAlign: 'center',
                x: 320, y: 300,
                visible: false
            });
            spr.addChild(this._matchWaitText);
            if (this._skill) {
                spr.addChild(this._skill.spr);
                if (this._skill.bgSpr) {
                    //var idx = spr.getChildIndex(this.ballRenderLayer);
                    spr.addChildAt(this._skill.bgSpr, 0);
                }
                this._skill.init(this);
                this._skillButton.setMaxEnergy(this._skill.getMaxEnergy());
            }
            if (this._tutorial) {
                spr.addChild(this._tutorial.spr);
            }
            var ballRes = [];
            var gameRes = GAME_COMM_RES.slice();
            if (this._skill) {
                gameRes = gameRes.concat(this._skill.getSkillResource());
            }
            if (this._tutorial) {
                gameRes = gameRes.concat(this._tutorial.getResource());
            }
            //准备一下 ball资源图片
            for (var i = 0; i < BALL_RES_BOMB_COUNT; ++i) {
                ballRes.push(BALL_RES[i]);
            }
            var pets = this._gameStartInfo.pets;
            for (var i = 0; i < pets.length; ++i) {
                ballRes.push(BALL_RES[BALL_RES_BOMB_COUNT + pets[i]]);
            }
            this._petKillCount = [];
            for (var i = 0; i < pets.length; ++i) {
                this._petKillCount[i] = 0;
            }
            this._ImageLoader = new GameImageLoader_1.GameImageLoader(gameRes, ballRes);
            this._loader = this._ImageLoader._loader;
            this.spr.addChild(this._ImageLoader.spr);
            this._ImageLoader.onComplete = function () { _this._loadComplete = true; _this._checkStart(); };
            this._totalGameTime = this._gameStartInfo.totalTime * 1000;
            this._leftGameTime = this._gameStartInfo.totalTime * 1000;
            this._BALL_RES = ballRes.slice(BALL_RES_BOMB_COUNT);
            // this._BALL_RES.length = 2;
            this._BOMB_BALL_RES = ballRes.slice(0, BALL_RES_BOMB_COUNT);
        };
        /**是否携带的某个游戏道具 */
        Game.prototype._hasGameItem = function (type) {
            return this._gameStartInfo.items.indexOf(type) >= 0;
        };
        Game.prototype._checkStart = function () {
            if (this._workerReady && this._loadComplete) {
                if (this.isMatch) {
                    console.log('初始化完成，正在等待其他玩家进入');
                    this.showMatchWaitText('正在等待其他玩家进入');
                    GameLink_30.GameLink.instance.sendMatchReady();
                }
                else {
                    this.startGame();
                }
            }
        };
        Game.prototype.matchGameStart = function () {
            this.startGame();
        };
        /**
         * 释放潜在的任何资源
         */
        Game.prototype.clear = function () {
            if (this._clearEvents) {
                this._clearEvents();
                this._clearEvents = null;
            }
            if (this._worker) {
                this._worker.removeEventListener('message', this._worker['token']);
                this._worker.postMessage({ cmd: 'stop', id: this.id });
                //this._worker.onmessage = null;
                this._worker['token'] = null;
                this._worker = null;
            }
            if (this._animation) {
                this._animation.clear();
            }
        };
        /**
         * 游戏真正开始的部分，资源完全载入后调用
         */
        Game.prototype.startGame = function () {
            var _this = this;
            if (!g_CachedWorker) {
                g_CachedWorker = this._worker;
            }
            this.hideMatchWaitText();
            _INIT_IMAGES();
            this._animation.init();
            this._timerUI.addChars(BitmapText_6.BitmapText.buildCharDefines('0123456789', this.getImage('clock_chars'), 31, 41));
            this._worker.postMessage({ cmd: 'start', id: this.id });
            {
                var icon = HallUI_55.HallUI.instance.getPetImage(this.mainPetId); //this.getImage(this._BALL_RES[0].id);
                var bg1 = this.getImage('images/Game/skillbg2.png');
                var bg2 = this.getImage('images/Game/skillbg1.png');
                var bg3 = this.getImage('images/Game/skillbg3.png');
                this._skillButton.init(util.scaleImage(icon, res.GLOBAL_SCALE), util.scaleImage(bg1, res.GLOBAL_SCALE), util.scaleImage(bg2, res.GLOBAL_SCALE), util.scaleImage(bg3, res.GLOBAL_SCALE));
                this._skillButton.onClick = function () { return _this._onClickEnergy(); };
            }
            this.gameTaskBg.image = this.getImage('game_task_bg');
            this.gameTaskBg.x = (resource_26.GraphicConstant.SCREEN_WIDTH - this.gameTaskBg.image.width) / 2;
            this.gameTaskBg.y = 190;
            this.gameTaskBg.visible = false;
            {
                this.gameTaskText = new createjs.Text('', '28px SimHei', 'white');
                this.gameTaskText.textAlign = 'center';
                this.gameTaskText.x = resource_26.GraphicConstant.SCREEN_WIDTH / 2;
                this.gameTaskText.y = this.gameTaskBg.y + 15;
                this.spr.addChildAt(this.gameTaskText, this.spr.getChildIndex(this.gameTaskBg) + 1);
            }
            var index = this.spr.getChildIndex(this._skillButton.spr);
            var shakeButton = this.spr.addChildAt(new ImageButton_37.ImageButton(this.getImage('shake_button_bg')), index);
            shakeButton.onClick = function () { return _this._shake(); };
            shakeButton.x = resource_26.GraphicConstant.SCREEN_WIDTH * 0.84;
            shakeButton.y = 1010;
            var pauseButton = this.spr.addChildAt(new ImageButton_37.ImageButton(this.getImage('pause_button_bg')), index);
            pauseButton.x = 563;
            pauseButton.y = 119;
            pauseButton.onClick = function () { return _this._pauseGame(); };
            this._createBalls();
            this.postMessage({ cmd: 'initPhysics', id: this.id });
            this.ballRenderLayer.visible = false;
            //这时候，等待initPhysicsReady消息，之后执行startGame2
            //var fever_text = this.spr.getChildByName('feverText') as createjs.Bitmap;
            //fever_text.image = this.getImage('fever_text');
            //fever_text.regX = fever_text.image.width / 2;
        };
        Game.prototype.setTaskText = function (text) {
            if (this.gameTaskText) {
                this.gameTaskText.text = text;
                if (text === '') {
                    this.gameTaskBg.visible = false;
                }
                else {
                    this.gameTaskBg.visible = true;
                }
            }
        };
        Game.prototype.startGame2 = function () {
            this.spr.removeChild(this._ImageLoader.spr);
            //this._isGameStart = true;
            //this._gameStartTime = Date.now();
            this._lastUpdateTime = Date.now();
            if (!this._gameStartInfo.tutorial) {
                this._wantStartGameTime = Date.now() + 3000;
                SoundManager_7.SoundManager.playEffect('readygo');
                this._showReadyGoAnimation();
            }
            else {
                this._wantStartGameTime = Date.now();
                this._skillButton.addEnergy(9999);
            }
        };
        Game.prototype._showReadyGoAnimation = function () {
            var imageReady = this.getImage('ready');
            var imageGo = this.getImage('go');
            var x = resource_26.GraphicConstant.SCREEN_WIDTH / 2;
            var y = 200;
            var bitmapReady = new createjs.Bitmap(imageReady);
            bitmapReady.set({
                regX: imageReady.width / 2,
                regY: imageReady.height / 2,
                x: x, y: y - 40, alpha: 0
            });
            var bitmapGo = new createjs.Bitmap(imageGo);
            bitmapGo.set({
                regX: imageGo.width / 2,
                regY: imageGo.height / 2,
                x: x, y: y, alpha: 0,
                scaleX: 0,
                scaleY: 0
            });
            this.animationLayer2.addChild(bitmapReady, bitmapGo);
            var t1 = createjs.Tween.get(bitmapReady).to({ y: y, alpha: 1 }, 300).wait(650).call(GameUtil.removeSelfCallback, [bitmapReady]);
            var t2 = createjs.Tween.get(bitmapGo).wait(t1.duration).to({ scaleX: 1, scaleY: 1, alpha: 1 }, 300).wait(1400).call(GameUtil.removeSelfCallback, [bitmapGo]);
        };
        Game.prototype._updateBalls = function () {
            var balls = this.balls;
            var removeBalls = []; /**用来保存，想要在这一帧中删除的ball */
            // 删除在屏幕外面的球
            for (var i = 0; i < balls.length; ++i) {
                balls[i].update();
                if (balls[i].status == 'normal' && balls[i].isOutOfSpace()) {
                    removeBalls.push(balls[i]);
                }
            }
            var now = Date.now();
            //处理想要爆炸的球
            //this._bombBalls保存着想要延迟爆炸的ball
            //  Q: 为什么要这么做？
            //  A: 球爆炸之后只是标记成不显示（物理上仍旧占着位置），只有当一组都爆炸完成后才从逻辑上删除。
            for (var i = 0; i < this._bombBalls.length;) {
                var allbombed = true; /**这一组球是不是全部爆炸了 */
                var balls_18 = this._bombBalls[i];
                for (var j = 0; j < balls_18.length; ++j) {
                    var ball = balls_18[j];
                    if (ball.status == 'delay_bomb') {
                        if (ball.bombTick <= this.tick) {
                            //在bombIt中，其实并不删除球。只是标记成bombed状态。
                            this._bombIt(ball);
                            this._gameOverCheckTime = now;
                        }
                        else {
                            allbombed = false;
                        }
                    }
                }
                if (allbombed) {
                    this._bombBalls.splice(i, 1);
                    for (var j = 0; j < balls_18.length; ++j) {
                        removeBalls.push(balls_18[j]);
                    }
                }
                else {
                    ++i;
                }
            }
            //真正删除想要删除的ball
            if (removeBalls.length > 0) {
                this._gameOverCheckTime = now;
                this._removeBalls(removeBalls);
                for (var _i = 0, removeBalls_1 = removeBalls; _i < removeBalls_1.length; _i++) {
                    var ball = removeBalls_1[_i];
                    if (ball.wantBecomeBomb >= 0) {
                        this._createBomb(ball.position.x, ball.position.y, ball.wantBecomeBomb);
                        --this._wantDropBall;
                    }
                }
            }
        };
        Game.prototype.getDeltaTime = function () {
            return this._deltaTime;
        };
        /**
         * tick
         */
        Game.prototype.update = function () {
            var _this = this;
            if (!this._isGameStart && (this._wantStartGameTime !== -1) && Date.now() >= this._wantStartGameTime) {
                this._isGameStart = true;
                this._gameStartTime = Date.now();
                this._lastUpdateTime = Date.now();
                if (this._tutorial) {
                    this._tutorial.start();
                }
                this.clearHint();
                SoundManager_7.SoundManager.playBg('bgGame');
            }
            var deltaTime = Date.now() - this._lastUpdateTime;
            this._deltaTime = deltaTime;
            this._lastUpdateTime = Date.now();
            var t0, t1;
            if (this._isGameStart) {
                var isTimePaused = false;
                var isPhysicsPaused = false;
                if (this._isGamePaused || this._needMoreTimeStatus === 'showing') {
                    isTimePaused = true;
                    isPhysicsPaused = true;
                }
                if (this._skill) {
                    this._skill.update();
                    isTimePaused = isTimePaused || this._skill.isPreventPhysics();
                    isPhysicsPaused = isPhysicsPaused || this._skill.isPreventPhysics();
                }
                if (this._tutorial) {
                    this._tutorial.update();
                    isPhysicsPaused = isPhysicsPaused || this._tutorial.isPreventPhysics();
                    isTimePaused = isTimePaused || this._tutorial.isTimePaused();
                }
                if (isPhysicsPaused != this._physicsPaused) {
                    this._physicsPaused = isPhysicsPaused;
                    if (this._physicsPaused) {
                        this.postMessage({ cmd: 'pause', id: this.id });
                    }
                    else {
                        this.postMessage({ cmd: 'resume', id: this.id });
                    }
                }
                //处理一下时间暂停的问题
                if (isTimePaused) {
                    this._totalGameTime += deltaTime;
                    if (this._comboDisappearTime != 0) {
                        this._comboDisappearTime += deltaTime;
                    }
                    this._comboTimeoutTime += deltaTime;
                }
                if (!isTimePaused && this._timeScale !== 1) {
                    var dt = (1 - this._timeScale) * deltaTime;
                    this._totalGameTime += dt;
                    if (this._comboDisappearTime != 0) {
                        this._comboDisappearTime += dt;
                    }
                    this._comboTimeoutTime += dt;
                }
                if (!isTimePaused) {
                    this._leftGameTime -= deltaTime * this._timeScale;
                }
                //球的处理，延迟爆炸等都在这里
                this._updateBalls();
                this._checkHint();
                //如果时间没有暂停，则处理一下fever
                if (!isTimePaused) {
                    //减fever条
                    if (this._fever > 0) {
                        this._fever -= (this._isInFever ? FEVER_DECREASE_WHEN_FEVER_PER_SECOND : FEVER_DECREASE_PER_SECOND) * resource_26.GraphicConstant.TICK_TIME * this._timeScale;
                    }
                    //判断是否要结束fever
                    if (this._isInFever && this._fever <= 0) {
                        this._endFever();
                    }
                }
                //更新一下时钟UI
                {
                    var tm = this.getLeftGameTime();
                    tm = (((tm + 1) / 1000)) | 0;
                    if (tm < 0)
                        tm = 0;
                    //
                    //let mmm = ['05','04','03','02','01'];
                    if (this._timerUI.text != tm.toString()) {
                        if (tm >= 1 && tm <= 5) {
                            this._animation.blinkTimeWarning();
                        }
                    }
                    this._timerUI.text = tm.toString();
                }
                //处理一下是否要播放游戏快要结束的声音
                {
                    var isNearTimeOver = this.getLeftGameTime() <= 5000;
                    if (isNearTimeOver != this._isPreviousNearTimeOver) {
                        this._isPreviousNearTimeOver = isNearTimeOver;
                        if (isNearTimeOver) {
                            if (!this._nearTimeOverSound) {
                                this._nearTimeOverSound = SoundManager_7.SoundManager.playEffect('nearTimeover');
                            }
                        }
                        else {
                            if (this._nearTimeOverSound) {
                                this._nearTimeOverSound.stop();
                                this._nearTimeOverSound = null;
                            }
                        }
                    }
                }
                //调用一下其他模块的update
                this._scoreControl.update();
                this._coinControl.update();
                this._updateLineRender();
                //画一下线段
                t0 = Date.now();
                this._draw();
                t1 = Date.now();
                if (this._wantDropBall > 0) {
                    --this._wantDropBall;
                    this._tryDropOne();
                }
                if (this._comboDisappearTime !== 0 && this._comboDisappearTime < Date.now()) {
                    this._comboDisappearTime = 0;
                    this.comboContainer.removeAllChildren();
                }
                //处理一下 GameOver 的情况
                //这里是time over，游戏时间到了
                if (!this._isTimeOver && this.getLeftGameTime() <= 0) {
                    if (this._isLinking) {
                        this.applyMouseUp(true);
                        return;
                    }
                    var needMoreTimeStatus = this._needMoreTimeStatus;
                    if (needMoreTimeStatus === 'no') {
                        if (this._isNeedToShowNeedMoreTimeDialog()) {
                            this._showNeedMoreTimeDialog(function () {
                                GameLink_30.GameLink.instance.sendUseDiamond(5, '+10s');
                                _this.addGameTime(10 - _this.getLeftGameTime() / 1000);
                            }, function () {
                                //这里应该什么都不需要做。needMoreTimeStatus会变成'showned'然后自动结束游戏了
                            });
                        }
                        else {
                            this._needMoreTimeStatus = 'showned'; //如果不需要显示，则直接标记成“已经显示过了”，让下面的逻辑能结束游戏
                        }
                    }
                    if (needMoreTimeStatus === 'showned') {
                        if (this._nearTimeOverSound) {
                            this._nearTimeOverSound.stop();
                            this._nearTimeOverSound = null;
                        }
                        this._isTimeOver = true;
                        this._animation.showTimeOver();
                        SoundManager_7.SoundManager.playEffect('timeover');
                        var hasBomb = this.balls.some(function (ball) { return ball.isBomb && ball.status === 'normal'; });
                        if (hasBomb)
                            this._animation.showBonusTime();
                        this._nextAutoBombTime = Date.now() + (AUTO_BOMB_FIRST_DELAY + 2) * 1000;
                        this._gameOverCheckTime = this._nextAutoBombTime + 100;
                    }
                }
                //自动爆炸
                if (this._isTimeOver && this._nextAutoBombTime != 0) {
                    this.clearHint();
                    if (Date.now() >= this._nextAutoBombTime) {
                        var bomb = null;
                        for (var _i = 0, _a = this.balls; _i < _a.length; _i++) {
                            var ball = _a[_i];
                            if (ball.isBomb && ball.status === 'normal') {
                                bomb = ball;
                                break;
                            }
                        }
                        if (bomb) {
                            this._bombTheBomb(bomb, true);
                            this._gameOverCheckTime = Date.now();
                        }
                        if (bomb) {
                            this._nextAutoBombTime = Date.now() + AUTO_BOMB_DELAY * 1000;
                        }
                        else {
                            this._nextAutoBombTime = 0;
                        }
                    }
                }
                var canTriggerGameOver = this._isTimeOver && !this._isGameOver && Date.now() >= this._gameOverCheckTime + 2100 && this._bombBalls.length == 0;
                canTriggerGameOver = canTriggerGameOver && !(this._skill && this._skill.isPreventGameOver());
                if (canTriggerGameOver) {
                    this._onGameOver();
                    this._isGameOver = true;
                }
                this.blackMask.visible = !this.isEnableUserInteract();
                ++this.tick;
                this._updateTaskText();
                if (this.isMatch) {
                    if (Date.now() - this._lastSendUpdateTime > 2000) {
                        this._lastSendUpdateTime = Date.now();
                        GameLink_30.GameLink.instance.sendMatchScore(this._score, this._leftGameTime);
                    }
                    if (this._matchUI) {
                        this._matchUI.setScore(0, this._score);
                    }
                }
            }
        };
        Game.prototype.getLeftGameTime = function () {
            return this._leftGameTime;
        };
        Game.prototype.onMouseDown = function (e) {
            var _this = this;
            if (!util.isPrimatyButton(e))
                return;
            if (!this.isEnableUserInteract())
                return;
            if (this.skillWantNextClick) {
                this.skillWantNextClick = false;
                this._skill.triggerClick({ x: e.stageX, y: e.stageY });
                return;
            }
            if (this._isLinking)
                return;
            var pt = { x: e.stageX, y: e.stageY };
            var balls = this.queryBallPoint(pt).filter(function (x) { return x.status == 'normal'; });
            if (this._tutorial) {
                balls = balls.filter(function (x) { return _this._tutorial.canTouchBall(x); });
            }
            if (balls.length >= 1) {
                //start link
                this._lastMousePoint = pt;
                var ball = balls[0];
                this._isLinking = true;
                this._linkColor = ball.color;
                this._linkedBalls = [ball];
                SoundManager_7.SoundManager.playEffect('linkBall');
                ball.linkCount = 0;
                ball.status = 'linking';
                this._animation.flyLinkCountTip(ball.position.x, ball.position.y, 1);
            }
        };
        Game.prototype.onMouseUp = function (e) {
            if (!util.isPrimatyButton(e))
                return;
            if (this._tutorial) {
                if (!this._isLinking) {
                    this._tutorial.triggerClick({ x: e.stageX, y: e.stageY });
                }
            }
            this.applyMouseUp();
        };
        Game.prototype.onMouseMove = function (e, noCheckMoveDistance) {
            var _this = this;
            if (!this._isLinking)
                return;
            var pt = { x: e.stageX, y: e.stageY };
            //如果移动的距离太远，自动补充中间的移动点
            if (!noCheckMoveDistance) {
                var dx = pt.x - this._lastMousePoint.x;
                var dy = pt.y - this._lastMousePoint.y;
                var sqrDist = util.sqrDistance(pt, this._lastMousePoint);
                var maxdist = Ball_6.Ball.MAX_RADIUS;
                if (sqrDist >= maxdist * maxdist) {
                    var dist = Math.sqrt(sqrDist);
                    dx /= dist;
                    dy /= dist;
                    var step = Ball_6.Ball.MAX_RADIUS * 0.2;
                    var p = step;
                    while (p < dist) {
                        var ee = e.clone();
                        ee.stageX = pt.x + dx * p;
                        ee.stageY = pt.y + dy * p;
                        this.onMouseMove(ee, true);
                        p += step;
                    }
                }
            }
            this._lastMousePoint = pt;
            var lastBall = this._linkedBalls[this._linkedBalls.length - 1];
            if (lastBall.isBomb)
                return;
            var lastPt = lastBall.position;
            var balls;
            if (this.nextLinkIgnoreColor) {
                balls = this.queryBallCircle(pt, Ball_6.Ball.MAX_RADIUS * 0.3).filter(function (x) { return x.status == 'normal' && _this._linkedBalls.indexOf(x) < 0; });
            }
            else {
                balls = this.queryBallCircle(pt, Ball_6.Ball.MAX_RADIUS * 0.3).filter(function (x) { return x.status == 'normal' && x.color == _this._linkColor && _this._linkedBalls.indexOf(x) < 0; });
            }
            if (this._tutorial) {
                balls = balls.filter(function (x) { return _this._tutorial.canLinkBall(x); });
            }
            var isLinked = false;
            if (balls.length > 0 && !(this.nextLinkIgnoreColor && this._linkedBalls.length >= this.nextLinkIgnoreColor_MaxCount)) {
                var minDistBall = balls[0];
                var dist = util.sqrDistance(minDistBall.position, pt);
                for (var i = 1; i < balls.length; ++i) {
                    var d2 = util.sqrDistance(balls[i].position, pt);
                    if (d2 < dist) {
                        minDistBall = balls[i];
                        dist = d2;
                    }
                }
                if (minDistBall) {
                    var theBall = minDistBall;
                    if (this._canLink(lastBall, theBall)) {
                        theBall.linkCount = this._linkedBalls.length;
                        theBall.status = 'linking';
                        this._linkedBalls.push(theBall);
                        SoundManager_7.SoundManager.playEffect('linkBall');
                        isLinked = true;
                    }
                    else {
                        //自动隔一个球，可以连接也帮他自动连接起来吧
                        if (!this.nextLinkIgnoreColor ||
                            (this.nextLinkIgnoreColor && this._linkedBalls.length + 2 <= this.nextLinkIgnoreColor_MaxCount)) {
                            var midBall = this._searchMiddleLinkBall(lastBall, theBall);
                            if (midBall) {
                                theBall.linkCount = this._linkedBalls.length;
                                theBall.status = 'linking';
                                midBall.linkCount = this._linkedBalls.length;
                                midBall.status = 'linking';
                                this._linkedBalls.push(midBall);
                                this._linkedBalls.push(theBall);
                                SoundManager_7.SoundManager.playEffect('linkBall');
                                isLinked = true;
                            }
                        }
                    }
                    if (isLinked) {
                        this._animation.flyLinkCountTip(theBall.position.x, theBall.position.y, this._linkedBalls.length);
                        this._updateLineRender();
                        this.makeDirty();
                    }
                }
            }
            //接下来处理回退功能
            if (!isLinked) {
                balls = this.queryBallPoint(pt).filter(function (ball) { return _this._linkedBalls.indexOf(ball) >= 0; });
                if (balls.length == 1) {
                    var i = this._linkedBalls.indexOf(balls[0]);
                    var linkedBallCount = this._linkedBalls.length;
                    if (i >= 0 && i >= linkedBallCount - 3 && i < linkedBallCount - 1) {
                        for (var j = i + 1; j < this._linkedBalls.length; ++j) {
                            var ball = this._linkedBalls[j];
                            ball.status = 'normal';
                            ball.linkCount = -1;
                        }
                        this._linkedBalls.length = i + 1;
                        var theBall = this._linkedBalls[i];
                        this._animation.flyLinkCountTip(theBall.position.x, theBall.position.y, this._linkedBalls.length);
                        this._updateLineRender();
                        this.makeDirty();
                    }
                }
            }
        };
        //请调用这个来计算分数，而不是GameRules.getScore(...)
        Game.prototype._calcScore = function (comboCount, balls, type) {
            var X = GameRules.getLinkCountX(balls.length);
            var Y = GameRules.getComboY(comboCount);
            var Z = 0;
            var link = GameLink_30.GameLink.instance;
            for (var _i = 0, balls_19 = balls; _i < balls_19.length; _i++) {
                var ball = balls_19[_i];
                if (!ball.isBomb) {
                    var i = parseInt(ball.color);
                    Z += link.getPetScore(i);
                }
            }
            var score = (Z + X) * Y;
            return score | 0;
        };
        /** 手指放开时的操作，消除连接的球. 在onMouseUp时调用，或者当你想手动让手指放开的时候调用 */
        Game.prototype.applyMouseUp = function (justCancelIt) {
            if (this._isLinking) {
                var isTutorialAllowBomb = true;
                if (this._tutorial) {
                    isTutorialAllowBomb = this._tutorial.canBombBalls(this._linkedBalls);
                }
                if (this._linkedBalls.length == 1 && this._linkedBalls[0].isBomb && isTutorialAllowBomb && !justCancelIt) {
                    this._bombTheBomb(this._linkedBalls[0]);
                    if (this._tutorial)
                        this._tutorial.triggerBomb();
                }
                else if (this._linkedBalls.length >= this.minLinkCount && isTutorialAllowBomb && !justCancelIt) {
                    //普通消除
                    var linkCount = this._linkedBalls.length;
                    this._startBomb(this._linkedBalls);
                    this._addCombo();
                    var score = this._calcScore(this._comboCount, this._linkedBalls, 'link');
                    //if (this._isInFever) score *= FEVER_SCORE_MULTIPY;
                    var lastBall = this._linkedBalls[linkCount - 1];
                    this._animation.showBombNumAnimation(lastBall.position.x, lastBall.position.y, linkCount, 0);
                    var delay = this._animation.showScoreAnimation(score, linkCount, lastBall.position.x, lastBall.position.y, this._isInFever);
                    this._addScore(score, delay * 0.9);
                    var coin = GameRules.getCoin(linkCount);
                    this._addCoin(coin, 0);
                    var LINK_COUNT_THAT_CAN_GET_BOMB = this._hasGameItem(GameItemDefine.GAME_ITEM_DEC_BOMB_REQ) ? 6 : 7;
                    if (this.wantBombAsBomb) {
                        this._linkedBalls.forEach(function (x) { x.bombAsBomb = true; });
                    }
                    if (linkCount >= 7) {
                        if (linkCount >= 10) {
                            lastBall.wantBecomeBomb = Math.floor(Math.random() * 5);
                            if (lastBall.wantBecomeBomb > 4)
                                lastBall.wantBecomeBomb = 4;
                        }
                        else {
                            lastBall.wantBecomeBomb = 0;
                        }
                    }
                    if (this._tutorial)
                        this._tutorial.triggerBomb();
                    console.log("\u8FDE\u51FB:" + this._comboCount + ",\u6D88\u9664:" + linkCount + "\u4E2A,\u5206\u6570:" + score + ",\u91D1\u5E01:" + coin);
                    if (linkCount > this._maxLink)
                        this._maxLink = linkCount;
                }
                else {
                    this._linkedBalls.forEach(function (x) {
                        x.linkCount = -1;
                        x.status = 'normal';
                    });
                }
                this._animation.clearLinkCountTip();
                this._linkedBalls = null;
                this._isLinking = false;
                this._updateLineRender();
                if (this.nextLinkIgnoreColor) {
                    this.nextLinkIgnoreColor = false;
                    this._skill.triggerSkillEnd();
                }
                this.makeDirty();
            }
        };
        /**如果当前用户正在有连接的操作，则取消所有操作 */
        Game.prototype.cancelLinkBall = function () {
            if (this._isLinking) {
                for (var _i = 0, _a = this._linkedBalls; _i < _a.length; _i++) {
                    var ball = _a[_i];
                    ball.status = 'normal';
                    ball.linkCount = -1;
                }
                this._linkedBalls.length = 0;
                this._updateLineRender();
                this.makeDirty();
            }
        };
        Game.prototype.isEnableUserInteract = function () {
            return this._isGameStart && !this._isGameOver && this.getLeftGameTime() >= 0
                && !(this._skill && this._skill.isPreventUserInteract()) && !this._isGamePaused && this._needMoreTimeStatus !== 'showing';
        };
        Game.prototype._updateLineRender = function () {
            if (this._isLinking && this._linkedBalls.length >= 2) {
                var arr = this._linkedBalls.map(function (obj) { return obj.position; });
                this.lineLayer.lines = arr;
            }
            else {
                this.lineLayer.lines = null;
            }
        };
        /**连击加1，并且返回当前连击（至少是1） */
        Game.prototype._addCombo = function () {
            if (this._comboCount == 0 || Date.now() > this._comboTimeoutTime) {
                this._comboCount = 1;
                this._bombSoundIndex = 0;
            }
            else {
                this._comboCount++;
            }
            if (this._comboCount > this._maxCombo)
                this._maxCombo = this._comboCount;
            this._showComboText(this._comboCount);
            this._comboTimeoutTime = Date.now() + COMBO_TIMEOUT * 1000;
            return this._comboCount;
        };
        /**ball是一个正常的球，由于技能的作用下，它爆炸的时候会像炸弹一样炸掉周围的球 */
        Game.prototype._bombAsBomb = function (ball) {
            var arr = [];
            var pos = ball.position;
            var sqrRadius = BOMB_RADIUS * BOMB_RADIUS;
            for (var _i = 0, _a = this.balls; _i < _a.length; _i++) {
                var ball_3 = _a[_i];
                if (ball_3.status === 'normal' && !ball_3.isBomb) {
                    var pos2 = ball_3.position;
                    var dx = pos.x - pos2.x;
                    var dy = pos.y - pos2.y;
                    if (dx * dx + dy * dy <= sqrRadius) {
                        ball_3.linkCount = arr.length;
                        arr.push(ball_3);
                    }
                }
            }
            if (arr.length > 0) {
                this.bombTheBalls(arr);
            }
        };
        /** 炸掉一个炸弹球，bomb一定要是一个炸弹
         * isBonusTime 有个特殊处理的
        */
        Game.prototype._bombTheBomb = function (bomb, isBonusTime) {
            util.assert(bomb.isBomb);
            var arr = [];
            var pos = bomb.position;
            var sqrRadius = BOMB_RADIUS * BOMB_RADIUS;
            if (bomb.color === BOMB_TYPE_BIG) {
                var radius = BOMB_RADIUS * 1.5;
                sqrRadius = radius * radius;
            }
            for (var _i = 0, _a = this.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (ball.status === 'normal' && !ball.isBomb) {
                    var pos2 = ball.position;
                    var dx = pos.x - pos2.x;
                    var dy = pos.y - pos2.y;
                    if (dx * dx + dy * dy <= sqrRadius) {
                        ball.linkCount = arr.length;
                        arr.push(ball);
                    }
                }
            }
            //console.log('balls', arr);
            var bombType = bomb.color;
            switch (bombType) {
                case BOMB_TYPE_COIN:
                    this._coinBomb++;
                    break;
                case BOMB_TYPE_EXP:
                    this._expBomb++;
                    break;
                case BOMB_TYPE_SCORE:
                    this._scoreBomb++;
                    break;
                case BOMB_TYPE_TIME:
                    this._timeBomb++;
                    break;
            }
            if (arr.length > 0) {
                var linkCount = arr.length;
                this._addCombo();
                var score = this._calcScore(this._comboCount, arr, 'bomb');
                var coin = GameRules.getCoin(linkCount);
                if (bombType === BOMB_TYPE_SCORE)
                    score *= 2;
                else if (bombType === BOMB_TYPE_COIN)
                    coin += 10;
                //if (this._isInFever) score *= FEVER_SCORE_MULTIPY;
                this._animation.showBombNumAnimation(bomb.position.x, bomb.position.y, linkCount, 0);
                var delay = this._animation.showScoreAnimation(score, linkCount, pos.x, pos.y, this._isInFever);
                this._addScore(score, delay * 0.9);
                this._addCoin(coin, 0);
                this._startBomb(arr, 'bomb');
                if (isBonusTime) {
                    for (var _b = 0, arr_3 = arr; _b < arr_3.length; _b++) {
                        var ball = arr_3[_b];
                        ball.bombTick += resource_26.GraphicConstant.FPS;
                    }
                }
                console.log("\u8FDE\u51FB:" + this._comboCount + ", \u70B8\u5F39\u70B8\u4E86" + linkCount + "\u4E2A\uFF0C\u5206\u6570:" + score + ", \u91D1\u5E01:" + coin);
            }
            if (bombType === BOMB_TYPE_TIME) {
                this.addGameTime(2);
            }
            bomb.status = 'delay_bomb';
            bomb.bombTick = this.tick;
            if (isBonusTime) {
                bomb.bombTick = this.tick + resource_26.GraphicConstant.FPS;
            }
            this._bombBalls.push([bomb]);
            ++this._bombCount;
            //console.log('balls2', arr);
        };
        /** 底层的一个炸掉一系列球的函数，最好不要直接调用
         *    可以调用bombTheBalls()或_bombTheBom() 等代替
        */
        Game.prototype._startBomb = function (balls, mode) {
            this.clearHint();
            //这里做的事情最好只放动画，不要做其他计算
            for (var i = 0; i < balls.length; ++i) {
                var ball = balls[i];
                ball.status = 'delay_bomb';
                if (mode === 'bomb') {
                    ball.bombTick = this.tick + resource_26.GraphicConstant.FPS * 0.2;
                    if (i === 0)
                        ball.bombSoundIndex = balls.length - 1;
                }
                else if (mode === 'skill') {
                    ball.bombTick = this.tick + resource_26.GraphicConstant.FPS * 0.4;
                    if (i === 0)
                        ball.bombSoundIndex = balls.length - 1;
                }
                else if (mode === 'toBomb') {
                    ball.bombTick = this.tick + resource_26.GraphicConstant.FPS * 0.4;
                    if (i === 0)
                        ball.bombSoundIndex = balls.length - 1;
                }
                else {
                    ball.bombTick = this.tick + ((i * resource_26.GraphicConstant.FPS / 10) | 0);
                    ball.bombSoundIndex = this._bombSoundIndex++;
                }
            }
            this._bombBalls.push(balls.slice());
        };
        /**转换宠物为主宠物 */
        Game.prototype.transformToMainColor = function (balls) {
            var main = this.getMainBallDefine();
            for (var i = 0; i < balls.length; ++i) {
                var ball = balls[i];
                if (!ball.isBomb && ball.color !== main.color && ball.status === 'normal') {
                    ball.noEnergy = true;
                    ball.changeColor(main);
                }
            }
        };
        /**是不是当前携带的宠物 */
        Game.prototype.isMainBall = function (ball) {
            return ball.color === this.getMainBallDefine().color;
        };
        /** 将这一系列球都爆炸，由技能调用*/
        Game.prototype.bombTheBalls = function (balls) {
            if (balls && balls.length > 0) {
                if (balls.length >= 7) {
                    if (balls.length >= 10) {
                        balls[0].wantBecomeBomb = (Math.random() * 5) | 0;
                    }
                    else {
                        balls[0].wantBecomeBomb = 0;
                    }
                }
                for (var i = 0; i < balls.length; ++i) {
                    balls[i].linkCount = i;
                }
                this._addCombo();
                var score = this._calcScore(this._comboCount, balls, 'skill');
                var coin = GameRules.getCoin(balls.length);
                //if (this._isInFever) score *= FEVER_SCORE_MULTIPY;
                var pt = calcAABBCenter(balls);
                this._animation.showBombNumAnimation(pt.x, pt.y, balls.length, 0);
                var delay = this._animation.showScoreAnimation(score, balls.length, resource_26.GraphicConstant.SCREEN_WIDTH / 2, resource_26.GraphicConstant.SCREEN_HEIGHT / 2, this._isInFever);
                this._addScore(score, delay * 0.9);
                this._addCoin(coin, 0);
                console.log("\u6280\u80FD\u70B8\u4E86:" + balls.length + "\u4E2A,\u8FDE\u51FB:" + this._comboCount + " \uFF0C\u5206\u6570:" + score + ", \u91D1\u5E01:" + coin);
                this._startBomb(balls, 'skill');
            }
        };
        /**由技能调用，将球变成炸弹 */
        Game.prototype.turnBallToBomb = function (balls, bombType) {
            if (typeof bombType === 'undefined')
                bombType = 0;
            balls = balls.filter(function (ball) { return !ball.isBomb && ball.status == 'normal'; });
            if (balls.length > 0) {
                for (var i = 0; i < balls.length; ++i) {
                    balls[i].wantBecomeBomb = bombType;
                }
            }
            this._addCombo();
            this._startBomb(balls, 'toBomb');
        };
        /**不要直接调用 */
        Game.prototype._bombIt = function (ball) {
            this.clearHint();
            var isPlayedEnergyAnimation = false;
            ball.status = 'bombed';
            this._animation.playBombAnimation(ball.position.x, ball.position.y);
            if (ball.bombSoundIndex >= 0) {
                SoundManager_7.SoundManager.playBallBomb(ball.bombSoundIndex);
            }
            //加能量
            if (ball.canHasEnergy() && !this._skillButton.isEnergyFull()) {
                isPlayedEnergyAnimation = true;
                this._animation.receiveEnergyAnimation(ball);
                this._skillButton.addEnergy(1);
                if (this._skillButton.isEnergyFull()) {
                    this._animation.playEnergyFullAnimation();
                }
            }
            //加金币
            if (!ball.isBomb) {
                //let coin = GameRules.getCoin(ball.linkCount);
                if (ball.linkCount >= 3) {
                    this._animation.receiveCoinAnimation(ball.position.x, ball.position.y);
                }
            }
            //加fever
            if (!ball.isBomb) {
                if (!this._isInFever) {
                    if (!isPlayedEnergyAnimation) {
                        this._animation.receiveFeverAnimation(ball);
                    }
                    this._fever += FEVER_ADD_PER_BALL;
                    if (this._fever >= 1) {
                        this._fever = 1;
                        if (!this._isTimeOver) {
                            this._startFever();
                        }
                    }
                }
            }
            if (!ball.isBomb) {
                var color = parseInt(ball.color) | 0;
                var idx = this._gameStartInfo.pets.indexOf(color);
                util.assert(idx >= 0);
                this._petKillCount[idx]++;
            }
            if (ball.bombAsBomb) {
                this._bombAsBomb(ball);
            }
        };
        Game.prototype._startFever = function () {
            this._isInFever = true;
            this.feverMask.visible = true;
            this._animation.playFeverEffect();
            this.addGameTime(FEVER_ADD_GAME_TIME);
            ++this._feverCount;
            SoundManager_7.SoundManager.playBg('bgFever');
            this._animation.showStartFever();
        };
        Game.prototype._endFever = function () {
            if (!this._isInFever)
                return;
            this._isInFever = false;
            this.feverMask.visible = false;
            this._animation.stopFeverEffect();
            if (this._feverBonusScore > 0) {
                this._addScore(this._feverBonusScore * FEVER_SCORE_MULTIPY, 0);
                this._feverBonusScore = 0;
                this._animation.collectFeverScore();
            }
            SoundManager_7.SoundManager.playBg('bgGame');
        };
        Game.prototype.addToFullFever = function () {
            if (!this._isInFever) {
                this._fever = 1;
                this._startFever();
            }
            else {
                this._fever = 1;
            }
        };
        Game.prototype._createBalls = function () {
            var CREATE_RADIUS = Ball_6.Ball.MAX_RADIUS;
            var left = 11;
            var right = resource_26.GraphicConstant.SCREEN_WIDTH - 11;
            var top = -100 + 11;
            var bottom = 600 * resource_26.GraphicConstant.GLOBAL_SCALE - 11;
            var x = left + CREATE_RADIUS;
            var y = top + CREATE_RADIUS;
            while (true) {
                var ball = new Ball_6.Ball(this, util.randomChoose(this._BALL_RES), x + Math.random() * 2, y + Math.random() * 2);
                this.balls.push(ball);
                x += 2 * CREATE_RADIUS;
                if (x + CREATE_RADIUS >= right) {
                    x = left + CREATE_RADIUS;
                    y += CREATE_RADIUS * 2;
                    if (y >= bottom)
                        break;
                }
            }
        };
        Game.prototype._draw = function () {
            var g = this.paintLayer.graphics;
            g.clear();
            //draw links
            if (this._isLinking && 0) {
                g.beginStroke('black');
                g.setStrokeStyle(2);
                var pos = void 0;
                g.setStrokeStyle(2);
                for (var i = 0; i < this._linkedBalls.length; ++i) {
                    var ball = this._linkedBalls[i];
                    pos = ball.position;
                    g.beginStroke('black');
                    g.drawCircle(pos.x, pos.y, ball.radius);
                    g.endStroke();
                    for (var _i = 0, _a = ball.getEarShape(); _i < _a.length; _i++) {
                        var c = _a[_i];
                        g.beginStroke('black');
                        g.drawCircle(c.x, c.y, c.r);
                        g.endStroke();
                    }
                }
            }
        };
        Game.prototype._removeBalls = function (balls) {
            if (Array.isArray(balls)) {
                this.balls = this.balls.filter(function (x) { return balls.indexOf(x) < 0; });
                for (var i = 0; i < balls.length; ++i) {
                    balls[i].remove();
                    balls[i].clear();
                    ++this._wantDropBall;
                }
            }
            else {
                var ball = balls;
                var i = this.balls.indexOf(ball);
                if (i >= 0) {
                    this.balls.splice(i, 1);
                }
                ball.remove();
                ball.clear();
                this._wantDropBall += 1;
            }
        };
        Game.prototype._createBomb = function (x, y, type) {
            console.log('create Bomb:' + type);
            var ball = new Ball_6.Ball(this, this._BOMB_BALL_RES[type], x, y);
            this.balls.push(ball);
            return ball;
        };
        Game.prototype._tryDropOne = function () {
            var left = Ball_6.Ball.MAX_RADIUS + 10;
            var right = resource_26.GraphicConstant.SCREEN_WIDTH - Ball_6.Ball.MAX_RADIUS - 10;
            var x = left + Math.random() * (right - left);
            var y = -Ball_6.Ball.MAX_RADIUS;
            var aabb = new Box2D.Collision.b2AABB();
            aabb.lowerBound.x = x - Ball_6.Ball.MAX_RADIUS;
            aabb.lowerBound.y = y - Ball_6.Ball.MAX_RADIUS;
            aabb.upperBound.x = x + Ball_6.Ball.MAX_RADIUS;
            aabb.upperBound.y = y + Ball_6.Ball.MAX_RADIUS;
            var ball = new Ball_6.Ball(this, util.randomChoose(this._BALL_RES), x, y);
            this.balls.push(ball);
            return ball;
        };
        Game.prototype._shake = function () {
            if (!this.isEnableUserInteract())
                return;
            if (this._tutorial && this._tutorial.isRunning())
                return;
            var power;
            var span = (Date.now() - this._lastShakeTime) / 1000;
            if (span >= SHAKE_TIMEOUT)
                power = 1;
            else {
                power = (span) / SHAKE_TIMEOUT;
            }
            this._lastShakeTime = Date.now();
            this.postMessage({ cmd: 'shake', power: power, id: this.id });
        };
        Game.prototype.queryBallPoint = function (pt) {
            for (var _i = 0, _a = this.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                var pos = ball.position;
                if (util.sqrDistance(pt, pos) <= ball.radius * ball.radius) {
                    return [ball];
                }
            }
            return [];
        };
        Game.prototype.queryBallCircle = function (pt, radius) {
            var ret = [];
            for (var _i = 0, _a = this.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                var rr = radius + ball.radius;
                if (util.sqrDistance(pt, ball.position) <= rr * rr) {
                    ret.push(ball);
                }
            }
            return ret;
        };
        Game.prototype.queryBallRay = function (pt0, pt1) {
            var ret = [];
            for (var _i = 0, _a = this.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (GameUtil.circleSegmentIntersect(pt0, pt1, ball.position, ball.radius)) {
                    ret.push(ball);
                }
            }
            return ret;
        };
        /**
         * 显示连击
         */
        Game.prototype._showComboText = function (n) {
            if (!COMBO_NUMBER.result)
                return;
            if (!COMBO_TEXT.result)
                return;
            this._comboDisappearTime = Date.now() + COMBO_TIMEOUT * 1000;
            this.comboContainer.removeAllChildren();
            var x = resource_26.GraphicConstant.SCREEN_WIDTH * 0.8;
            var y = resource_26.GraphicConstant.SCREEN_HEIGHT * 0.2;
            var digitImages = COMBO_NUMBER.result;
            var textImage = COMBO_TEXT.result;
            var bitmap = new createjs.Bitmap(textImage);
            bitmap.x = x - textImage.width / 2;
            bitmap.y = y + digitImages[0].height;
            this.comboContainer.addChild(bitmap);
            n = (n | 0).toString();
            var totalWidth = digitImages[0].width * n.length;
            var x0 = x - totalWidth / 2;
            for (var i = 0; i < n.length; ++i) {
                var bitmap_1 = new createjs.Bitmap(digitImages[n[i] | 0]);
                bitmap_1.x = x0;
                bitmap_1.y = y; // - digitImages[0].height;
                x0 += digitImages[0].width;
                this.comboContainer.addChild(bitmap_1);
            }
        };
        Game.prototype.makeDirty = function () {
            GameStage_7.GameStage.instance.makeDirty();
        };
        Game.prototype.getImage = function (id) {
            return this._loader.getImage(id);
        };
        /**当前技能球的define */
        Game.prototype.getMainBallDefine = function () {
            return this._BALL_RES[0];
        };
        Game.prototype._addCoin = function (coin, delay) {
            coin = (coin * this._coinScale) | 0;
            this._coinControl.addValue(coin, delay);
            this._coin += coin;
        };
        Game.prototype._addScore = function (score, delay) {
            if (this._isInFever) {
                this._feverBonusScore += score;
                this._animation.showFeverScore(this._feverBonusScore);
            }
            else {
                this._scoreControl.addValue(score, delay);
                this._score += score;
            }
        };
        Game.prototype._onClickEnergy = function () {
            if (!this.isEnableUserInteract())
                return;
            if (this._tutorial && this._tutorial.isRunning())
                return;
            this.applyMouseUp();
            if (this._skill) {
                ++this._skillCount;
                this.clearHint();
                this._skill.startSkill();
            }
            else {
                alert('PONG! PONG! PONG! 华丽的技能特效!');
            }
            this._skillButton.clearEnergy();
        };
        Game.prototype._onGameOver = function () {
            this._endFever();
            console.log("\u6E38\u620F\u7ED3\u675F\n\u603B\u5206:" + this._score + "\n\u603B\u91D1\u5E01:" + this._coin + "\n\u6D88\u9664\u7684\u7403\u6570\u91CF\uFF1A" + this._petKillCount + "\n\u643A\u5E26\u5BA0\u7269\u7ECF\u9A8C\uFF1A" + this._petKillCount[0] + "\t\n");
            var obj = {
                score: this._score,
                coin: this._coin,
                killPetCount: this._petKillCount,
                feverCount: this._feverCount,
                bombCount: this._bombCount,
                skillCount: this._skillCount
            };
            obj.expBomb = this._expBomb;
            obj.timeBomb = this._timeBomb;
            obj.scoreBomb = this._scoreBomb;
            obj.coinBomb = this._coinBomb;
            obj.maxLink = this._maxLink;
            obj.maxCombo = this._maxCombo;
            this._gameResultObject = obj;
            GameLink_30.GameLink.instance.sendGameResult(obj);
            if (this.isMatch) {
                //console.log('对战结束，正在等待其他玩家完成游戏');
                this.showMatchWaitText('正在等待其他玩家完成游戏');
            }
            console.log("\u6E38\u620F\u7ED3\u675F\uFF1A\u643A\u5E26\u5BA0\u7269\u7ECF\u9A8C");
        };
        Game.prototype.sendGameResultIfGameOver = function () {
            if (this._gameResultObject) {
                GameLink_30.GameLink.instance.sendGameResult(this._gameResultObject);
            }
        };
        //两个球可以连接吗
        Game.prototype._canLink = function (ball1, ball2) {
            if (ball1 === ball2)
                return false;
            if (!this.nextLinkIgnoreColor && ball1.color !== ball2.color)
                return false;
            if (ball1.isBomb || ball2.isBomb)
                return false;
            var sqrDist = util.sqrDistance(ball1.position, ball2.position);
            var maxDist = Game.MAX_LINK_DISTANCE * Game.MAX_LINK_DISTANCE;
            if (sqrDist > maxDist)
                return false;
            var otherBalls = this.queryBallRay(ball1.position, ball2.position);
            for (var _i = 0, otherBalls_1 = otherBalls; _i < otherBalls_1.length; _i++) {
                var x = otherBalls_1[_i];
                if (x !== ball1 && x !== ball2)
                    return false;
            }
            return true;
        };
        /**搜索一个ballX，保证 ball1->ballX->ball2 可以连接 */
        Game.prototype._searchMiddleLinkBall = function (ball1, ball2) {
            var _this = this;
            if (ball1 === ball2)
                return null;
            if (ball1.color !== ball2.color)
                return null;
            if (ball1.isBomb || ball2.isBomb)
                return null;
            var candidateBalls = this.balls.filter(function (ball) {
                return ball.status == 'normal' && !ball.isBomb && ball.color === ball1.color && ball !== ball1 && ball !== ball2;
            });
            if (this._tutorial) {
                candidateBalls = candidateBalls.filter(function (x) { return _this._tutorial.canLinkBall(x); });
            }
            for (var _i = 0, candidateBalls_1 = candidateBalls; _i < candidateBalls_1.length; _i++) {
                var ballX = candidateBalls_1[_i];
                if (this._canLink(ball1, ballX) && this._canLink(ballX, ball2)) {
                    return ballX;
                }
            }
            return null;
        };
        Game.prototype._onWorkerMessage = function (e) {
            if (!this._worker)
                return;
            var obj = e.data;
            //if (obj.cmd !== 'update') alert(JSON.stringify(obj));
            switch (obj.cmd) {
                case 'update':
                    if (obj.id !== this.id) {
                        console.log("game id not matched,myid=" + this.id + ",obj.id=" + obj.id + ",cmd=" + obj.cmd);
                        return;
                    }
                    return this._onWorkerUpdate(obj);
                case 'ready':
                    this._workerReady = true;
                    this._checkStart();
                    return;
                case 'initPhysicsReady':
                    if (obj.id !== this.id) {
                        console.log("game id not matched,myid=" + this.id + ",obj.id=" + obj.id + ",cmd=" + obj.cmd);
                        return;
                    }
                    this.startGame2();
                    return;
                case 'error':
                    return alert(obj);
                default:
            }
        };
        Game.prototype.postMessage = function (obj) {
            if (!('id' in obj))
                obj.id = this.id;
            this._worker.postMessage(obj);
        };
        Game.prototype._onWorkerUpdate = function (obj) {
            this.ballRenderLayer.visible = true;
            var balls = obj.balls;
            for (var i = 0; i < balls.length; ++i) {
                var ball = balls[i];
                var isset = false;
                for (var _i = 0, _a = this.balls; _i < _a.length; _i++) {
                    var ball2 = _a[_i];
                    if (ball2.id === ball.id) {
                        ball2.position = ball.pos;
                        ball2.angle = ball.rot;
                        isset = true;
                        break;
                    }
                }
                if (!isset) {
                }
            }
            this._physicsTime = obj.time;
        };
        Game.prototype.getSkillLevel = function () {
            return this._gameStartInfo.skillLevel;
        };
        /**增加游戏时间，单位：秒 */
        Game.prototype.addGameTime = function (n) {
            if (this._isGameStart && !this._isGameOver && !this._isTimeOver) {
                this._leftGameTime += n * 1000;
            }
        };
        //为了能在游戏中，实时显示冒险任务的进度，所以使用这个函数来收集任务数据
        Game.prototype.collectTaskData = function () {
            var taskData = {};
            var totalBall = 0;
            for (var _i = 0, _a = this._petKillCount; _i < _a.length; _i++) {
                var c = _a[_i];
                totalBall += c;
            }
            taskData.ball = totalBall;
            taskData.exp = this._petKillCount[0];
            taskData.bomb = this._bombCount;
            taskData.skill = this._skillCount;
            taskData.coin = this._coin;
            taskData.fever = this._feverCount;
            for (var i = 0; i < this._petKillCount.length; ++i) {
                var pid = this._gameStartInfo.pets[i];
                taskData['ball' + pid] = this._petKillCount[i];
            }
            taskData['skill' + this._gameStartInfo.pets[0]] = this._skillCount;
            taskData.link = this._maxLink;
            taskData.combo = this._maxCombo;
            taskData.expBomb = this._expBomb;
            taskData.timeBomb = this._timeBomb;
            taskData.scoreBomb = this._scoreBomb;
            taskData.coinBomb = this._coinBomb;
            taskData.score = this._score;
            return taskData;
        };
        Game.prototype._updateTaskText = function () {
            var task = this._weeklyTask;
            var text = '';
            if (task && task.status === 'running') {
                var parsedTaskType = WT.splitWeeklyTaskType(task.type, task.param);
                if (parsedTaskType) {
                    var key = parsedTaskType[1];
                    var taskData = this.collectTaskData();
                    var value = taskData[key] | 0;
                    value += task.count;
                    text = task.desc + "  " + value + "/" + task.maxCount;
                }
            }
            this.setTaskText(text);
        };
        /**暂停游戏 */
        Game.prototype._pauseGame = function () {
            if (!this._isGameStart)
                return;
            if (this.isMatch)
                return;
            if (!this._isGamePaused && !this._isTimeOver && !this._isGameOver) {
                this._isGamePaused = true;
                if (!this.gamePausePanel) {
                    this.gamePausePanel = new GamePausePanel_1.GamePausePanel(this);
                    this.spr.addChild(this.gamePausePanel.spr);
                }
                this.gamePausePanel.show();
            }
        };
        /**继续游戏 */
        Game.prototype._resumeGame = function () {
            if (this._isGamePaused) {
                this._isGamePaused = false;
            }
        };
        /**基本上由技能设置，子弹时间 */
        Game.prototype.setTimeScale = function (time) {
            if (!this._isGameStart)
                return;
            if (this._isTimeOver)
                return;
            if (time <= 0.0)
                time = 0.01;
            if (this._timeScale !== time) {
                this._timeScale = time;
                if (this._workerReady && this._worker) {
                    this._worker.postMessage({ cmd: 'timeScale', timeScale: time });
                }
            }
        };
        /**技能调用：随机将一种果冻整理到最上方 */
        Game.prototype.raiseUpBalls = function (balls) {
            if (!this._isGameStart)
                return;
            if (this._isTimeOver)
                return;
            var ids = balls.map(function (x) { return x.id; });
            if (this._workerReady && this._worker) {
                this._worker.postMessage({ cmd: 'raiseUpBalls', ids: ids });
            }
        };
        /**设置金币获取倍率 */
        Game.prototype.setCoinScale = function (n) {
            if (n !== this._coinScale) {
                this._coinScale = n;
            }
        };
        /**自动选中可以连接的三个球，提示提示一下 */
        Game.prototype.startHint = function () {
            this.clearHint();
            this._lastActionTime = Date.now(); //无论是否找到提示，重置一下时间，否则会立刻反复查找
            if (!this._isGameStart)
                return;
            if (this._gameStartInfo.tutorial)
                return;
            if (this._isTimeOver || this._isGameOver)
                return;
            if (this._skill.isCasting())
                return;
            var ballsByColor = {};
            var MAX_SQR_DIST = Game.MAX_LINK_DISTANCE * Game.MAX_LINK_DISTANCE * 0.9 * 0.9;
            for (var _i = 0, _a = this.balls; _i < _a.length; _i++) {
                var ball = _a[_i];
                if (!ball.isBomb && ball.status === 'normal') {
                    var color = ball.color;
                    if (!ballsByColor[color])
                        ballsByColor[color] = [];
                    ballsByColor[color].push(ball);
                }
            }
            var self = this;
            var hintBalls = null;
            //放入数组，随机一下
            var ballsOfBalls = [];
            for (var color in ballsByColor) {
                ballsOfBalls.push(ballsByColor[color]);
            }
            util.shuffle(ballsOfBalls);
            for (var _b = 0, ballsOfBalls_1 = ballsOfBalls; _b < ballsOfBalls_1.length; _b++) {
                var balls = ballsOfBalls_1[_b];
                util.shuffle(balls);
                hintBalls = search(balls);
                if (hintBalls)
                    break;
            }
            if (hintBalls) {
                //console.log('find hint', hintBalls);
                this._hintBalls = hintBalls;
                for (var i = 0; i < hintBalls.length; ++i) {
                    hintBalls[i].blink = true;
                }
            }
            else {
            }
            //search implement
            function search(balls, ret) {
                if (!ret || ret.length === 0) {
                    for (var _i = 0, balls_20 = balls; _i < balls_20.length; _i++) {
                        var ball = balls_20[_i];
                        var xx = search(balls, [ball]);
                        if (xx)
                            return xx;
                    }
                    return null;
                }
                if (ret.length >= 3)
                    return ret;
                var lastBall = ret[ret.length - 1];
                for (var _a = 0, balls_21 = balls; _a < balls_21.length; _a++) {
                    var ball = balls_21[_a];
                    if (ret.indexOf(ball) >= 0)
                        continue;
                    if (util.sqrDistance(lastBall.position, ball.position) > MAX_SQR_DIST)
                        continue;
                    if (!self.canLink(lastBall, ball))
                        continue;
                    var xx = search(balls, ret.concat(ball));
                    if (xx)
                        return xx;
                }
                return null;
            }
        };
        Game.prototype.clearHint = function () {
            for (var _i = 0, _a = this._hintBalls; _i < _a.length; _i++) {
                var ball = _a[_i];
                ball.blink = false;
            }
            this._hintBalls.length = 0;
            this._lastActionTime = Date.now();
        };
        Game.prototype._checkHint = function () {
            if (Date.now() > this._lastActionTime + 3000) {
                this.startHint();
            }
            if (!this._hintBalls || !this._hintBalls.length)
                return;
            for (var i = 0; i < this._hintBalls.length - 1; ++i) {
                var ball = this._hintBalls[i];
                if (ball.status !== 'normal') {
                    this.clearHint();
                    break;
                }
            }
            for (var i = 0; i < this._hintBalls.length - 1; ++i) {
                if (!this._canLink(this._hintBalls[i], this._hintBalls[i + 1])) {
                    this.clearHint();
                    break;
                }
            }
        };
        Game.prototype._showNeedMoreTimeDialog = function (onOk, onCancel) {
            var _this = this;
            this._needMoreTimeStatus = 'showing';
            /*
            let dlg = new NeedMoreTimeDialog(this);
            this.spr.addChild(dlg.spr);
            dlg.show(() =>
            {
                this._needMoreTimeStatus = 'showned';
                onOk();
            }, () =>
            {
                this._needMoreTimeStatus = 'showned';
                onCancel();
            })*/
            HallUI_55.HallUI.instance.whenWant10s(5, function () {
                _this._needMoreTimeStatus = 'showned';
                onOk();
            }, function () {
                _this._needMoreTimeStatus = 'showned';
                onCancel();
            });
        };
        /**当前的条件是不是需要显示需要更多时间的对话框 */
        Game.prototype._isNeedToShowNeedMoreTimeDialog = function () {
            //如果当前分数 >= weeklyHighScore * 95% 则显示
            return !this._gameStartInfo.tutorial && !this._gameStartInfo.isMatch && this._score >= GameLink_30.GameLink.instance.weekHighScore * 0.95;
        };
        Game.prototype.setMatchPlayerScore = function (obj) {
            if (this._matchUI && typeof obj.gameScore === 'number') {
                var idx = -1;
                var players = GameLink_30.GameLink.instance.matchPlayers;
                for (var i = 0; i < players.length; ++i) {
                    if (players[i].key === obj.key)
                        idx = i;
                }
                if (idx !== -1) {
                    this._matchUI.setScore(idx + 1, obj.gameScore);
                }
            }
        };
        Game.prototype.showMatchWaitText = function (text) {
            this._matchWaitText.text = text;
            this._matchWaitText.visible = true;
        };
        Game.prototype.hideMatchWaitText = function () {
            this._matchWaitText.visible = false;
        };
        Game.prototype.hideBonusTime = function () {
            this._animation.hideBonusTime();
        };
        Game.MAX_LINK_DISTANCE = 160; /**两个球最大的可连接距离 */
        return Game;
    }());
    exports.Game = Game;
    function calcAABBCenter(balls) {
        if (balls.length == 0)
            return { x: 0, y: 0 };
        var x0, y0, x1, y1;
        x0 = x1 = balls[0].position.x;
        y0 = y1 = balls[0].position.y;
        for (var i = 1; i < balls.length; ++i) {
            var x = balls[i].position.x;
            var y = balls[i].position.y;
            if (x < x0)
                x0 = x;
            if (x > x1)
                x1 = x;
            if (y < y0)
                y0 = y;
            if (y > y1)
                y1 = y;
        }
        return { x: (x0 + x1) * 0.5, y: (y0 + y1) * 0.5 };
    }
    var COMBO_NUMBER = new MiniImageLoader_4.MiniImageLoader('images/Game/连击数字.png', function (image) { return util.cutRowImages(image, 11, res.GLOBAL_SCALE); });
    var COMBO_TEXT = new MiniImageLoader_4.MiniImageLoader('images/Game/连击字母.png', function (image) { return util.scaleImage(image, res.GLOBAL_SCALE); });
    //初始化上面的变量
    function _INIT_IMAGES() {
        COMBO_NUMBER.init();
        COMBO_TEXT.init();
    }
    var GAME_COMM_RES = [
        { id: 'images/Game/金币icon.png', src: 'images/Game/金币icon.png' },
        { id: 'images/Game/skillbg1.png', src: 'images/Game/skillbg1.png' },
        { id: 'images/Game/skillbg2.png', src: 'images/Game/skillbg2.png' },
        { id: 'images/Game/skillbg3.png', src: 'images/Game/skillbg3.png' },
        { id: 'fever_bg_0', src: 'images/Game/a_1_0000.png' },
        { id: 'fever_bg_1', src: 'images/Game/a_1_0001.png' },
        { id: 'fever_bg_2', src: 'images/Game/a_1_0002.png' },
        { id: 'fever_bg_3', src: 'images/Game/a_1_0003.png' },
        { id: 'fever_bg_4', src: 'images/Game/a_1_0004.png' },
        { id: 'fever_bg_5', src: 'images/Game/a_1_0005.png' },
        { id: 'game_task_bg', src: 'images/Game/_0025_图层-40-副本-3.png' },
        { id: 'shake_button_bg', src: 'images/Game/_0023_图层-3.png' },
        { id: 'pause_button_bg', src: 'images/Game/_0024_图层-2.png' },
        { id: 'exit_button', src: 'images/Game/exit_button.png' },
        { id: 'continue_button', src: 'images/Game/continue_button.png' },
        { id: 'ready', src: 'images/Game/准备.png' },
        { id: 'go', src: 'images/Game/GO.png' },
        { id: 'pause_text', src: 'images/Game/暂停中.png' },
        { id: 'more_time_text1', src: 'images/Game/-_0000_是否延长10秒倒计时？.png' },
        { id: 'more_time_text2', src: 'images/Game/more_time_dialog_text2.png' },
        { id: 'more_time_title', src: 'images/Game/-_0005_增-援.png' },
        { id: 'more_time_need', src: 'images/Game/-_0002_需-要.png' },
        { id: 'more_time_giveup', src: 'images/Game/-_0001_放-弃.png' },
        //{ id: 'timer_digits', src: 'images/倒计时数字.png' },
        //{ id: 'fever_text', src: 'images/Game/进度条f.png' },
        { id: 'clock_chars', src: 'images/Game/-_0000_倒计时数字.png' },
    ];
    var BALL_RES = [
        { id: 'bomb0', src: 'images/Balls/普通炸弹.png', anchorX: 50, anchorY: 50, color: "bomb0" },
        { id: 'bomb1', src: 'images/Balls/分数炸弹.png', anchorX: 50, anchorY: 50, color: "bomb1" },
        { id: 'bomb2', src: 'images/Balls/金钱炸弹.png', anchorX: 50, anchorY: 50, color: "bomb2" },
        { id: 'bomb3', src: 'images/Balls/经验炸弹.png', anchorX: 50, anchorY: 50, color: "bomb3" },
        { id: 'bomb4', src: 'images/Balls/时间炸弹.png', anchorX: 50, anchorY: 50, color: "bomb4" },
        { id: 'bomb5', src: 'images/Balls/BigBomb.png', anchorX: 50, anchorY: 50, color: "bomb5" },
        { id: 'images/Balls/1.png', src: 'images/Balls/1.png', anchorX: 40, anchorY: 40, color: "0" },
        { id: 'images/Balls/2.png', src: 'images/Balls/2.png', anchorX: 40, anchorY: 40, color: "1" },
        { id: 'images/Balls/3.png', src: 'images/Balls/3.png', anchorX: 40, anchorY: 40, color: "2" },
        { id: 'images/Balls/4.png', src: 'images/Balls/4.png', anchorX: 40, anchorY: 40, color: "3" },
        { id: 'images/Balls/5.png', src: 'images/Balls/5.png', anchorX: 40, anchorY: 40, color: "4" },
        { id: 'images/Balls/6.png', src: 'images/Balls/6.png', anchorX: 40, anchorY: 40, color: "5" },
        { id: 'images/Balls/7.png', src: 'images/Balls/7.png', anchorX: 40, anchorY: 40, color: "6" },
        { id: 'images/Balls/8.png', src: 'images/Balls/8.png', anchorX: 40, anchorY: 40, color: "7" },
        { id: 'images/Balls/9.png', src: 'images/Balls/9.png', anchorX: 40, anchorY: 40, color: "8" },
        { id: 'images/Balls/10.png', src: 'images/Balls/10.png', anchorX: 40, anchorY: 40, color: "9" },
        { id: 'images/Balls/11.png', src: 'images/Balls/11.png', anchorX: 40, anchorY: 40, color: "10" },
        { id: 'images/Balls/12.png', src: 'images/Balls/12.png', anchorX: 40, anchorY: 40, color: "11" },
        { id: 'images/Balls/13.png', src: 'images/Balls/13.png', anchorX: 40, anchorY: 40, color: "12" },
        { id: 'images/Balls/14.png', src: 'images/Balls/14.png', anchorX: 40, anchorY: 40, color: "13" },
        { id: 'images/Balls/15.png', src: 'images/Balls/15.png', anchorX: 40, anchorY: 40, color: "14" },
        { id: 'images/Balls/16.png', src: 'images/Balls/16.png', anchorX: 40, anchorY: 40, color: "15" },
        { id: 'images/Balls/17.png', src: 'images/Balls/17.png', anchorX: 40, anchorY: 40, color: "16" },
        { id: 'images/Balls/18.png', src: 'images/Balls/18.png', anchorX: 40, anchorY: 40, color: "17" },
        { id: 'images/Balls/19.png', src: 'images/Balls/19.png', anchorX: 40, anchorY: 40, color: "18" },
        { id: 'images/Balls/20.png', src: 'images/Balls/20.png', anchorX: 40, anchorY: 40, color: "19" },
        { id: 'images/Balls/21.png', src: 'images/Balls/21.png', anchorX: 40, anchorY: 40, color: "20" },
        { id: 'images/Balls/22.png', src: 'images/Balls/22.png', anchorX: 40, anchorY: 40, color: "21" },
        { id: 'images/Balls/23.png', src: 'images/Balls/23.png', anchorX: 40, anchorY: 40, color: "22" },
        { id: 'images/Balls/24.png', src: 'images/Balls/24.png', anchorX: 40, anchorY: 40, color: "23" },
        { id: 'images/Balls/25.png', src: 'images/Balls/25.png', anchorX: 40, anchorY: 40, color: "24" },
        { id: 'images/Balls/26.png', src: 'images/Balls/26.png', anchorX: 40, anchorY: 40, color: "25" },
        { id: 'images/Balls/27.png', src: 'images/Balls/27.png', anchorX: 40, anchorY: 40, color: "26" },
    ];
    var BALL_RES_BOMB_COUNT = 6;
    //特殊炸弹的color
    var BOMB_TYPE_SCORE = 'bomb1'; //炸弹炸掉的球的分数翻倍
    var BOMB_TYPE_COIN = 'bomb2'; //加金币10个
    var BOMB_TYPE_EXP = 'bomb3'; //经验增加10（携带宠物的经验）
    var BOMB_TYPE_TIME = 'bomb4'; //时间增加2秒
    var BOMB_TYPE_BIG = 'bomb5';
});
//BALL_RES = BALL_RES.slice(0, BALL_RES_BOMB_COUNT + 2);
//BALL_RES.length = 2;
define("client/src/GameStage", ["require", "exports", "client/src/resource", "client/src/game/Game", "client/src/hall/HallUI", "main", "client/src/GameLink", "client/src/hall/pet_levelup/PetLevelUpPanel", "client/src/SoundManager"], function (require, exports, resource_27, Game_2, HallUI_56, main, GameLink_31, PetLevelUpPanel_1, SoundManager_8) {
    "use strict";
    var GameStage = (function () {
        function GameStage(canvas) {
            var _this = this;
            /**背景们，调用setCssBackground的时候，就是切换这些的显示状态 */
            this.backgroundImageElements = [];
            this.label = new createjs.Text();
            this._dirty = false;
            this._drawTime = 0;
            this._link = new GameLink_31.GameLink();
            //create backgroundImageElement
            window['stage'] = this;
            GameStage.instance = this;
            createjs.Ticker.framerate = resource_27.GraphicConstant.FPS;
            //createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
            createjs.Ticker.on('tick', function () { return _this.update(); });
            this.canvas = canvas;
            this.stage = new createjs.Stage(canvas);
            this.stage.snapToPixelEnabled = true;
            this._hall = new HallUI_56.HallUI();
            this.stage.addChild(this._hall.spr);
            this.stage.addChild(this.label);
            this.label.textAlign = 'right';
            this.label.x = resource_27.GraphicConstant.SCREEN_WIDTH;
            this.label.font = '13px';
            this.label.lineHeight = 13;
            createjs.Touch.enable(this.stage, true);
            this._hall.show();
        }
        GameStage.prototype.setCssBackgroundImage = function (image) {
            var parent = this.canvas.parentElement;
            image.className = 'contentOnly';
            image.style.position = 'absolute';
            image.style.width = '100%';
            image.style.height = '100%';
            image.style.left = null;
            image.style.top = null;
            parent.insertBefore(image, parent.firstChild);
            image.setAttribute('data-url', image.src);
            this.backgroundImageElements.push(image);
        };
        GameStage.prototype.setCssBackground = function (url) {
            // 现在这个实现，不是用css背景了
            // 为了切换css背景每次都是重新读取图片的问题
            // 所以创建多个img标签，切换的时候将不需要的背景隐藏起来
            var has = false;
            for (var i = 0; i < this.backgroundImageElements.length; ++i) {
                var img = this.backgroundImageElements[i];
                var data_url = img.getAttribute('data-url');
                if (data_url == url) {
                    has = true;
                    img.style.display = 'block';
                }
                else {
                    img.style.display = 'none';
                }
            }
            if (!has) {
                var img = main.createOverlayHtml('img');
                var parent_1 = this.canvas.parentElement;
                //插入到parent第一个元素
                parent_1.insertBefore(img, parent_1.firstChild);
                img.src = url;
                img.setAttribute('data-url', url);
                this.backgroundImageElements.push(img);
            }
        };
        GameStage.prototype.update = function () {
            if (document.hidden === true) {
                SoundManager_8.SoundManager.background = true;
            }
            var physicsTime = 0;
            var logicTime = 0;
            var tick = 0;
            if (this._currentGame) {
                this._currentGame.update();
                physicsTime = this._currentGame.physicsTime;
                logicTime = this._currentGame.logicTime;
                tick = this._currentGame.tick;
            }
            /*
            this.label.text = `fps:${createjs.Ticker.getMeasuredFPS() | 0}
    physics:${physicsTime | 0}ms
    logicTime:${logicTime | 0}ms
    drawTime:${this._drawTime | 0}ms
    tick:${tick}
            `*/
            this.label.visible = false;
            var t1 = Date.now();
            this.stage.update();
            this._drawTime = Date.now() - t1;
        };
        /*
            restartGame()
            {
                this.closeGame();
                alert('游戏结束，重新开始啦');
                let game = new Game();
                this.stage.addChildAt(game.spr, 0);
                game.init();
                this._currentGame = game;
            }
        */
        GameStage.prototype.createGame = function (obj) {
            this.closeGame();
            this._currentGame = new Game_2.Game();
            this.stage.addChild(this._currentGame.spr);
            this._currentGame.init(obj);
            this._hall.show(false);
        };
        GameStage.prototype.closeGame = function () {
            if (this._currentGame) {
                this.stage.removeChild(this._currentGame.spr);
                this._currentGame.clear();
                this._currentGame = null;
            }
            this._hall.show(true);
            this._hall._updateCssBackground();
        };
        //如果当前游戏是对战模式，则结束游戏。
        //因为对战模式是不能断线重入。所以这个特殊处理一下
        GameStage.prototype.closeMatchGame = function () {
            if (this._currentGame && this._currentGame.isMatch) {
                this.closeGame();
            }
        };
        /**当收到gameover cmd的时候，由GameLink调用这个 */
        GameStage.prototype.showGameOver = function (obj) {
            var _this = this;
            var petPanel = new PetLevelUpPanel_1.PetLevelUpPanel(obj.petResult);
            this.stage.addChild(petPanel.spr);
            SoundManager_8.SoundManager.playBg(null);
            SoundManager_8.SoundManager.playEffect('bgGameOver');
            if (this._currentGame) {
                this._currentGame.hideBonusTime();
                this._currentGame.hideMatchWaitText();
            }
            petPanel.onAnimationEnd = function () {
                _this.closeGame();
                if (obj.isMatch) {
                    _this._hall.showMatchEndPanel(obj);
                }
                else {
                    _this._hall.showScorePanel(obj);
                }
            };
            if (obj.isMatch) {
                console.log('收到对战结束信息');
            }
        };
        GameStage.prototype.testPetLevelUp = function () {
            var petPanel = new PetLevelUpPanel_1.PetLevelUpPanel(PetLevelUpPanel_1.PetLevelUpPanel.SAMPLE_DATA);
            this.stage.addChild(petPanel.spr);
        };
        GameStage.prototype.makeDirty = function () {
            var _this = this;
            if (!this._dirty) {
                this._dirty = true;
                window.requestAnimationFrame(function () {
                    _this._dirty = false;
                    _this.stage.update();
                });
            }
        };
        return GameStage;
    }());
    exports.GameStage = GameStage;
});
define("main", ["require", "exports", "client/src/resource", "client/src/GameStage", "client/src/LoginUI", "client/src/ShareFunctions"], function (require, exports, res, GameStage_8, LoginUI, share) {
    "use strict";
    var canvas;
    var canvasWrapDiv;
    var currentScale = 1;
    var onScaleCallbackList = [];
    function addResizeCallback(f) {
        onScaleCallbackList.push(f);
        window.setTimeout(function () { return f(currentScale); }, 0);
    }
    exports.addResizeCallback = addResizeCallback;
    function resetSize() {
        if (isInputFocus())
            return;
        var canvasRatio = res.GraphicConstant.SCREEN_HEIGHT / res.GraphicConstant.SCREEN_WIDTH;
        var windowRatio = window.innerHeight / window.innerWidth;
        var width;
        var height;
        var left = 0;
        var top = 0;
        if (windowRatio < canvasRatio) {
            height = window.innerHeight;
            width = height / canvasRatio;
            left = (window.innerWidth - width) / 2;
        }
        else {
            width = window.innerWidth;
            height = width * canvasRatio;
            top = (window.innerHeight - height) / 2;
        }
        currentScale = width / 640;
        LoginUI.setScale(currentScale);
        //canvas.style.position = 'relative';
        canvasWrapDiv.style.width = width + 'px';
        canvasWrapDiv.style.height = height + 'px';
        canvasWrapDiv.style.left = left + 'px';
        canvasWrapDiv.style.top = top + 'px';
        canvasWrapDiv.style.backgroundSize = width + "px";
        canvas.style.backgroundSize = width + "px";
        for (var _i = 0, onScaleCallbackList_1 = onScaleCallbackList; _i < onScaleCallbackList_1.length; _i++) {
            var f = onScaleCallbackList_1[_i];
            f(currentScale);
        }
    }
    exports.resetSize = resetSize;
    function createOverlayHtml(tag) {
        var elem = document.createElement(tag);
        elem.className = 'contentOnly';
        elem.style.position = 'absolute';
        elem.style.width = '100%';
        elem.style.height = '100%';
        return elem;
    }
    exports.createOverlayHtml = createOverlayHtml;
    function addToTopLayer(elem) {
        document.getElementById('canvasWrapper').appendChild(elem);
    }
    exports.addToTopLayer = addToTopLayer;
    function initHtml() {
        canvas = document.getElementsByTagName('canvas')[0];
        canvasWrapDiv = document.getElementById('canvasWrapper');
        canvas.width = res.GraphicConstant.SCREEN_WIDTH;
        canvas.height = res.GraphicConstant.SCREEN_HEIGHT;
        canvas.style.backgroundColor = 'rgba(0,0,0,0)';
        canvas.style.position = 'absolute';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvasWrapDiv.style.position = 'relative';
        //canvasWrapDiv.style.overflow = 'hidden';
        share.init();
    }
    window["ballybally_main"] = function () {
        $(function () {
            initHtml();
            resetSize();
            window.addEventListener('resize', resetSize);
            $('#canvasWrapper').css('display', '');
            if (navigator.userAgent.toLowerCase().indexOf('micromessenger') >= 0)
                createWechatAlertMask();
            else {
                new GameStage_8.GameStage(canvas);
            }
        });
    };
    function isInputFocus() {
        var element = document.activeElement;
        if (element && element.tagName === 'INPUT' && element.getAttribute('type') === 'text') {
            return true;
        }
        return false;
    }
    function createWechatAlertMask() {
        var div = document.createElement('div');
        $(div).css({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            position: 'absolute',
            'background-color': 'rgba(0,0,0,0.8)'
        });
        var img = document.createElement('img');
        img.src = "images/111.png";
        $(img).css({
            right: 40,
            top: 20,
            position: 'absolute'
        });
        div.appendChild(img);
        document.body.appendChild(div);
    }
});
