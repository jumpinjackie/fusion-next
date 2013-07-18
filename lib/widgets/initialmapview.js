define(["fusion/core", "fusion/widget", "dojo/_base/declare"], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];

    var InitialMapView = declare(Widget, {
        viewType: "initial",
        initializeWidget: function(widgetTag) {
            var json = widgetTag.Extension ? widgetTag.Extension[0] : {};
            if (json.ViewType && (json.ViewType[0].toLowerCase() == 'full')) {
                this.viewType = 'full';
            }
        },
        activate: function() {
            /*
            var mapWidget = this.getMap();
            if (this.viewType == 'full') {
                mapWidget.fullExtents();
            } else {
                mapWidget.setExtents(mapWidget.initialExtents);
            }*/
        }
    });
    return InitialMapView;
});