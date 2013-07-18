define(["dojo/_base/declare", "fusion/core", "fusion/widget", "openlayers/OpenLayers"], function() {
    var declare = arguments[0];
    var Fusion = arguments[1];
    var Widget = arguments[2];
    var OpenLayers = arguments[3];

    var Map = declare(Widget, {
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: true,
        domElId: "Map",
        Events: {
            MAP_EXTENTS_CHANGED: "MAP_EXTENTS_CHANGED",
            MAP_BUSY_CHANGED: "MAP_BUSY_CHANGED",
            MAP_GENERIC_EVENT: "MAP_GENERIC_EVENT",
            MAP_RESIZED: "MAP_RESIZED",
            MAP_SELECTION_ON: "MAP_SELECTION_ON",
            MAP_SELECTION_OFF: "MAP_SELECTION_OFF",
            MAP_ACTIVE_LAYER_CHANGED: "MAP_ACTIVE_LAYER_CHANGED",
            MAP_LOADED: "MAP_LOADED",
            MAP_LOADING: "MAP_LOADING",
            MAP_RELOADED: "MAP_RELOADED",
            MAP_MAPTIP_REQ_FINISHED: "MAP_MAPTIP_REQ_FINISHED",
            WMS_LAYER_ADDED: "WMS_LAYER_ADDED",
            MAP_SCALE_RANGE_LOADED: "MAP_SCALE_RANGE_LOADED",
            MAP_MAP_GROUP_LOADED: "MAP_MAP_GROUP_LOADED",
            MAP_DIGITIZER_ACTIVATED: "MAP_DIGITIZER_ACTIVATED",
            MAP_DIGITIZER_DEACTIVATED: "MAP_DIGITIZER_DEACTIVATED"
        },
        initializeWidget: function(widgetTag) {
            var options = {
                div: this.domElId,
                //controls: [ new OpenLayers.Control.PinchZoom() ],
                fallThrough: true
            };
            this.oMapOL = new OpenLayers.Map(options);
            this.oMapOL.addLayer(new OpenLayers.Layer.OSM());
            this.oMapOL.zoomToMaxExtent();
        }
    });
    return Map;
});