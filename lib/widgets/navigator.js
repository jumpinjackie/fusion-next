define([
    "fusion/widget", 
    "dojo/_base/declare", 
    "openlayers/OpenLayers",
    "fusion/map",
    "dojo/topic"
], function() {
    var Widget = arguments[0];
    var declare = arguments[1];
    var OpenLayers = arguments[2];
    var Map = arguments[3];
    var topic = arguments[4];

    var Navigator = declare(Widget, {
        domElId: "Navigator",
        initializeWidget: function(widgetTag) {
            topic.subscribe(Map.Events.LOADING, OpenLayers.Function.bind(this.onMapLoading, this));
            topic.subscribe(Map.Events.LOADED, OpenLayers.Function.bind(this.onMapLoaded, this));
        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: function() { return true; },
        onMapLoading: function() {
            console.log("Map loading");
        },
        onMapLoaded: function() {
            console.log("Map loaded");
        }
    });
    return Navigator;
});