require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Game":[function(require,module,exports){
"use strict";
cc._RFpush(module, '507a02Yv7tP8o/z02+Gu3/R', 'Game');
// scripts/Game.js

var Player = require('Player');
var ScoreFX = require('ScoreFX');
var Star = require('Star');

cc.Class({
    'extends': cc.Component,

    properties: {
        starPrefab: {
            'default': null,
            type: cc.Prefab
        },
        scoreFXPrefab: {
            'default': null,
            type: cc.Prefab
        },
        maxStarDuration: 0,
        minStarDuration: 0,
        ground: {
            'default': null,
            type: cc.Node
        },
        player: {
            'default': null,
            type: Player
        },
        scoreDisplay: {
            'default': null,
            type: cc.Label
        },
        scoreAudio: {
            'default': null,
            url: cc.AudioClip
        },
        btnNode: {
            'default': null,
            type: cc.Node
        },
        gameOverNode: {
            'default': null,
            type: cc.Node
        },
        controlHintLabel: {
            'default': null,
            type: cc.Label
        },
        keyboardHint: {
            'default': '',
            multiline: true
        },
        touchHint: {
            'default': '',
            multiline: true
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.groundY = this.ground.y + this.ground.height / 2;

        // store last star's x position
        this.currentStar = null;
        this.currentStarX = 0;

        this.timer = 0;
        this.starDuration = 0;

        // is showing menu or running game
        this.isRunning = false;

        var hintText = cc.sys.isMobile ? this.touchHint : this.keyboardHint;
        this.controlHintLabel.string = hintText;
    },

    onStartGame: function onStartGame() {
        // 初始化计分
        this.resetScore();
        // set game state to running
        this.isRunning = true;
        // set button and gameover text out of screen
        this.btnNode.setPositionX(3000);
        this.gameOverNode.active = false;
        // reset player position and move speed
        this.player.startMoveAt(cc.p(0, this.groundY));
        // spawn star
        this.spawnNewStar();
    },

    resetScore: function resetScore() {
        this.score = 0;
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
    },

    spawnNewStar: function spawnNewStar() {
        var newStar = null;
        if (cc.pool.hasObject(Star)) {
            newStar = cc.pool.getFromPool(Star).node;
        } else {
            newStar = cc.instantiate(this.starPrefab);
        }

        this.node.addChild(newStar);

        newStar.setPosition(this.getNewStarPosition());

        newStar.getComponent('Star').init(this);

        this.startTimer();
        this.currentStar = newStar;
    },

    startTimer: function startTimer() {
        // get a life duration for next star
        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition: function getNewStarPosition() {
        if (!this.currentStar) {
            this.currentStarX = cc.randomMinus1To1() * this.node.width / 2;
        }

        var randX = 0;
        var randY = this.groundY + cc.random0To1() * this.player.jumpHeight + 50;

        var maxX = this.node.width / 2;
        if (this.currentStarX >= 0) {
            randX = -cc.random0To1() * maxX;
        } else {
            randX = cc.random0To1() * maxX;
        }
        this.currentStarX = randX;

        return cc.p(randX, randY);
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (!this.isRunning) {
            return;
        }

        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }

        this.timer += dt;
    },

    gainScore: function gainScore(pos) {
        this.score += 1;

        this.scoreDisplay.string = 'Score: ' + this.score.toString();

        var fx = this.spawnScoreFX();
        this.node.addChild(fx.node);
        fx.node.setPosition(pos);
        fx.play();

        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    spawnScoreFX: function spawnScoreFX() {
        var fx;
        if (cc.pool.hasObject(ScoreFX)) {
            fx = cc.pool.getFromPool(ScoreFX);
            return fx;
        } else {
            fx = cc.instantiate(this.scoreFXPrefab);
            return fx.getComponent('ScoreFX');
        }
    },

    gameOver: function gameOver() {
        this.gameOverNode.active = true;
        this.player.enabled = false;
        this.player.stopMove();
        this.currentStar.destroy();
        this.isRunning = false;
        this.btnNode.setPositionX(0);
    }
});

cc._RFpop();
},{"Player":"Player","ScoreFX":"ScoreFX","Star":"Star"}],"Player":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'adae6P/HaZF6LLOlYWOJXP4', 'Player');
// scripts/Player.js

