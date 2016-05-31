cc.Class({
    extends: cc.Component,

    properties: {
        anim: {
            default: null,
            type: cc.Animation
        }
    },

    // use this for initialization
    onLoad: function () {

    },
    
    play: function() {
        this.anim.play('score_pop');  
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
