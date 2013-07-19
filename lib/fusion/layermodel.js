define([
    "dojo/_base/declare",
    "openlayers/OpenLayers",
    "dojo/Deferred",
    "dojo/promise/all"
], function() {
    var declare = arguments[0];
    var OpenLayers = arguments[1];
    var Deferred = arguments[2];
    var all = arguments[3];

    var LayerModel = declare(null, {
        id: null,
        oLayerOL: [],
        mapGroupTag: null,
        bInitialized: false,
        constructor: function(args) {
            this.id = args.id;
            this.oMapOL = args.map;
            this.mapGroupTag = args.mapGroupTag;
        },
        createMapGuideLayer: function(mapTag) {
            //var deferred = new Deferred();
            //return deferred.promise;
            return null;
        },
        createOLLayer: function(mapTag) {
            var type = mapTag.Type[0];
            if (type == "MapGuide") {
                return this.createMapGuideLayer(mapTag);
            } else {
                var opts = mapTag.Extension[0].Options[0];
                var dfd = null;
                switch(type) {
                    case "Google":
                        {
                            switch(opts.type[0])
                            {
                                case "G_PHYSICAL_MAP":
                                case "TERRAIN":
                                    {
                                        dfd = new Deferred();
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.TERRAIN }));
                                    }
                                    break;
                                case "G_HYBRID_MAP":
                                case "HYBRID":
                                    {
                                        dfd = new Deferred();
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.HYBRID }));
                                    }
                                case "G_SATELLITE_MAP":
                                case "SATELLITE":
                                    {
                                        dfd = new Deferred();
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.SATELLITE }));
                                    }
                                case "G_NORMAL_MAP":
                                case "ROADMAP":
                                default:
                                    {
                                        dfd = new Deferred();
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.ROADMAP }));
                                    }
                            }
                        }
                    case "VirtualEarth":
                        {

                        }
                    case "OpenStreetMap":
                    case "OSM":
                        {
                            dfd = new Deferred();
                            dfd.resolve(new OpenLayers.Layer.OSM());
                        }
                }
                if (dfd != null)
                    return dfd.promise;
                else
                    return null;
            }
        },
        loadLayers: function(callback) {
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
        dump: function(oMapOL) {

        },
        /**
         * Applies layers and states in this model to the given map
         */
        applyToMap: function(oMapOL) {
            for (var i = 0; i < this.oLayerOL.length; i++) {
                oMapOL.addLayer(this.oLayerOL[i]);
            }
            //TODO: Stub for now, but each layer model should probably keep track of their extents
            //both current and initial
            oMapOL.zoomToMaxExtent();
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