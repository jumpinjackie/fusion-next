define([
    "dojo/_base/declare",
    "openlayers/OpenLayers",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/request"
], function() {
    var declare = arguments[0];
    var OpenLayers = arguments[1];
    var Deferred = arguments[2];
    var all = arguments[3];
    var request = arguments[4];

    //We can't require this because we're initializing these objects as the Fusion
    //object itself is still initializing.
    var Fusion = null;

    var LayerModel = declare(null, {
        id: null,
        oLayerOL: [],
        oMapGuideLayerData: {},
        mapGroupTag: null,
        bInitialized: false,
        mapExtent: null,
        maxExtent: null,
        constructor: function(args) {
            this.id = args.id;
            this.oMapOL = args.map;
            this.mapGroupTag = args.mapGroupTag;
            this.mapExtent = new OpenLayers.Bounds();
            this.maxExtent = new OpenLayers.Bounds();
        },
        createMapGuideLayer: function(mapTag) {
            var deferred = new Deferred();
            var url = Fusion.getServiceUrl("LoadMap");
            var that = this;
            request.post(url, {
                handleAs: "json",
                data: {
                    session: Fusion.sessionID,
                    mapid: mapTag.Extension[0].ResourceId[0]
                }
            }).then(function(resp) {
                that.oMapGuideLayerData[resp.mapName] = resp;
                that.mapExtent.extend(new OpenLayers.Bounds(resp.extent[0], resp.extent[1], resp.extent[2], resp.extent[3]))
                var params = {
                    mapname: resp.mapName,
                    session: resp.sessionId,
                    behavior: 2,
                }
                var options = {
                    maxResolution: "auto",
                    useOverlay: true,
                    useAsyncOverlay: true,
                    transitionEffect: "resize"
                };
                if (resp.hasDynamicLayers)
                    options.singleTile = true;
                for (var key in mapTag.Extension[0].Options[0]) {
                    options[key] = mapTag.Extension[0].Options[0][key][0];
                }
                var url = Fusion.config.webtier.url;
                deferred.resolve(new OpenLayers.Layer.MapGuide("MapGuide - " + resp.title, url, params, options));
            }, function(error) {
                deferred.reject(error, true);
            })
            return deferred.promise;
        },
        createOLLayer: function(mapTag) {
            var type = mapTag.Type[0];
            if (type == "MapGuide") {
                return this.createMapGuideLayer(mapTag);
            } else {
                var opts = mapTag.Extension[0].Options[0];
                var dfd = null;
                switch(type) {
                    case "Google": //This doesn't work ATM. We need a way to either load Google Maps as an AMD module or bring across the old script loading logic
                        {
                            switch(opts.type[0])
                            {
                                case "G_PHYSICAL_MAP":
                                case "TERRAIN":
                                    {
                                        dfd = new Deferred();
                                        this.maxExtent.extend(new OpenLayers.Bounds(-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892));
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.TERRAIN }));
                                    }
                                    break;
                                case "G_HYBRID_MAP":
                                case "HYBRID":
                                    {
                                        dfd = new Deferred();
                                        this.maxExtent.extend(new OpenLayers.Bounds(-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892));
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.HYBRID }));
                                    }
                                case "G_SATELLITE_MAP":
                                case "SATELLITE":
                                    {
                                        dfd = new Deferred();
                                        this.maxExtent.extend(new OpenLayers.Bounds(-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892));
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.SATELLITE }));
                                    }
                                case "G_NORMAL_MAP":
                                case "ROADMAP":
                                default:
                                    {
                                        dfd = new Deferred();
                                        this.maxExtent.extend(new OpenLayers.Bounds(-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892));
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.ROADMAP }));
                                    }
                            }
                        }
                    case "VirtualEarth": //Ditto
                        {

                        }
                    case "OpenStreetMap":
                    case "OSM":
                        {
                            dfd = new Deferred();
                            this.maxExtent.extend(new OpenLayers.Bounds(-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892));
                            dfd.resolve(new OpenLayers.Layer.OSM());
                        }
                }
                if (dfd != null)
                    return dfd.promise;
                else
                    return null;
            }
        },
        loadLayers: function(fusionInst, callback) {
            Fusion = fusionInst;
            var promises = [];
            for (var i = 0; i < this.mapGroupTag.Map.length; i++) {
                var mapEl = this.mapGroupTag.Map[i];
                var promise = this.createOLLayer(mapEl);
                if (promise != null)
                    promises.push(promise);
            }
            var that = this;
            all(promises).then(function(results) {
                for (var j = 0; j < results.length; j++) {
                    that.oLayerOL.push(results[j]);
                }
                that.bInitialized = true;
                callback();
            });
        },
        /**
         * Saves any necessary state of the given map to this model. Usually invoked before a map switch
         */
        dump: function(mapWidget) {

        },
        /**
         * Applies layers and states in this model to the given map
         */
        applyToMap: function(mapWidget) {
            var oMapOL = mapWidget.oMapOL;
            var mgLayer = null;
            for (var i = 0; i < this.oLayerOL.length; i++) {
                if (this.oLayerOL[i].CLASS_NAME == "OpenLayers.Layer.MapGuide") {
                    mgLayer = this.oLayerOL[i];
                    mgLayer.isBaseLayer = false;
                    oMapOL.addLayer(this.oLayerOL[i]);
                } else {
                    oMapOL.setBaseLayer(this.oLayerOL[i]);
                    oMapOL.addLayer(this.oLayerOL[i]);
                }
            }
            if (mgLayer != null) {
                var data = this.oMapGuideLayerData[mgLayer.params.mapname];
                OpenLayers.DOTS_PER_INCH = 96; //Will this ever be different?
                Fusion.initUnits(data.metersPerUnit);
                mapWidget.setMetersPerUnit(data.metersPerUnit);
                oMapOL.setOptions({ projection: mgLayer.projection });
            }
            oMapOL.setOptions({ maxExtent: this.mapExtent });
            mapWidget.setExtents(this.mapExtent);
        },
        /** 
         * Updates the timestamp params of any relevant OL layers to prevent caching
         */
        updateLayerTimestamps: function() {
            for (var i=0; i<this.oLayerOL.length; i++ ) {
                if (this.oLayerOL[i].params && this.oLayerOL[i].noCache) {
                    this.oLayerOL[i].params.ts = (new Date()).getTime();
                }
            }
        }
    });
    return LayerModel;
});