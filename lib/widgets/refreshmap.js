define(["fusion/core", "fusion/widget", "dojo/_base/declare"], function() {

    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];

    var RefreshMap = declare(Widget, {
        initializeWidget: function(widgetTag) {

        },
        activate: function() {
            this.getMap().redraw();
        }
    });
    return RefreshMap;
});