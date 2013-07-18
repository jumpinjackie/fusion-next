define(["fusion/core", "fusion/widget", "dojo/_base/declare"], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];

    var ZoomOnClick = declare(Widget, {
        factor: 4,
        initializeWidget: function(widgetTag) {
            var json = widgetTag.Extension ? widgetTag.Extension[0] : {};
            this.factor = parseFloat(json.Factor ? json.Factor[0] : this.factor);
        },
        activate: function() {
            var center = this.getMap().getCurrentCenter();
            this.getMap().zoom(center.x, center.y, this.factor);
        }
    });
    return ZoomOnClick;
});