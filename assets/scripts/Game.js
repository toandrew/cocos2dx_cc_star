const Player = require('Player');
const ScoreFX = require('ScoreFX');
const Star = require('Star');

cc.Class({
    extends: cc.Component,

    properties: {
        starPrefab: {
            default: null,
            type: cc.Prefab
        },
        scoreFXPrefab: {
            default: null,
            type: cc.Prefab
        },
        maxStarDuration: 0,
        minStarDuration: 0,
        ground: {
            default: null,
            type: cc.Node
        },
        player: {
            default: null,
            type: Player
        },
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        scoreAudio: {
            default: null,
            url: cc.AudioClip
        },
        btnNode: {
            default: null,
            type: cc.Node
        },
        gameOverNode: {
            default: null,
            type: cc.Node
        },
        controlHintLabel: {
            default: null,
            type: cc.Label
        },
        keyboardHint: {
            default: '',
            multiline: true
        },
        touchHint: {
            default: '',
            multiline: true
        }
    },

    // use this for initialization
    onLoad: function () {
        this.groundY = this.ground.y + this.ground.height/2;
        
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
    
    onStartGame: function () {
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
    
    resetScore: function () {
        this.score = 0;
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
    },
    
    spawnNewStar: function() {
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
    
    startTimer: function () {
        // get a life duration for next star
        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition: function() {
        if (!this.currentStar) {
            this.currentStarX = cc.randomMinus1To1() * this.node.width/2;
        }
        
        var randX = 0;
        var randY = this.groundY + cc.random0To1() * this.player.jumpHeight + 50;
        
        var maxX = this.node.width/2;
        if (this.currentStarX >= 0) {
            randX = -cc.random0To1() * maxX;
        } else {
            randX = cc.random0To1() * maxX;
        }
        this.currentStarX = randX;
        
        return cc.p(randX, randY);
    },
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.isRunning) {
            return;
        }
        
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        
        this.timer += dt;
    },
    
    gainScore: function(pos) {
        this.score += 1;
        
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
        
        var fx = this.spawnScoreFX();
        this.node.addChild(fx.node);
        fx.node.setPosition(pos);
        fx.play();
        
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },
    
    spawnScoreFX: function () {
        var fx;
        if (cc.pool.hasObject(ScoreFX)) {
            fx = cc.pool.getFromPool(ScoreFX);
            return fx;
        } else {
            fx = cc.instantiate(this.scoreFXPrefab);
            return fx.getComponent('ScoreFX');
        }
    },

    gameOver: function() {
       this.gameOverNode.active = true;
       this.player.enabled = false;
       this.player.stopMove();
       this.currentStar.destroy();
       this.isRunning = false;
       this.btnNode.setPositionX(0);
    }
});
