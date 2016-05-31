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