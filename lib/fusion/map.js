define([
    "dojo/_base/declare",
    "fusion/core",
    "fusion/widget",
    "openlayers/OpenLayers",
    "fusion/stringbundle"
], function() {
    
    var declare = arguments[0];
    var Fusion = arguments[1];
    var Widget = arguments[2];
    var OpenLayers = arguments[3];
    var StringBundle = arguments[4];

    var _aMaps = [];
    var _oCurrentExtents = null;

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
        },
        /**
         * Method: getCurrentExtents
         * 
         * returns the current extents
         */
        getCurrentExtents: function() {
            return this.oMapOL.getExtent();
        },
        /**
         * Function: getCurrentCenter
         *
         * returns the current center of the map view
         *
         * Return: 
         * {Object} an object with the following attributes
         * x - the x coordinate of the center
         * y - the y coordinate of the center
         */
        getCurrentCenter: function() {
            var c = this.getCurrentExtents().getCenterLonLat();
            return {x:c.lon, y:c.lat};
        },
        /**
         * Function: getScale
         * 
         * Gets the current scale of the map
         * 
         * Returns:
         * The current map scale
         */
        getScale: function() {
            return this.oMapOL.getScale();
        },
        /**
         * Function: setExtents
         *
         * handle selection events from maps and republish for
         * widgets as appropriate
         *
         * Parameters: {Object} oExtents - an OpenLayers.Bounds object or an array 
         *                            of 4 values that will be converted to Bounds
         *
         * Return: none
         */
        setExtents: function(oExtents) {
            if (!oExtents) {
                throw new Error(StringBundle.i18n('nullExtents'));
            }
            if (oExtents instanceof Array && oExtents.length == 4) {
                oExtents = new OpenLayers.Bounds(oExtents[0], oExtents[1], oExtents[2], oExtents[3]);
            }

            //update the timestamp param to prevent caching
            for (var i=0; i<_aMaps.length; i++ ) {
                if (_aMaps[i].oLayerOL.params && _aMaps[i].noCache) {
                    _aMaps[i].oLayerOL.params.ts = (new Date()).getTime();
                }
            }
            
            // when the parameter "oExtents" is a point which should be a rectangle, it will zoom to 1:1
            // this is often because the selected feature is a point feature, like tree
            // in this situation we can pan the point to the center, no need to zoom to 1:1
            if(oExtents.bottom == oExtents.top && oExtents.left == oExtents.right)
            {
                this.oMapOL.panTo(new OpenLayers.LonLat(oExtents.left, oExtents.top));
            }
            else
            {
                this.oMapOL.zoomToExtent(oExtents,true);
            }
            
            _oCurrentExtents = this.oMapOL.getExtent();
        },
        /**
         * Function: zoom
         * 
         * sets the map zoom and extent.
         *
         * Parameters:
         *   fX {Float} - new x coordinate value in map units
         *   fY {Float} - new y coordinate value in map units
         *   nFactor {Float} - zoom factor; positive values zoom in, negative out
         *                  - if set to 0 or 1, the map is just recentered
         *                  - if the map has fractional zoom enabled, the map resolution
         *                  will be modified by this factor
         *                  - with fixed scales, zoom up or down one level, depending on the sign
         *
         * Returns: none
         */
        zoom: function(fX, fY, nFactor) {
            //do this differntly with OL code??
            if (nFactor == 1 || nFactor == 0) {
                /*recenter*/
                this.oMapOL.panTo(new OpenLayers.LonLat(fX, fY));
            } else {
                var extent = this.oMapOL.getExtent();
                if (this.fractionalZoom) {
                    var fDeltaX = extent.right - extent.left;
                    var fDeltaY = extent.top - extent.bottom;
                    var fMinX,fMaxX,fMinY,fMaxY;
                    if (nFactor > 0) {
                        /*zoomin*/
                        fMinX = fX - (fDeltaX/2 / nFactor);
                        fMaxX = fX + (fDeltaX/2 / nFactor);
                        fMinY = fY - (fDeltaY/2 / nFactor);
                        fMaxY = fY + (fDeltaY/2 / nFactor);
                    } else if (nFactor < 0) {
                        /*zoomout*/
                        fMinX = fX - ((fDeltaX/2) * Math.abs(nFactor));
                        fMaxX = fX + ((fDeltaX/2) * Math.abs(nFactor));
                        fMinY = fY - ((fDeltaY/2) * Math.abs(nFactor));
                        fMaxY = fY + ((fDeltaY/2) * Math.abs(nFactor));
                    }
                    this.setExtents(new OpenLayers.Bounds(fMinX, fMinY, fMaxX, fMaxY));
                } else {
                    var currentZoomLevel = this.oMapOL.getZoom();
                    if (nFactor > 1) {
                        this.oMapOL.zoomTo(currentZoomLevel+1);
                    } else if (nFactor < 1) {
                        this.oMapOL.zoomTo(currentZoomLevel-1);
                    }
                }
            }
        },

        /**
         * Function: zoomToScale
         * 
         * Zooms to the specified scale
         *
         * Parameters:
         *   fScale - {Float} The scale to zoom to
         *
         * Returns: none
         */
        zoomToScale: function(fScale) {
            var center = this.getCurrentCenter();
            var extent = this.getExtentFromPoint(center.x, center.y, fScale);
            this.setExtents(extent);
        }
    });
    return Map;
});