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