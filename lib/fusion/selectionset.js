define([
    "dojo/_base/declare",
    "dojo/topic"
], function() {
    var declare = arguments[0];
    var topic = arguments[1];

    var SelectionSet = declare(null, {
        nTotalSelected: 0,
        aLayers: [],
        constructor: function(args) {
            
        },
        getTotalSelected: function() {
            return this.nTotalSelected;
        },
        getLayers: function() {
            return this.aLayers;
        }
    });

    SelectionSet.Events = {
        CHANGED: "fusion/selection/changed"
    };

    return SelectionSet;
});