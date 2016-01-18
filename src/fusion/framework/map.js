/**
 * The Map module exports the Map widget class. See: {@link Map}
 * @module fusion/framework/map
 */
define([
    "fusion/framework/core",
    "fusion/framework/mapmessage",
    "dojo/_base/declare",
    "fusion/framework/widget",
    "fusion/framework/layermodel",
    "openlayers/ol",
    "fusion/framework/stringbundle",
    "dojo/topic",
    "dojo/query",
    "dojo/dom-style"
], function(
    Fusion,
    MapMessage,
    declare,
    Widget,
    LayerModel,
    ol,
    StringBundle,
    topic,
    query,
    domStyle
) {
    var Map = declare(Widget, {
        
    });
    /**
     * @namespace
     * @memberof Map
     */
    Map.Events = {
        /**
         * Raised when the map has loaded
         * @memberof! Map.Events
         * @constant
         */
        ACTIVE_MAP_CHANGED: "fusion/map/mapchanged",
        /**
         * Raised when the map has started re-drawing
         * @memberof! Map.Events
         * @constant
         */
        LOADING: "fusion/map/loading",
        /**
         * Raised when the map has completed re-drawing
         * @memberof! Map.Events
         * @constant
         */
        LOADED: "fusion/map/loaded",
        /** 
         * Raised when the extents of the map has changed
         * @memberof! Map.Events
         * @constant
         */
        EXTENTS_CHANGED: "fusion/map/extentschanged"
    };

    return Map;
});