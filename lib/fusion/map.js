define([
    "dojo/_base/declare",
    "fusion/widget",
    "fusion/layermodel",
    "openlayers/OpenLayers",
    "fusion/stringbundle",
    "dojo/topic",
    "dojo/dom-style"
], function() {
    
    var declare = arguments[0];
    var Widget = arguments[1];
    var LayerModel = arguments[2];
    var OpenLayers = arguments[3];
    var StringBundle = arguments[4];
    var topic = arguments[5];
    var domStyle = arguments[6];

    var _nLayersLoading = 0;
    var _isFirstLoad = true;

    var Map = declare(Widget, {
        domElId: "Map",
        activeLayerModel: null,
        layerModels: [],
        handlers: [],
        initializeWidget: function(widgetTag, mapSetTag, Fusion) {
            var options = {
                div: this.domElId,
                controls: [ new OpenLayers.Control.PinchZoom() ],
                fallThrough: true,
                tileManager: new OpenLayers.TileManager()
            };
            this.oMapOL = new OpenLayers.Map(options);

            var json = widgetTag.Extension ? widgetTag.Extension[0] : {};
            //add in the handler for mouse wheel actions
            var useMouseWheel = true;
            if (json.DisableMouseWheel &&
                json.DisableMouseWheel[0] == 'true') {
                useMouseWheel = false;
            }
            if (useMouseWheel) {
                this.wheelHandler = new OpenLayers.Handler.MouseWheel(this,
                                        {"up"  : this.wheelUp,
                                         "down": this.wheelDown} );
                this.wheelHandler.map = this.oMapOL;
                this.wheelHandler.activate();
                this.handlers.push(this.wheelHandler);
            }

            this.widgetTag = widgetTag;
            for (var i = 0; i < mapSetTag.MapGroup.length; i++) {
                var mapGroup = mapSetTag.MapGroup[i];
                var id = mapGroup["@id"];
                this.layerModels.push(new LayerModel({ id: id, mapWidget: this, mapGroupTag: mapGroup }));
            }
            for (var i = 0; i < this.layerModels.length; i++) {
                this.layerModels[i].loadLayers(Fusion, OpenLayers.Function.bind(this.onLayerModelInitialized, this));
            }
        },
        onLayerModelInitialized: function() {
            //Can only proceed if all layer models are initialized
            for (var i = 0; i < this.layerModels.length; i++) {
                if (!this.layerModels[i].bInitialized) {
                    return;
                }
            }
            console.log("All layer models initialized");
            var initMapId = this.widgetTag.MapId[0];
            this.switchToMap(initMapId);
        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: function() { return true; },
        /**
         * Switches this map widget to the give map id
         */
        switchToMap: function(mapId) {
            var model = null;
            //Get the matching layer model
            for (var i = 0; i < this.layerModels.length; i++) {
                if (this.layerModels[i].id == mapId) {
                    model = this.layerModels[i];
                    break;
                }
            }
            if (model != null) {
                //Dump any active map state to the active model
                if (this.activeLayerModel) {
                    this.activeLayerModel.dump();
                }

                //Clear out existing layers
                for (var i = this.oMapOL.layers.length - 1; i >= 0; i--) {
                    this.oMapOL.removeLayer(this.oMapOL.layers[i]);
                }

                //Apply new model and set as active
                this.activeLayerModel = model;
                this.activeLayerModel.applyToMap();

                console.log("Switched to map ID: " + mapId);
                topic.publish(Map.Events.ACTIVE_MAP_CHANGED, mapId);
            }
        },
        incrementLayerCounter: function() {
            if (_nLayersLoading === 0) {
                topic.publish(Map.Events.LOADING);
            }
            _nLayersLoading++;
        },
        decrementLayerCounter: function() {
            _nLayersLoading--;
            if (_nLayersLoading === 0) {
                topic.publish(Map.Events.LOADED);
            }
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
                throw new Error(StringBundle.i18n('E_NULL_EXTENTS'));
            }
            if (!this.activeLayerModel) {
                throw new Error(StringBundle.i18n('E_NO_ACTIVE_LAYER_MODEL'));
            }
            if (oExtents instanceof Array && oExtents.length == 4) {
                oExtents = new OpenLayers.Bounds(oExtents[0], oExtents[1], oExtents[2], oExtents[3]);
            }

            this.activeLayerModel.updateLayerTimestamps();
            
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
        },
        /**
         * Function: redraw
         *
         * redraws the map using current extents and zoom level.  A dummy parameter
         * is added to the map request to ensure the map request is not cached.
         *
         * Parameters: none
         *
         * Return: none
         */
        redraw: function() {
            if (!this.activeLayerModel) {
                throw new Error(StringBundle.i18n('E_NO_ACTIVE_LAYER_MODEL'));
            }
            this.activeLayerModel.updateLayerTimestamps();
            this.oMapOL.setCenter(this.oMapOL.getCenter(), this.oMapOL.getZoom(), false, true);
        },
        /**
         * Function: getSize
         * 
         * Gets the size of the map
         * 
         * Returns:
         * 
         *   return description
         */
        getSize: function() {
            return this.oMapOL.getSize();
        },
        /**
         * Method: pixToGeoMeasure
         *
         * convert pixel into geographic : used to measure.
         *
         * Parameters:
         * nPixels - {Integer} measures in pixel
         *
         * @return geographic measure
         */
        pixToGeoMeasure: function(nPixels) {
            var resolution = this.oMapOL.getResolution();
            return (nPixels*resolution);
        },
        setMetersPerUnit: function(mpu) {
            this.metersPerUnit = mpu;
        },
        getMetersPerUnit: function() {
            return this.metersPerUnit;
        },
        setCursor: function(cursor) {
            if (cursor && cursor.length && typeof cursor == 'object') {
                for (var i = 0; i < cursor.length; i++) {
                    domStyle.set(this.domElId, "cursor", cursor[i]);
                    if (domStyle.get(this.domElId, "cursor") == cursor[i]) {
                        break;
                    }
                }
            } else if (typeof cursor == 'string') {
                domStyle.set(this.domElId, "cursor", cursor);
            } else {
                domStyle.set(this.domElId, "cursor", 'auto');
            }
        },
        /**
         * Function: wheelChange
         *
         * handles mouse wheel events by accummulating the events and setting a timer
         * to do the actual zoom in/out
         * 
         * Parameters:
         * evt - {Event} the mouse wheel event object
         * deltaZ - {Integer} the number of ticks wheeled
         */
        wheelChange: function(evt, deltaZ) {
            if (this.wheelTimer) {
                clearTimeout(this.wheelTimer);
            } else {
                this.cumulativeDelta = 0;
            }
            this.cumulativeDelta += (deltaZ < 0)?-1:1;
            
            this.wheelTimer = setTimeout(OpenLayers.Function.bind(function(){this.doWheelChange(evt, deltaZ);}, this), 200);
        },

        /**
         * Function: doWheelChange
         *
         * Carries out the actual map zoom based on the wheel movement
         *
         * Parameters:
         * evt - {Event} the mouse wheel event object
         * deltaZ - {Integer} the number of ticks wheeled
         *
         * Return: none
         */
        doWheelChange: function(evt, deltaZ) {
            this.wheelTimer = null;
            if (this.cumulativeDelta == 0) {
                return;
            }
            var size    = this.oMapOL.getSize();
            var deltaX  = size.w/2 - evt.xy.x;
            var deltaY  = evt.xy.y - size.h/2;

            var deltaRes = this.cumulativeDelta > 0 ? 1/(this.cumulativeDelta+1) : Math.abs(this.cumulativeDelta)+1;
            var newRes  = this.oMapOL.baseLayer.getResolution() * deltaRes;
            var zoomPoint = this.oMapOL.getLonLatFromPixel(evt.xy);
            var newCenter = new OpenLayers.LonLat(
                                zoomPoint.lon + deltaX * newRes,
                                zoomPoint.lat + deltaY * newRes );
            var newBounds = new OpenLayers.Bounds(
                                newCenter.lon - size.w*newRes/2,
                                newCenter.lat - size.h*newRes/2,
                                newCenter.lon + size.w*newRes/2,
                                newCenter.lat + size.h*newRes/2);
            this.setExtents(newBounds);
        },

        /**
         * Method: wheelUp
         * User spun scroll wheel up
         *
         * Parameters:
         * evt - {Event}
         */
        wheelUp: function(evt) {
            this.wheelChange(evt, 1);
        },

        /**
         * Method: wheelDown
         * User spun scroll wheel down
         *
         * Parameters:
         * evt - {Event}
         */
        wheelDown: function(evt) {
            this.wheelChange(evt, -1);
        },
    });

    Map.Events = {
        ACTIVE_MAP_CHANGED: "fusion/map/mapchanged",
        LOADING: "fusion/map/loading",
        LOADED: "fusion/map/loaded"
    };

    return Map;
});