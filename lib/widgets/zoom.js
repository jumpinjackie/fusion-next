define([
    "fusion/core",
    "fusion/widget",
    "dojo/_base/declare",
    "dojo/topic",
    "dijit/form/ToggleButton",
    "openlayers/OpenLayers"
], function() {
    
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];
    var topic = arguments[3];
    var ToggleButton = arguments[4];
    var OpenLayers = arguments[5];

    var Zoom = declare(Widget, {
        tolerance : 5,
        factor : 2,
        zoomIn: true,
        initializeWidget: function(widgetTag) {
            var json = widgetTag.Extension ? widgetTag.Extension[0] : {};
            this.tolerance = json.Tolerance ? json.Tolerance[0] : this.tolerance;
            this.factor = json.Factor ? json.Factor[0] : this.factor;
            this.zoomIn = (json.Direction && json.Direction[0] == 'out') ? false : true;
        },
        onAttachInit: function() {
            var assetPath = Fusion.getAssetPath();
            var asCursorString= "url(" + assetPath + "cursors/zoomin.cur" + "), auto";
            var zoomOutCursorString = "url(" + assetPath + "cursors/zoomout.cur" + "), auto";
            this.asCursor = [asCursorString,'-moz-zoom-in', 'auto'];
            this.zoomInCursor = [asCursorString,'-moz-zoom-in', 'auto'];
            this.zoomOutCursor = [zoomOutCursorString,'-moz-zoom-out', 'auto'];

            this.keypressWatcher = OpenLayers.Function.bind(this.keypressHandler, this);
        
            var mapWidget = this.getMap();
            this.map = mapWidget.oMapOL;
            this.handler = new OpenLayers.Handler.Box(this, {done: this.execute}, {keyMask:0});
            this.shiftHandler = new OpenLayers.Handler.Box(this, 
                                    {done: this.altZoom}, 
                                    {keyMask:OpenLayers.Handler.MOD_SHIFT});
            mapWidget.handlers.push(this.handler);
            mapWidget.handlers.push(this.shiftHandler);

            //This contains auto-activate logic
            this.inherited(arguments);
        },
        getItemUiClass: function(containerType) {
            if (containerType == "toolbar") {
                return ToggleButton;
            } 
            return this.inherited(arguments);
        },
        setUiObject: function(uiObj) {
            this.inherited(arguments);
            Fusion.runtime.registerMutexWidget(this.getMutexWidgetSet(), this);
        },
        getMutexWidgetSet: function() {
            return Fusion.MutexWidgetSets.MAP_CONTROLS;
        },
        activate: function() {
            this.inherited(arguments);
            this.handler.activate();
            this.shiftHandler.activate();
            /*cursor*/
            if (this.zoomIn) {
                this.getMap().setCursor(this.zoomInCursor);
            } else {
                this.getMap().setCursor(this.zoomOutCursor);
            }
            OpenLayers.Event.observe(document, 'keypress', this.keypressWatcher);

            topic.publish(Widget.Events.ACTIVATED, this);
        },
        deactivate: function() {
            this.inherited(arguments);
            if (this.handler)
                this.handler.deactivate();
            if (this.shiftHandler)
                this.shiftHandler.deactivate();
            //this.getMap().setCursor('auto');
            OpenLayers.Event.stopObserving(document, 'keypress', this.keypressWatcher);
        },

        /**
         * Method: zoomBox
         *
         * Parameters:
         * position - {<OpenLayers.Bounds>} or {<OpenLayers.Pixel>}
         * @ignore
         */
        execute: function (position, altZoom) {
            /* if the last event had a shift modifier, swap the sense of this
                    tool - zoom in becomes out and zoom out becomes in */
            var zoomIn = this.zoomIn;
            if (altZoom) {
                zoomIn = !zoomIn;
            }
            var map = this.getMap();
            var mapOL = map.oMapOL;
            if (position instanceof OpenLayers.Bounds) {
                var minXY = mapOL.getLonLatFromPixel(new OpenLayers.Pixel(position.left, position.bottom));
                var maxXY = mapOL.getLonLatFromPixel(new OpenLayers.Pixel(position.right, position.top));
                var bounds = new OpenLayers.Bounds(minXY.lon, minXY.lat, maxXY.lon, maxXY.lat);
                if (zoomIn) {
                    map.setExtents(bounds);
                } else {
                    var newWidth = bounds.getWidth();
                    var newHeight = bounds.getHeight();
                    var currentExtents = map.getCurrentExtents();
                    var currentWidth = currentExtents.getWidth();
                    var currentHeight = currentExtents.getHeight();
                    var factor = Math.min(newWidth/currentWidth, newHeight/currentHeight);
                    var center = bounds.getCenterLonLat();
                    map.zoom(center.lon, center.lat, factor);
                }
            } else { // it's a pixel
                var center = mapOL.getLonLatFromPixel(position);
                var factor;
                if(!zoomIn && this.factor > 1) {
                    factor = 1/this.factor;
                } else {
                    factor = this.factor;
                }
                map.zoom(center.lon, center.lat, factor);
            }
        },

        /**
         * handler for zooming when the shift key is pressed.  This changes it
         * from in to out or vice versa
         *
         * Parameters:
         * position - {<OpenLayers.Bounds>} or {<OpenLayers.Pixel>}
         * @ignore
         */
        altZoom: function(position) {
            this.execute(position, true);
        }
    });
    return Zoom;
});