cc.Class({
    "extends": cc.Component,

    properties: {
        jumpHeight: 0,
        jumpDuration: 0,
        maxMoveSpeed: 0,
        accel: 0,

        jumpAudio: {
            "default": null,
            url: cc.AudioClip
        },

        squashDuration: 0
    },

    setJumpAction: function setJumpAction() {
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        var squash = cc.scaleTo(this.squashDuration, 1, 0.6);
        var stretch = cc.scaleTo(this.squashDuration, 1, 1.2);
        var scaleBack = cc.scaleTo(this.squashDuration, 1, 1);
        var callback = cc.callFunc(this.playJumpSound, this);
        return cc.repeatForever(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback));
    },

    playJumpSound: function playJumpSound() {
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    setInputControl: function setInputControl() {
        var self = this;

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                    case cc.KEY.left:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                    case cc.KEY.right:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },
            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                    case cc.KEY.left:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                    case cc.KEY.right:
                        self.accRight = true;
                        break;
                }
            }
        }, self.node);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function onTouchBegan(touch, event) {
                var touchLoc = touch.getLocation();
                if (touchLoc.x > cc.winSize.width / 2) {
                    self.accLeft = false;
                    self.accRight = true;
                } else {
                    self.accLeft = true;
                    self.accRight = false;
                }

                return true;
            },
            onTouchEnded: function onTouchEnded(touch, event) {
                self.accLeft = false;
                self.accRight = false;
            }
        }, self.node);
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.enabled = false;

        this.jumpAction = this.setJumpAction();

        this.accLeft = false;
        this.accRight = false;

        this.xSpeed = 0;

        // screen boundaries
        this.minPosX = -this.node.parent.width / 2;
        this.maxPosX = this.node.parent.width / 2;

        this.setInputControl();
    },

    getCenterPos: function getCenterPos() {
        var centerPos = cc.p(this.node.x, this.node.y + this.node.height / 2);
        return centerPos;
    },

    startMoveAt: function startMoveAt(pos) {
        this.enabled = true;
        this.xSpeed = 0;
        this.node.setPosition(pos);
        this.node.runAction(this.setJumpAction());
    },

    stopMove: function stopMove() {
        this.node.stopAllActions();
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }

        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        this.node.x += this.xSpeed * dt;

        if (this.node.x > this.node.parent.width / 2) {
            this.node.x = this.node.parent.width / 2;
            this.xSpeed = 0;
        } else if (this.node.x < -this.node.parent.width / 2) {
            this.node.x = -this.node.parent.width / 2;
            this.xSpeed = 0;
        }
    }
});

