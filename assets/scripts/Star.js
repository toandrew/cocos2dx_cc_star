cc.Class({
    extends: cc.Component,

    properties: {
        pickRadius: 0
    },

    // use this for initialization
    onLoad: function () {
        this.enabled = false;
    },
    
    init: function(game) {
        this.game = game;
        this.enabled = true;
        this.node.opacity = 255;
    },
    
    getPlayerDistance: function() {
        var playerPos = this.game.player.getCenterPos();
        var dist = cc.pDistance(this.node.position, playerPos);
        
        return dist;
    },
    
    onPicked: function() {
        var pos = this.node.getPosition();
        
        this.game.spawnNewStar();
        
        this.game.gainScore(pos);
        
        this.node.removeFromParent();
        
        cc.pool.putInPool(this);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.onPicked();
            
            return;
        }
        
        var opacityRatio = 1 - this.game.timer/this.game.starDuration;
        var minOpacity = 50;
        
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    }
});
