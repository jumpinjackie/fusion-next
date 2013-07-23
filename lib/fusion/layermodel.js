define([
    "dojo/_base/declare",
    "openlayers/OpenLayers",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/request",
    "dojo/store/Memory",
    "dijit/tree/ObjectStoreModel"
], function() {
    var declare = arguments[0];
    var OpenLayers = arguments[1];
    var Deferred = arguments[2];
    var all = arguments[3];
    var request = arguments[4];
    var Memory = arguments[5];
    var ObjectStoreModel = arguments[6];

    var NODE_TYPE_ROOT = "root";
    var NODE_TYPE_MAP = "map";
    var NODE_TYPE_LAYER_GROUP = "layergroup";
    var NODE_TYPE_LAYER = "layer";
    var NODE_TYPE_STYLE_RULE = "stylerule";

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
                try {
                    that.oMapGuideLayerData[resp.mapName] = {
                        map: resp,
                        scales: null
                    };
                    that.mapExtent.extend(new OpenLayers.Bounds(resp.extent[0], resp.extent[1], resp.extent[2], resp.extent[3]))
                    var params = {
                        mapname: resp.mapName,
                        session: resp.sessionId,
                        behavior: 2,
                    }
                    var options = {
                        alwaysInRange: true,
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
                    deferred.resolve(new OpenLayers.Layer.MapGuide("MapGuide - " + resp.title, Fusion.config.webtier.url, params, options));
                } catch (e) {
                    Fusion.reportError(e);   
                }
            }, function(error) {
                deferred.reject(error, true);
            })
            return deferred.promise;
        },
        extendMaxExtentToTheWorldSphericalMercator: function() {
            this.maxExtent.extend(new OpenLayers.Bounds(-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892));
        },
        createOLLayer: function(mapTag) {
            var type = mapTag.Type[0];
            if (type == "MapGuide") {
                return this.createMapGuideLayer(mapTag);
            } else {
                var opts = mapTag.Extension[0].Options[0];
                var dfd = null;
                switch(type) {
                    /*
                    case "Google": //This doesn't work ATM. We need a way to either load Google Maps as an AMD module or bring across the old script loading logic
                        {
                            switch(opts.type[0])
                            {
                                case "G_PHYSICAL_MAP":
                                case "TERRAIN":
                                    {
                                        dfd = new Deferred();
                                        this.extendMaxExtentToTheWorldSphericalMercator();
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.TERRAIN }));
                                    }
                                    break;
                                case "G_HYBRID_MAP":
                                case "HYBRID":
                                    {
                                        dfd = new Deferred();
                                        this.extendMaxExtentToTheWorldSphericalMercator();
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.HYBRID }));
                                    }
                                case "G_SATELLITE_MAP":
                                case "SATELLITE":
                                    {
                                        dfd = new Deferred();
                                        this.extendMaxExtentToTheWorldSphericalMercator();
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.SATELLITE }));
                                    }
                                case "G_NORMAL_MAP":
                                case "ROADMAP":
                                default:
                                    {
                                        dfd = new Deferred();
                                        this.extendMaxExtentToTheWorldSphericalMercator();
                                        dfd.resolve(new OpenLayers.Layer.Google(opts.name[0], { type: google.maps.MapTypeId.ROADMAP }));
                                    }
                            }
                        }
                    case "VirtualEarth": //Ditto
                        {
                            switch(opts.type[0])
                            {
                                case "Aerial":
                                case "a":
                                    {
                                        dfd = new Deferred();
                                        this.extendMaxExtentToTheWorldSphericalMercator();
                                        dfd.resolve(new OpenLayers.Layer.VirtualEarth(opts.name[0], { type: VEMapStyle.Aerial }));
                                    }
                                    break;
                                case "Shaded":
                                case "s":
                                    {
                                        dfd = new Deferred();
                                        this.extendMaxExtentToTheWorldSphericalMercator();
                                        dfd.resolve(new OpenLayers.Layer.VirtualEarth(opts.name[0], { type: VEMapStyle.Shaded }));
                                    }
                                    break;
                                case "Hybrid":
                                case "h":
                                    {
                                        dfd = new Deferred();
                                        this.extendMaxExtentToTheWorldSphericalMercator();
                                        dfd.resolve(new OpenLayers.Layer.VirtualEarth(opts.name[0], { type: VEMapStyle.Hybrid }));
                                    }
                                    break;
                                default:
                                    {
                                        dfd = new Deferred();
                                        this.extendMaxExtentToTheWorldSphericalMercator();
                                        dfd.resolve(new OpenLayers.Layer.VirtualEarth(opts.name[0], { type: VEMapStyle.Road }));
                                    }
                                    break;
                            }
                        }
                    */
                    case "OpenStreetMap":
                    case "OSM":
                        {
                            dfd = new Deferred();
                            this.extendMaxExtentToTheWorldSphericalMercator();
                            if (typeof(OpenLayers.Layer.OSM[opts.type[0]]) == 'undefined') {
                                console.warn("OSM subtype (" + opts.type[0] + ") is not defined. Was OpenStreetMap.js loaded successfully?");
                                dfd.resolve(new OpenLayers.Layer.OSM(opts.name[0], {
                                    tileOptions: {
                                        crossOriginKeyword: null
                                    }
                                }));
                            } else {
                                dfd.resolve(new OpenLayers.Layer.OSM[opts.type[0]](opts.name[0], {
                                    tileOptions: {
                                        crossOriginKeyword: null
                                    }
                                }));
                            }
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
            }, function(error) {
                Fusion.reportError(error);
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
        },
        constructMemoryStore: function() {
            var data = [];

            var mgMapCount = 0;
            for (var mapName in this.oMapGuideLayerData) {
                mgMapCount++;
            }

            var groupsById = {};

            //The old Fusion went to 50 bajillion different code paths due the various ways the layer structure
            //could be presented. We'll start with the basics first
            for (var mapName in this.oMapGuideLayerData) {
                var mapData = this.oMapGuideLayerData[mapName].map;
                var scales = this.oMapGuideLayerData[mapName].scales;

                //Map node
                data.push({ 
                    id: mapName, 
                    name: mapData.mapTitle, 
                    type: NODE_TYPE_MAP, 
                    mapdefinition: mapData.mapId,
                    getIconStyle: function(bExpanded) {
                        return {

                        }
                    },
                    getIconClass: function(bExpanded) {
                        return "fusion-icon fusion-legend-map";
                    }
                });

                //Groups
                for (var i = 0; i < mapData.groups.length; i++) {
                    var grp = mapData.groups[i];
                    groupsById[grp.uniqueId] = grp;
                    if (!grp.displayInLegend) {
                        continue;
                    }
                    data.push({
                        id: grp.uniqueId,
                        name: grp.legendLabel,
                        type: NODE_TYPE_LAYER_GROUP,
                        parent: (grp.parentUniqueId == "" ? mapName : grp.parentUniqueId),
                        visible: grp.visible,
                        getIconStyle: function(bExpanded) {
                            return {

                            }
                        },
                        getIconClass: function(bExpanded) {
                            return bExpanded ? "dijitFolderOpened" : "dijitFolderClosed";
                        }
                    });
                }

                //Layers
                for (var i = 0; i < mapData.layers.length; i++) {
                    var lyr = mapData.layers[i];
                    if (!lyr.displayInLegend) {
                        continue;
                    }
                    data.push({
                        id: lyr.uniqueId,
                        name: lyr.legendLabel,
                        type: NODE_TYPE_LAYER,
                        parent: (lyr.parentGroup == "" ? mapName : lyr.parentGroup),
                        minscale: parseInt(lyr.minScale),
                        maxscale: parseInt(lyr.maxScale),
                        layerdefinition: lyr.resourceId,
                        selectable: lyr.selectable,
                        visible: lyr.visible,
                        getIconStyle: function(bExpanded) {
                            return {

                            }
                        },
                        getIconClass: function(bExpanded) {
                            if (this.parent in scales) {
                                //var styles = scales.length;
                            }
                            return "";
                        }
                    });
                }
            }
            return new Memory({ 
                data: data, 
                getChildren: function(object){
                    return this.query({parent: object.id});
                } 
            });
        },
        /** 
         * Gets the object model that will be used to display in the legend tree
         */
        getObjectModel: function(callback) {
            if (this.objectModel) {
                callback(this.objectModel);
            } else {
                var that = this;

                //Need to wrap this request because we want to associate the AJAX result with the originating mapName
                //Thankfully promises allow for such composition
                var wrapRequest = function(mapName) {
                    var dfd = new Deferred();
                    request.post(Fusion.getServiceUrl("LoadScaleRanges"), {
                        handleAs: "json",
                        data: {
                            session: Fusion.sessionID,
                            mapname: mapName,
                            preCacheIcons: true
                        }
                    }).then(function(res) {
                        dfd.resolve({ mapName: mapName, result: res });
                    }, function(err) {
                        dfd.reject(err);
                    })
                    return dfd.promise;
                };

                var scaleRequests = [];
                for (var mapName in this.oMapGuideLayerData) {
                    if (this.oMapGuideLayerData[mapName].scales == null) {
                        scaleRequests.push(wrapRequest(mapName));
                    }
                }

                var initObjectModel = function(cb) {
                    // Create test store, adding the getChildren() method required by ObjectStoreModel
                    /*
                    var myStore = new Memory({
                        data: [
                            { id: 'world', name:'The earth', type:'planet', population: '6 billion'},
                            { id: 'AF', name:'Africa', type:'continent', population:'900 million', area: '30,221,532 sq km',
                                    timezone: '-1 UTC to +4 UTC', parent: 'world'},
                                { id: 'EG', name:'Egypt', type:'country', parent: 'AF' },
                                { id: 'KE', name:'Kenya', type:'country', parent: 'AF' },
                                    { id: 'Nairobi', name:'Nairobi', type:'city', parent: 'KE' },
                                    { id: 'Mombasa', name:'Mombasa', type:'city', parent: 'KE' },
                                { id: 'SD', name:'Sudan', type:'country', parent: 'AF' },
                                    { id: 'Khartoum', name:'Khartoum', type:'city', parent: 'SD' },
                            { id: 'AS', name:'Asia', type:'continent', parent: 'world' },
                                { id: 'CN', name:'China', type:'country', parent: 'AS' },
                                { id: 'IN', name:'India', type:'country', parent: 'AS' },
                                { id: 'RU', name:'Russia', type:'country', parent: 'AS' },
                                { id: 'MN', name:'Mongolia', type:'country', parent: 'AS' },
                            { id: 'OC', name:'Oceania', type:'continent', population:'21 million', parent: 'world'},
                            { id: 'EU', name:'Europe', type:'continent', parent: 'world' },
                                { id: 'DE', name:'Germany', type:'country', parent: 'EU' },
                                { id: 'FR', name:'France', type:'country', parent: 'EU' },
                                { id: 'ES', name:'Spain', type:'country', parent: 'EU' },
                                { id: 'IT', name:'Italy', type:'country', parent: 'EU' },
                            { id: 'NA', name:'North America', type:'continent', parent: 'world' },
                            { id: 'SA', name:'South America', type:'continent', parent: 'world' }
                        ],
                        getChildren: function(object){
                            return this.query({parent: object.id});
                        }
                    });
                    // Create the model
                    that.objectModel = new ObjectStoreModel({
                        store: myStore,
                        query: {id: 'world'}
                    });
                    */
                    that.objectModel = new ObjectStoreModel({
                        store: that.constructMemoryStore(),
                        query: {type: NODE_TYPE_MAP}
                    });
                    cb(that.objectModel);
                };

                if (scaleRequests.length > 0) {
                    all(scaleRequests).then(function(results) {
                        try {
                            for (var i = 0; i < results.length; i++) {
                                that.oMapGuideLayerData[results[i].mapName].scales = {};
                                var list = results[i].result.layers;
                                for (var j = 0; j < list.length; j++) {
                                    that.oMapGuideLayerData[results[i].mapName].scales[list[j].uniqueId] = list[j];
                                }
                            }
                            initObjectModel(callback);
                        } catch (e) {
                            Fusion.reportError(e);
                        }
                    }, function(err) {
                        Fusion.reportError(err);
                    });
                } else {
                    initObjectModel(callback);
                }
            }
        }
    });
    return LayerModel;
});