cc._RFpop();
},{}],"ScoreAnim":[function(require,module,exports){
"use strict";
cc._RFpush(module, '18ba02uHv9HTKXkHBSF66js', 'ScoreAnim');
// scripts/ScoreAnim.js

cc.Class({
    'extends': cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function onLoad() {},

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    hideFX: function hideFX() {
        this.node.parent.removeFromParent();
        cc.pool.putInPool(this.node.parent.getComponent('ScoreFX'));
    }
});

cc._RFpop();
},{}],"ScoreFX":[function(require,module,exports){
"use strict";
cc._RFpush(module, '797e3eX+dJEnb9JTZktlswP', 'ScoreFX');
// scripts/ScoreFX.js

cc.Class({
    'extends': cc.Component,

    properties: {
        anim: {
            'default': null,
            type: cc.Animation
        }
    },

    // use this for initialization
    onLoad: function onLoad() {},

    play: function play() {
        this.anim.play('score_pop');
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"Star":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'd6e1fNCyblJh5UDqstRq8Sc', 'Star');
// scripts/Star.js

cc.Class({
    "extends": cc.Component,

    properties: {
        pickRadius: 0
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.enabled = false;
    },

    init: function init(game) {
        this.game = game;
        this.enabled = true;
        this.node.opacity = 255;
    },

    getPlayerDistance: function getPlayerDistance() {
        var playerPos = this.game.player.getCenterPos();
        var dist = cc.pDistance(this.node.position, playerPos);

        return dist;
    },

    onPicked: function onPicked() {
        var pos = this.node.getPosition();

        this.game.spawnNewStar();

        this.game.gainScore(pos);

        this.node.removeFromParent();

        cc.pool.putInPool(this);
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.onPicked();

            return;
        }

        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;

        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    }
});

cc._RFpop();
},{}]},{},["ScoreAnim","Game","ScoreFX","Player","Star"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiYXNzZXRzL3NjcmlwdHMvR2FtZS5qcyIsImFzc2V0cy9zY3JpcHRzL1BsYXllci5qcyIsImFzc2V0cy9zY3JpcHRzL1Njb3JlQW5pbS5qcyIsImFzc2V0cy9zY3JpcHRzL1Njb3JlRlguanMiLCJhc3NldHMvc2NyaXB0cy9TdGFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzUwN2EwMll2N3RQOG8vejAyK0d1My9SJywgJ0dhbWUnKTtcbi8vIHNjcmlwdHMvR2FtZS5qc1xuXG52YXIgUGxheWVyID0gcmVxdWlyZSgnUGxheWVyJyk7XG52YXIgU2NvcmVGWCA9IHJlcXVpcmUoJ1Njb3JlRlgnKTtcbnZhciBTdGFyID0gcmVxdWlyZSgnU3RhcicpO1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHN0YXJQcmVmYWI6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLlByZWZhYlxuICAgICAgICB9LFxuICAgICAgICBzY29yZUZYUHJlZmFiOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgbWF4U3RhckR1cmF0aW9uOiAwLFxuICAgICAgICBtaW5TdGFyRHVyYXRpb246IDAsXG4gICAgICAgIGdyb3VuZDoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICBwbGF5ZXI6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IFBsYXllclxuICAgICAgICB9LFxuICAgICAgICBzY29yZURpc3BsYXk6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgICAgIH0sXG4gICAgICAgIHNjb3JlQXVkaW86IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHVybDogY2MuQXVkaW9DbGlwXG4gICAgICAgIH0sXG4gICAgICAgIGJ0bk5vZGU6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcbiAgICAgICAgZ2FtZU92ZXJOb2RlOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRyb2xIaW50TGFiZWw6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgICAgIH0sXG4gICAgICAgIGtleWJvYXJkSGludDoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiAnJyxcbiAgICAgICAgICAgIG11bHRpbGluZTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB0b3VjaEhpbnQ6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogJycsXG4gICAgICAgICAgICBtdWx0aWxpbmU6IHRydWVcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5ncm91bmRZID0gdGhpcy5ncm91bmQueSArIHRoaXMuZ3JvdW5kLmhlaWdodCAvIDI7XG5cbiAgICAgICAgLy8gc3RvcmUgbGFzdCBzdGFyJ3MgeCBwb3NpdGlvblxuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyID0gbnVsbDtcbiAgICAgICAgdGhpcy5jdXJyZW50U3RhclggPSAwO1xuXG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLnN0YXJEdXJhdGlvbiA9IDA7XG5cbiAgICAgICAgLy8gaXMgc2hvd2luZyBtZW51IG9yIHJ1bm5pbmcgZ2FtZVxuICAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBoaW50VGV4dCA9IGNjLnN5cy5pc01vYmlsZSA/IHRoaXMudG91Y2hIaW50IDogdGhpcy5rZXlib2FyZEhpbnQ7XG4gICAgICAgIHRoaXMuY29udHJvbEhpbnRMYWJlbC5zdHJpbmcgPSBoaW50VGV4dDtcbiAgICB9LFxuXG4gICAgb25TdGFydEdhbWU6IGZ1bmN0aW9uIG9uU3RhcnRHYW1lKCkge1xuICAgICAgICAvLyDliJ3lp4vljJborqHliIZcbiAgICAgICAgdGhpcy5yZXNldFNjb3JlKCk7XG4gICAgICAgIC8vIHNldCBnYW1lIHN0YXRlIHRvIHJ1bm5pbmdcbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xuICAgICAgICAvLyBzZXQgYnV0dG9uIGFuZCBnYW1lb3ZlciB0ZXh0IG91dCBvZiBzY3JlZW5cbiAgICAgICAgdGhpcy5idG5Ob2RlLnNldFBvc2l0aW9uWCgzMDAwKTtcbiAgICAgICAgdGhpcy5nYW1lT3Zlck5vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIC8vIHJlc2V0IHBsYXllciBwb3NpdGlvbiBhbmQgbW92ZSBzcGVlZFxuICAgICAgICB0aGlzLnBsYXllci5zdGFydE1vdmVBdChjYy5wKDAsIHRoaXMuZ3JvdW5kWSkpO1xuICAgICAgICAvLyBzcGF3biBzdGFyXG4gICAgICAgIHRoaXMuc3Bhd25OZXdTdGFyKCk7XG4gICAgfSxcblxuICAgIHJlc2V0U2NvcmU6IGZ1bmN0aW9uIHJlc2V0U2NvcmUoKSB7XG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgICB0aGlzLnNjb3JlRGlzcGxheS5zdHJpbmcgPSAnU2NvcmU6ICcgKyB0aGlzLnNjb3JlLnRvU3RyaW5nKCk7XG4gICAgfSxcblxuICAgIHNwYXduTmV3U3RhcjogZnVuY3Rpb24gc3Bhd25OZXdTdGFyKCkge1xuICAgICAgICB2YXIgbmV3U3RhciA9IG51bGw7XG4gICAgICAgIGlmIChjYy5wb29sLmhhc09iamVjdChTdGFyKSkge1xuICAgICAgICAgICAgbmV3U3RhciA9IGNjLnBvb2wuZ2V0RnJvbVBvb2woU3Rhcikubm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld1N0YXIgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnN0YXJQcmVmYWIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKG5ld1N0YXIpO1xuXG4gICAgICAgIG5ld1N0YXIuc2V0UG9zaXRpb24odGhpcy5nZXROZXdTdGFyUG9zaXRpb24oKSk7XG5cbiAgICAgICAgbmV3U3Rhci5nZXRDb21wb25lbnQoJ1N0YXInKS5pbml0KHRoaXMpO1xuXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lcigpO1xuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyID0gbmV3U3RhcjtcbiAgICB9LFxuXG4gICAgc3RhcnRUaW1lcjogZnVuY3Rpb24gc3RhcnRUaW1lcigpIHtcbiAgICAgICAgLy8gZ2V0IGEgbGlmZSBkdXJhdGlvbiBmb3IgbmV4dCBzdGFyXG4gICAgICAgIHRoaXMuc3RhckR1cmF0aW9uID0gdGhpcy5taW5TdGFyRHVyYXRpb24gKyBjYy5yYW5kb20wVG8xKCkgKiAodGhpcy5tYXhTdGFyRHVyYXRpb24gLSB0aGlzLm1pblN0YXJEdXJhdGlvbik7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgIH0sXG5cbiAgICBnZXROZXdTdGFyUG9zaXRpb246IGZ1bmN0aW9uIGdldE5ld1N0YXJQb3NpdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTdGFyKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGFyWCA9IGNjLnJhbmRvbU1pbnVzMVRvMSgpICogdGhpcy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByYW5kWCA9IDA7XG4gICAgICAgIHZhciByYW5kWSA9IHRoaXMuZ3JvdW5kWSArIGNjLnJhbmRvbTBUbzEoKSAqIHRoaXMucGxheWVyLmp1bXBIZWlnaHQgKyA1MDtcblxuICAgICAgICB2YXIgbWF4WCA9IHRoaXMubm9kZS53aWR0aCAvIDI7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTdGFyWCA+PSAwKSB7XG4gICAgICAgICAgICByYW5kWCA9IC1jYy5yYW5kb20wVG8xKCkgKiBtYXhYO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmFuZFggPSBjYy5yYW5kb20wVG8xKCkgKiBtYXhYO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudFN0YXJYID0gcmFuZFg7XG5cbiAgICAgICAgcmV0dXJuIGNjLnAocmFuZFgsIHJhbmRZKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy50aW1lciA+IHRoaXMuc3RhckR1cmF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRpbWVyICs9IGR0O1xuICAgIH0sXG5cbiAgICBnYWluU2NvcmU6IGZ1bmN0aW9uIGdhaW5TY29yZShwb3MpIHtcbiAgICAgICAgdGhpcy5zY29yZSArPSAxO1xuXG4gICAgICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTogJyArIHRoaXMuc2NvcmUudG9TdHJpbmcoKTtcblxuICAgICAgICB2YXIgZnggPSB0aGlzLnNwYXduU2NvcmVGWCgpO1xuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQoZngubm9kZSk7XG4gICAgICAgIGZ4Lm5vZGUuc2V0UG9zaXRpb24ocG9zKTtcbiAgICAgICAgZngucGxheSgpO1xuXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5zY29yZUF1ZGlvLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIHNwYXduU2NvcmVGWDogZnVuY3Rpb24gc3Bhd25TY29yZUZYKCkge1xuICAgICAgICB2YXIgZng7XG4gICAgICAgIGlmIChjYy5wb29sLmhhc09iamVjdChTY29yZUZYKSkge1xuICAgICAgICAgICAgZnggPSBjYy5wb29sLmdldEZyb21Qb29sKFNjb3JlRlgpO1xuICAgICAgICAgICAgcmV0dXJuIGZ4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnggPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnNjb3JlRlhQcmVmYWIpO1xuICAgICAgICAgICAgcmV0dXJuIGZ4LmdldENvbXBvbmVudCgnU2NvcmVGWCcpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbiBnYW1lT3ZlcigpIHtcbiAgICAgICAgdGhpcy5nYW1lT3Zlck5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBsYXllci5zdG9wTW92ZSgpO1xuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5idG5Ob2RlLnNldFBvc2l0aW9uWCgwKTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2FkYWU2UC9IYVpGNkxMT2xZV09KWFA0JywgJ1BsYXllcicpO1xuLy8gc2NyaXB0cy9QbGF5ZXIuanNcblxuY2MuQ2xhc3Moe1xuICAgIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGp1bXBIZWlnaHQ6IDAsXG4gICAgICAgIGp1bXBEdXJhdGlvbjogMCxcbiAgICAgICAgbWF4TW92ZVNwZWVkOiAwLFxuICAgICAgICBhY2NlbDogMCxcblxuICAgICAgICBqdW1wQXVkaW86IHtcbiAgICAgICAgICAgIFwiZGVmYXVsdFwiOiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfSxcblxuICAgICAgICBzcXVhc2hEdXJhdGlvbjogMFxuICAgIH0sXG5cbiAgICBzZXRKdW1wQWN0aW9uOiBmdW5jdGlvbiBzZXRKdW1wQWN0aW9uKCkge1xuICAgICAgICB2YXIganVtcFVwID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIHRoaXMuanVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25PdXQoKSk7XG4gICAgICAgIHZhciBqdW1wRG93biA9IGNjLm1vdmVCeSh0aGlzLmp1bXBEdXJhdGlvbiwgY2MucCgwLCAtdGhpcy5qdW1wSGVpZ2h0KSkuZWFzaW5nKGNjLmVhc2VDdWJpY0FjdGlvbkluKCkpO1xuICAgICAgICB2YXIgc3F1YXNoID0gY2Muc2NhbGVUbyh0aGlzLnNxdWFzaER1cmF0aW9uLCAxLCAwLjYpO1xuICAgICAgICB2YXIgc3RyZXRjaCA9IGNjLnNjYWxlVG8odGhpcy5zcXVhc2hEdXJhdGlvbiwgMSwgMS4yKTtcbiAgICAgICAgdmFyIHNjYWxlQmFjayA9IGNjLnNjYWxlVG8odGhpcy5zcXVhc2hEdXJhdGlvbiwgMSwgMSk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNjLmNhbGxGdW5jKHRoaXMucGxheUp1bXBTb3VuZCwgdGhpcyk7XG4gICAgICAgIHJldHVybiBjYy5yZXBlYXRGb3JldmVyKGNjLnNlcXVlbmNlKHNxdWFzaCwgc3RyZXRjaCwganVtcFVwLCBzY2FsZUJhY2ssIGp1bXBEb3duLCBjYWxsYmFjaykpO1xuICAgIH0sXG5cbiAgICBwbGF5SnVtcFNvdW5kOiBmdW5jdGlvbiBwbGF5SnVtcFNvdW5kKCkge1xuICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5RWZmZWN0KHRoaXMuanVtcEF1ZGlvLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIHNldElucHV0Q29udHJvbDogZnVuY3Rpb24gc2V0SW5wdXRDb250cm9sKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLktFWUJPQVJELFxuICAgICAgICAgICAgb25LZXlQcmVzc2VkOiBmdW5jdGlvbiBvbktleVByZXNzZWQoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuYTpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkubGVmdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkucmlnaHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uS2V5UmVsZWFzZWQ6IGZ1bmN0aW9uIG9uS2V5UmVsZWFzZWQoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuYTpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkubGVmdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmQ6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLnJpZ2h0OlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYubm9kZSk7XG5cbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLlRPVUNIX09ORV9CWV9PTkUsXG4gICAgICAgICAgICBvblRvdWNoQmVnYW46IGZ1bmN0aW9uIG9uVG91Y2hCZWdhbih0b3VjaCwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG91Y2hMb2MgPSB0b3VjaC5nZXRMb2NhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmICh0b3VjaExvYy54ID4gY2Mud2luU2l6ZS53aWR0aCAvIDIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblRvdWNoRW5kZWQ6IGZ1bmN0aW9uIG9uVG91Y2hFbmRlZCh0b3VjaCwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYubm9kZSk7XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmp1bXBBY3Rpb24gPSB0aGlzLnNldEp1bXBBY3Rpb24oKTtcblxuICAgICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hY2NSaWdodCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcblxuICAgICAgICAvLyBzY3JlZW4gYm91bmRhcmllc1xuICAgICAgICB0aGlzLm1pblBvc1ggPSAtdGhpcy5ub2RlLnBhcmVudC53aWR0aCAvIDI7XG4gICAgICAgIHRoaXMubWF4UG9zWCA9IHRoaXMubm9kZS5wYXJlbnQud2lkdGggLyAyO1xuXG4gICAgICAgIHRoaXMuc2V0SW5wdXRDb250cm9sKCk7XG4gICAgfSxcblxuICAgIGdldENlbnRlclBvczogZnVuY3Rpb24gZ2V0Q2VudGVyUG9zKCkge1xuICAgICAgICB2YXIgY2VudGVyUG9zID0gY2MucCh0aGlzLm5vZGUueCwgdGhpcy5ub2RlLnkgKyB0aGlzLm5vZGUuaGVpZ2h0IC8gMik7XG4gICAgICAgIHJldHVybiBjZW50ZXJQb3M7XG4gICAgfSxcblxuICAgIHN0YXJ0TW92ZUF0OiBmdW5jdGlvbiBzdGFydE1vdmVBdChwb3MpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICB0aGlzLm5vZGUuc2V0UG9zaXRpb24ocG9zKTtcbiAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbih0aGlzLnNldEp1bXBBY3Rpb24oKSk7XG4gICAgfSxcblxuICAgIHN0b3BNb3ZlOiBmdW5jdGlvbiBzdG9wTW92ZSgpIHtcbiAgICAgICAgdGhpcy5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAgICAgaWYgKHRoaXMuYWNjTGVmdCkge1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgLT0gdGhpcy5hY2NlbCAqIGR0O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWNjUmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMueFNwZWVkICs9IHRoaXMuYWNjZWwgKiBkdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnhTcGVlZCkgPiB0aGlzLm1heE1vdmVTcGVlZCkge1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSB0aGlzLm1heE1vdmVTcGVlZCAqIHRoaXMueFNwZWVkIC8gTWF0aC5hYnModGhpcy54U3BlZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ub2RlLnggKz0gdGhpcy54U3BlZWQgKiBkdDtcblxuICAgICAgICBpZiAodGhpcy5ub2RlLnggPiB0aGlzLm5vZGUucGFyZW50LndpZHRoIC8gMikge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm5vZGUucGFyZW50LndpZHRoIC8gMjtcbiAgICAgICAgICAgIHRoaXMueFNwZWVkID0gMDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm5vZGUueCA8IC10aGlzLm5vZGUucGFyZW50LndpZHRoIC8gMikge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSAtdGhpcy5ub2RlLnBhcmVudC53aWR0aCAvIDI7XG4gICAgICAgICAgICB0aGlzLnhTcGVlZCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzE4YmEwMnVIdjlIVEtYa0hCU0Y2NmpzJywgJ1Njb3JlQW5pbScpO1xuLy8gc2NyaXB0cy9TY29yZUFuaW0uanNcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICAgIC8vIH0sXG5cbiAgICBoaWRlRlg6IGZ1bmN0aW9uIGhpZGVGWCgpIHtcbiAgICAgICAgdGhpcy5ub2RlLnBhcmVudC5yZW1vdmVGcm9tUGFyZW50KCk7XG4gICAgICAgIGNjLnBvb2wucHV0SW5Qb29sKHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KCdTY29yZUZYJykpO1xuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnNzk3ZTNlWCtkSkVuYjlKVFprdGxzd1AnLCAnU2NvcmVGWCcpO1xuLy8gc2NyaXB0cy9TY29yZUZYLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgYW5pbToge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuQW5pbWF0aW9uXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcblxuICAgIHBsYXk6IGZ1bmN0aW9uIHBsYXkoKSB7XG4gICAgICAgIHRoaXMuYW5pbS5wbGF5KCdzY29yZV9wb3AnKTtcbiAgICB9XG5cbn0pO1xuLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbi8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbi8vIH0sXG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdkNmUxZk5DeWJsSmg1VURxc3RScThTYycsICdTdGFyJyk7XG4vLyBzY3JpcHRzL1N0YXIuanNcblxuY2MuQ2xhc3Moe1xuICAgIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHBpY2tSYWRpdXM6IDBcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KGdhbWUpIHtcbiAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG4gICAgfSxcblxuICAgIGdldFBsYXllckRpc3RhbmNlOiBmdW5jdGlvbiBnZXRQbGF5ZXJEaXN0YW5jZSgpIHtcbiAgICAgICAgdmFyIHBsYXllclBvcyA9IHRoaXMuZ2FtZS5wbGF5ZXIuZ2V0Q2VudGVyUG9zKCk7XG4gICAgICAgIHZhciBkaXN0ID0gY2MucERpc3RhbmNlKHRoaXMubm9kZS5wb3NpdGlvbiwgcGxheWVyUG9zKTtcblxuICAgICAgICByZXR1cm4gZGlzdDtcbiAgICB9LFxuXG4gICAgb25QaWNrZWQ6IGZ1bmN0aW9uIG9uUGlja2VkKCkge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5ub2RlLmdldFBvc2l0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5nYW1lLnNwYXduTmV3U3RhcigpO1xuXG4gICAgICAgIHRoaXMuZ2FtZS5nYWluU2NvcmUocG9zKTtcblxuICAgICAgICB0aGlzLm5vZGUucmVtb3ZlRnJvbVBhcmVudCgpO1xuXG4gICAgICAgIGNjLnBvb2wucHV0SW5Qb29sKHRoaXMpO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgICAgIGlmICh0aGlzLmdldFBsYXllckRpc3RhbmNlKCkgPCB0aGlzLnBpY2tSYWRpdXMpIHtcbiAgICAgICAgICAgIHRoaXMub25QaWNrZWQoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9wYWNpdHlSYXRpbyA9IDEgLSB0aGlzLmdhbWUudGltZXIgLyB0aGlzLmdhbWUuc3RhckR1cmF0aW9uO1xuICAgICAgICB2YXIgbWluT3BhY2l0eSA9IDUwO1xuXG4gICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gbWluT3BhY2l0eSArIE1hdGguZmxvb3Iob3BhY2l0eVJhdGlvICogKDI1NSAtIG1pbk9wYWNpdHkpKTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7Il19
