define(["fusion/core", "fusion/widget", "dojo/_base/declare"], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];

    var ViewOptions = declare(Widget, {
        initializeWidget: function(widgetTag) {

        }
    });
    return ViewOptions;
});