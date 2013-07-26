/**
 * <p>The Fusion core exports the {@link Fusion} namespace</p>
 * <p>Asynchronous access is required for the first time access. Subsequent module access can be done in a synchronous 
 * manner. Since the Fusion template will do most of the initialization (and access this module asynchronously
 * in the process). Any code executed afterwards can access this module in a synchronous manner. All code
 * examples shown here thus use the synchronous form of module access.</p>
 *
 * @example <caption>Accessing the Fusion module asynchrnously</caption>
 * require(["fusion/core"], function(Fusion) {
 *     //"Fusion" is now accessible   
 * });
 * @example <caption>Accessing the Fusion module synchronously</caption>
 * var Fusion = require("fusion/core");
 * @module fusion/core
 */
define([
    "dojo/topic",
    "openlayers/OpenLayers",
    "proj4js/proj4js",
    "fusion/runtime",
    "fusion/mapagent",
    "dojo/request",
    "urijs/URI",
    //exports allows for Fusion to be used in AMD contexts where there are circular references, otherwise
    //any dependency here that pulls in Fusion will either be undefined or a blank object
    "exports",
    "dojo/domReady!"
], function() {
    
    var topic           = arguments[0];
    var OpenLayers      = arguments[1];
    var Proj4js         = arguments[2];
    var Runtime         = arguments[3];
    var mapagent        = arguments[4];
    var request         = arguments[5];
    var URI             = arguments[6];
    
    //HACK: Yes, we're doing the antithesis of AMD, but window scoped OpenLayers/Proj4js is needed for dynamically loading OpenStreetMap.js
    //and for OL to detect Proj4js
    if (typeof(window.OpenLayers) == 'undefined')
        window.OpenLayers = OpenLayers;
    if (typeof(window.Proj4js) == 'undefined')
        window.Proj4js = Proj4js;

    var _aMeterPerUnit = [1.0, /* 0 - UNKNOWN */
                        0.0254, /* 1 - INCHES */
                        0.3048, /* 2 - FEET */
                        0.9144, /* 3 - YARDS */
                        1609.344, /* 4 - MILES */
                        1852, /* 5 - NAUTICAL MILES */
                        0.001, /* 6 - MILLIMETERS */
                        0.01, /* 7 - CENTIMETERS */
                        1.0, /* 8- METERS */
                        1000.0, /* 9 - KILOMETERS */
                        111061.75033, /* 10 - DEGREES */
                        111061.75033, /* 11 - DECIMALDEGREES */
                        111061.75033, /* 12 - DMS */
                        1.0 /* 13 - PIXELS */];

    var _aUnitPerMeter = [1.0, /* 0 - UNKNOWN */
                        39.37, /* 1 - INCHES */
                        3.2808, /* 2 - FEET */
                        1.0936133, /* 3 - YARDS */
                        0.00062137, /* 4 - MILES */
                        0.000539956803, /* 5 - NAUTICAL MILES */
                        1000.0, /* 6 - MILLIMETERS */
                        100.0, /* 7 - CENTIMETERS */
                        1.0, /* 8- METERS */
                        0.001, /* 9 - KILOMETERS */
                        0.000009044, /* 10 - DEGREES */
                        0.000009044, /* 11 - DECIMALDEGREES */
                        0.000009044, /* 12 - DMS */
                        1.0 /* 13 - PIXELS */];

    // the units names spelled out fully
    var _aUnitNames = ['Unknown','Inches', 'Feet', 'Yards', 'Miles', 'Nautical Miles',
                       'Millimeters', 'Centimeters', 'Meters', 'Kilometers', 
                       'Degrees', 'Decimal Degrees', 'Degrees Minutes Seconds', 'Pixels'];
                 
    // unit names abbreviations
    var _aUnitAbbr = ['unk', 'in', 'ft', 'yd', 'mi', 'nm', 
                      'mm', 'cm', 'm', 'km', 
                      '&deg;', '&deg;', '&deg;', 'px'];

    var _runtime = null;

    //NOTE: The verbosity of these JSDoc tags is either due to my inexperience with JSDoc or JSDoc's intransigence
    //Either way, these tags are whats required to get JSDoc to put the relevant documentation in the correct places

    /**
     * Fusion is the top level namespace that provides access to the Fusion core module {@link module:fusion/core}
     *
     * @example
     * var Fusion = require("fusion/core")
     *
     * @namespace Fusion
     * @name Fusion
     */
    var Fusion          = arguments[7];

    function _initLocale(locale) {
        console.log("Using locale: " + locale);
        Fusion.config.locale = locale;
    }

    //TODO: Support variant with direct JSON appdef passed in

    function _initRuntime(appDefId, done) {
        console.log("Init fusion runtime: " + appDefId);

        var agent = new mapagent({ 
            url: Fusion.config.webtier.url, 
            locale: Fusion.config.locale 
        });

        var fetchAndInitAppDef = function(resId) {
            try {
                if (resId == null) {
                    //Fetch the ApplicationDefinition.json from the template dir
                    request.get("ApplicationDefinition.json", { handleAs: "json"})
                        .then(function(o) {
                            try {
                                _runtime = new Runtime(o);
                                _runtime.initialize(done);
                            }
                            catch (e) {
                                Fusion.reportError(e);   
                            }
                        }, function(err) {
                            Fusion.reportError(err);
                        });
                } else {
                    agent.getResourceContent(resId, function(o) {
                        _runtime = new Runtime(o);
                        _runtime.initialize(done);
                    });
                }
            } catch (e) {
                Fusion.reportError(e);
            }
        };

        if (Fusion.config.serverVersion == null) {
            agent.getSiteVersion(function(ver) {
                console.log("Site Version: " + ver);
                _setSiteVersion(ver);
                fetchAndInitAppDef(appDefId);
            });
        } else {
            fetchAndInitAppDef(appDefId);
        }
    }

    function _setSiteVersion(ver) {
        Fusion.config.serverVersion = {
            major: ver[0],
            minor: ver[1],
            point: ver[2],
            revision: ver[3]
        }
        console.log("MapGuide Server Version: " + ver[0] + "." + ver[1] + "." + ver[2] + "." + ver[3]);
    }

    function _makeUrlAbsolute(relUrl) {
        var uri = new URI(relUrl);
        return uri.absoluteTo(URI(window.location.href).search(""));
    }

    /**
     * @namespace Fusion.Events
     */
    Fusion.Events = {
        /**
         * Raised when Fusion and all widget UIs have been initialized
         * @memberof Fusion.Events
         * @constant
         */
        FUSION_INITIALIZED: "fusion/core/init",
        /**
         * Raised when an error has occured
         * @memberof Fusion.Events
         * @constant
         */
        FUSION_ERROR: "fusion/core/error"
    };
    /**
     * Mutually exclusive widget groups
     * @namespace Fusion.MutexWidgetSets
     */
    Fusion.MutexWidgetSets = {
        /**
         * Widget group for map navigation/interaction controls
         * @memberof Fusion.MutexWidgetSets
         * @constant
         */
        MAP_CONTROLS: "MAP_CONTROLS"
    };
    /**
     * Units of measure
     * @namespace Fusion.Unit
     */
    Fusion.Unit = {
        /**
         * An unknown unit
         * @memberof Fusion.Unit
         * @constant
         */
        UNKNOWN: 0,
        /**
         * Inch unit
         * @memberof Fusion.Unit
         * @constant
         */
        INCHES: 1,
        /**
         * Feet unit
         * @memberof Fusion.Unit
         * @constant
         */
        FEET: 2,
        /**
         * Yard unit
         * @memberof Fusion.Unit
         * @constant
         */
        YARDS: 3,
        /**
         * Mile unit
         * @memberof Fusion.Unit
         * @constant
         */
        MILES: 4,
        /**
         * Nautical Mile unit
         * @memberof Fusion.Unit
         * @constant
         */
        NAUTICALMILES: 5,
        /**
         * Millimeter unit
         * @memberof Fusion.Unit
         * @constant
         */
        MILLIMETERS: 6,
        /**
         * Centimeter unit
         * @memberof Fusion.Unit
         * @constant
         */
        CENTIMETERS: 7,
        /**
         * Meter unit
         * @memberof Fusion.Unit
         * @constant
         */
        METERS: 8,
        /**
         * Kilometer unit
         * @memberof Fusion.Unit
         * @constant
         */
        KILOMETERS: 9,
        /**
         * Degree unit
         * @memberof Fusion.Unit
         * @constant
         */
        DEGREES: 10,
        /**
         * Decimal Degree unit
         * @memberof Fusion.Unit
         * @constant
         */
        DECIMALDEGREES: 11,
        /**
         * DMS unit
         * @memberof Fusion.Unit
         * @constant
         */
        DMS: 12,
        /**
         * Pixel unit
         * @memberof Fusion.Unit
         * @constant
         */
        PIXELS: 13
    };
    /**
     * The MapGuide session ID
     * @memberof Fusion
     * @readonly
     * @static
     */
    Fusion.sessionID = null;
    /**
     * The Fusion configuration
     * @namespace Fusion.config
     */
    Fusion.config = {
        /**
         * The current locale
         * @memberof Fusion.config
         * @readonly
         */
        locale: "en",
        /**
         * The MapGuide Server version
         * @memberof Fusion.config
         * @readonly
         */
        serverVersion: null,
        /**
         * The Web Tier component of the Fusion configuration
         * @namespace Fusion.config.webtier
         */
        webtier: {
            /**
             * The mapagent url
             * @memberof Fusion.config.webtier
             * @readonly
             */
            url: null,
            /**
             * The web tier technology platform. Used to resolve paths to supporting server-side scripts
             * @memberof Fusion.config.webtier
             * @readonly
             */
            platform: "php",
            /**
             * The file extension for server-side scripts. Used to resolve paths to supporting server-side scripts
             * @memberof Fusion.config.webtier
             * @readonly
             */
            scriptExtension: "php"
        }
    };
    /** 
     * Initializes the Fusion framework. When initialization is complete, it will broadcast the
     * FUSION_INITIALIZED event. Parties that are interested in this event should subscribe to it
     * via the dojo.topic class
     * @param {Object} o The options for initialization
     * @memberof Fusion
     */
    Fusion.initialize = function(options) {

        if (typeof(options) != 'undefined') {
            if ("siteVersion" in options) {
                var ver = options.siteVersion.split(".");
                if (ver.length == 4) {
                    _setSiteVersion(ver);
                } else {
                    Fusion.reportError(new Error("Bad site version. Expected form: major.minor.point.revision, got: " + options.siteVersion));
                    return;
                }
            }
        }

        var agentUri = new URI(Fusion.getRootPath() + "../mapagent/mapagent.fcgi");
        this.config.webtier.url = agentUri.normalize().toString();

        console.log("==== URL Summary ====");
        console.log("Root: " + Fusion.getRootPath());
        console.log("Lib: " + Fusion.getLibPath());
        console.log("Base: " + Fusion.getBasePath());
        console.log("Widget Base: " + Fusion.getWidgetBasePath());
        console.log("mapagent: " + this.config.webtier.url);

        var uri = window.location.href;
        var qryString = uri.substring(uri.indexOf("?") + 1, uri.length);
        var qryObj = URI.parseQuery(qryString);

        var locale = null;
        var sessionId = null;
        var appDefId = null;
        //Let's see what we have
        if ("ApplicationDefinition" in qryObj) {
            appDefId = qryObj.ApplicationDefinition;
        }
        if ("Session" in qryObj) {
            sessionId = qryObj.Session;
        }
        if ("locale" in qryObj) {
            locale = qryObj.locale;
        }

        //Initialize locale
        if (locale == null)
            locale = "en";
        
        _initLocale(locale);

        if (sessionId == null) {
            var url = Fusion.getServiceUrl("CreateSession");
            request.post(url, {
                handleAs: "json"
            }).then(function(resp) {
                Fusion.sessionID = resp.sessionId;
                //TODO: Try to update url with session id
                var ver = resp.siteVersion.split(".");
                if (ver.length != 4) {
                    Fusion.reportError(new Error("Bad site version. Expected form: major.minor.point.revision, got: " + resp.siteVersion));
                    return;
                } else {
                    _setSiteVersion(ver);
                    _initRuntime(appDefId, function() {
                        topic.publish(Fusion.Events.FUSION_INITIALIZED);
                    });
                }
            }, function(error) {
                Fusion.reportError(error);
            })
        } else {
            _initRuntime(appDefId, function() {
                topic.publish(Fusion.Events.FUSION_INITIALIZED);
            });
        }
    };
    /**
     * Returns the map widget for this application. See {@link Map}
     * @memberof Fusion
     * @return the map widget for this application
     * @example
     * var Fusion = require("fusion/core");
     * var mapWidget = Fusion.getMap();
     */
    Fusion.getMap = function() {
        return _runtime.getMapByIndice(0);
    }
    /**
     * Registers a modal widget to a mutually exclusive set. Internal use for widget developers only
     * @ignore
     */
    Fusion.registerMutexWidget = function(setName, widget) {
        _runtime.registerMutexWidget(setName, widget);
    };
    /**
     * Gets the absolute url which represents the root of the fusion directory
     * @memberof Fusion
     * @example
     * var Fusion = require("fusion/core");
     * //Given that fusion is at http://servername/mapguide/fusion
     * //returns http://servername/mapguide/fusion/
     * var url = Fusion.getRootPath(); 
     */
    Fusion.getRootPath = function() {
        return _makeUrlAbsolute(require.baseUrl + "../../");
    };
    /**
     * Gets the absolute url which represents the root of fusion's assets
     * @memberof Fusion
     * @return the absolute url which represents the root of fusion's assets
     * @example
     * var Fusion = require("fusion/core");
     * //Given that fusion is at http://servername/mapguide/fusion
     * //returns http://servername/mapguide/fusion/assets/
     * var url = Fusion.getAssetPath();
     */
    Fusion.getAssetPath = function() {
        return this.getRootPath() + "assets/";
    };
    /**
     * Resolves the absolute url for a given widget asset
     * @memberof Fusion
     * @param {String} widgetName the name of the Fusion widget
     * @param {String} fileName the name of the widget asset
     * @return the absolute url for a given widget asset
     * @example
     * var Fusion = require("fusion/core");
     * //Given that fusion is at http://servername/mapguide/fusion
     * //returns http://servername/mapguide/fusion/assets/widgets/Navigator/navigator.css
     * var url = Fusion.getAssetPathForWidget("Navigator", "navigator.css");
     */
    Fusion.getAssetPathForWidget = function(widgetName, fileName) {
        return this.getAssetPath() + "widgets/" + widgetName + "/" + fileName;
    };
    /**
     * Gets the absolute url which represents the root of all libraries used by Fusion (including Fusion itself)
     * @memberof Fusion
     * @return the absolute url which represents the root of all libraries used by Fusion (including Fusion itself)
     * @example
     * var Fusion = require("fusion/core");
     * //Given that fusion is at http://servername/mapguide/fusion
     * //returns http://servername/mapguide/fusion/lib/
     * var url = Fusion.getLibPath();
     */
    Fusion.getLibPath = function() {
        return this.getRootPath() + "lib/";
    };
    /**
     * Gets the absolute url which represents the root of Fusion's libraries
     * @memberof Fusion
     * @return the absolute url which represents the root of Fusion's libraries
     * @example
     * var Fusion = require("fusion/core");
     * //Given that fusion is at http://servername/mapguide/fusion
     * //returns http://servername/mapguide/fusion/lib/fusion/
     * var url = Fusion.getBasePath();
     */
    Fusion.getBasePath = function() {
        return this.getLibPath() + "fusion/";
    };
    /**
     * Gets the absolute url which represents the root of Fusion's widgets
     * @memberof Fusion
     * @return the absolute url which represents the root of Fusion's widgets
     * @example
     * var Fusion = require("fusion/core");
     * //Given that fusion is at http://servername/mapguide/fusion
     * //returns http://servername/mapguide/fusion/lib/widgets/
     * var url = Fusion.getWidgetBasePath();
     */
    Fusion.getWidgetBasePath = function() {
        return this.getLibPath() + "widgets/";
    };
    /**
     * Resolves the absolute url for a given web service script
     * @memberof Fusion
     * @param {String} serviceScriptName The web service script name (without file extension)
     * @return the absolute url for a given web service script
     * @example
     * var Fusion = require("fusion/core");
     * //Given that fusion is at http://servername/mapguide/fusion
     * //and Fusion.config.webtier.platform == "php"
     * //and Fusion.config.webtier.scriptExtension == "php"
     * //returns http://servername/mapguide/fusion/svc/MapGuide/php/LoadMap.php
     * var url = Fusion.getServiceUrl("LoadMap");
     */
    Fusion.getServiceUrl = function(serviceScriptName) {
        return this.getRootPath() + "svc/MapGuide/" + Fusion.config.webtier.platform + "/" + serviceScriptName + "." + Fusion.config.webtier.scriptExtension;
    };
    /**
     * Triggers the FUSION_ERROR event with the given error
     * @memberof Fusion
     * @param {Error} e the error to trigger the event
     * @example
     * var Fusion = require("fusion/core");
     * Fusion.reportError(new Error("Something went wrong!"));
     */
    Fusion.reportError = function(e) {
        topic.publish(Fusion.Events.FUSION_ERROR, e);
    };
    /**
     *
     * initializes the meters per unit values when a new map is loaded.  
     * Some systems make different assumptions for the conversion of degrees
     * to meters so this makes sure both Fusion and OpenLayers are using 
     * the same value.
     *
     * @ignore
     * @memberof Fusion
     * @param {Float} metersPerUnit the value returned by LoadMap.php for meters per unit
     */
    Fusion.initUnits = function(metersPerUnit) {
        var eps = 1000;
        if (Math.abs(metersPerUnit-_aMeterPerUnit[Fusion.Unit.DEGREES]) < eps){
            _aMeterPerUnit[Fusion.Unit.DEGREES] = metersPerUnit;
            _aMeterPerUnit[Fusion.Unit.DECIMALDEGREES] = metersPerUnit;
            _aMeterPerUnit[Fusion.Unit.DMX] = metersPerUnit;
            var inverse = 1.0/metersPerUnit;
            _aUnitPerMeter[Fusion.Unit.DEGREES] = inverse;
            _aUnitPerMeter[Fusion.Unit.DECIMALDEGREES] = inverse;
            _aUnitPerMeter[Fusion.Unit.DMX] = inverse;
        
            var inPerUnit = OpenLayers.INCHES_PER_UNIT.m * metersPerUnit;
            OpenLayers.INCHES_PER_UNIT["dd"] = inPerUnit;
            OpenLayers.INCHES_PER_UNIT["degrees"] = inPerUnit;
            OpenLayers.INCHES_PER_UNIT["Degree"] = inPerUnit;
        }
    };
    /**
     * returns index into the units array for the given unit name or 
     * abbreviation
     *
     * @memberof Fusion
     * @param {String} unit the units name to look up
     * @return {Integer} the symbolic unit type. See: {@link Fusion.Unit}
     */
    Fusion.unitFromName = function(unit) {
        switch(unit.toLowerCase()) {
            case 'unknown':
                return Fusion.Unit.UNKNOWN;
            case 'inches':
            case 'inch':
            case 'in':
                return Fusion.Unit.INCHES;
            case 'feet':
            case 'ft':
                return Fusion.Unit.FEET;
            case 'yards':
            case 'yard':
            case 'yd':
                return Fusion.Unit.YARDS;
            case 'miles':
            case 'mile':
            case 'mi':
                return Fusion.Unit.MILES;
            case 'nautical miles':
            case 'nautical mile':
            case 'nm':
                return Fusion.Unit.NAUTICALMILES;
            case 'millimeters':
            case 'millimeter':
            case 'mm':
                return Fusion.Unit.MILLIMETERS;
            case 'centimeters':
            case 'centimeter':
            case 'cm':
                return Fusion.Unit.CENTIMETERS;
            case 'meters':
            case 'meter':
            case 'm':
                return Fusion.Unit.METERS;
            case 'kilometers':
            case 'kilometer':
            case 'km':
                return Fusion.Unit.KILOMETERS;
            case 'degrees':
            case 'degree':
            case 'deg':
                return Fusion.Unit.DEGREES;
            case 'decimal degrees':
            case 'dd':
                return Fusion.Unit.DECIMALDEGREES;
            case 'degrees minutes seconds':
            case 'dms':
                return Fusion.Unit.DMS;
            case 'pixels':
            case 'pixel':
            case 'px':
                return Fusion.Unit.PIXELS;
            default:
                return Fusion.Unit.UNKNOWN;
        }
    };
    
    /**
     * Given a unit, this method returns if the units system is one of:
     * imperial, metric, degrees or device units
     *
     * @memberof Fusion
     * @param {Integer} unit the symbolic unit type. See: {@link Fusion.Unit}
     * @return {String} the units system
     */
    Fusion.unitSystem = function(unit) {
        switch(unit) {

            case Fusion.Unit.INCHES:
            case Fusion.Unit.FEET:
            case Fusion.Unit.YARDS:
            case Fusion.Unit.MILES:
            case Fusion.Unit.NAUTICALMILES:
                return 'imperial';
            case Fusion.Unit.MILLIMETERS:
            case Fusion.Unit.CENTIMETERS:
            case Fusion.Unit.METERS:
            case Fusion.Unit.KILOMETERS:
                return 'metric';
            case Fusion.Unit.DEGREES:
            case Fusion.Unit.DECIMALDEGREES:
            case Fusion.Unit.DMS:
                return 'deg';
            case Fusion.Unit.UNKNOWN:
            case Fusion.Unit.PIXELS:
            default:
                return 'device';
        }
    };

    /**
     * Given a unit, this method returns the units name
     *
     * @memberof Fusion
     * @param {Integer} unit the symbolic unit type. See: {@link Fusion.Unit}
     * @return {String} the units name
     */
    Fusion.unitName = function(unit) {
        if (unit >= Fusion.Unit.UNKNOWN && unit <= Fusion.Unit.PIXELS) {
          return (_aUnitNames[unit]);
        }
        return 'Unknown';
    };
    
    /**
     * Given a unit, this method returns the units abbreviation
     *
     * @memberof Fusion
     * @param {Integer} unit the symbolic unit type. See: {@link Fusion.Unit}
     * @return {String} the units abbreviation
     */
    Fusion.unitAbbr = function(unit) {
        if (unit >= Fusion.Unit.UNKNOWN && unit <= Fusion.Unit.PIXELS) {
          return (_aUnitAbbr[unit]);
        }
        return 'Unk';
    };

    /**
     * Converts a length value from native units into meters.  This is the
     * identity transform if the input units are meters
     *
     * @memberof Fusion
     * @param {Integer} unit the symbolic unit type. See: {@link Fusion.Unit}
     * @param {Float} value the value to be converted
     * @return {Float} the value in meters
     */
    Fusion.toMeter = function(unit, value) {
        if (unit == Fusion.Unit.UNKNOWN) {
            return value;
        }
        if (unit > Fusion.Unit.UNKNOWN && unit < Fusion.Unit.PIXELS) {
          return (_aMeterPerUnit[unit] * value);
        }
        return false;
    };

    /**
     * Converts a length value from meters into native units.  This is the
     * identity transform if the native units are meters
     *
     * @memberof Fusion
     * @param {Integer} unit the symbolic unit type. See: {@link Fusion.Unit}
     * @param {Float} value the value to be converted
     * @return {Float} the value in native units
     */
    Fusion.fromMeter = function(unit, value) {
        if (unit == Fusion.Unit.UNKNOWN) {
            return value;
        }
        if (unit > Fusion.Unit.UNKNOWN && unit < Fusion.Unit.PIXELS) {
            return (_aUnitPerMeter[unit] * value);
        }
        return false;
    };

    /**
     * Converts a length value from one unit system into another.
     *
     * @memberof Fusion
     * @param {Integer} unitsIn the symbolic unit type. See: {@link Fusion.Unit}
     * @param {Integer} unitsOut the symbolic unit type. See: {@link Fusion.Unit}
     * @param {Float} value the value to be converted
     * @return {Float} the value in output units
     */
    Fusion.convert = function(unitsIn, unitsOut, value) {
        if (unitsIn >= Fusion.Unit.UNKNOWN && unitsIn < Fusion.Unit.PIXELS && 
            unitsOut >= Fusion.Unit.UNKNOWN && unitsOut < Fusion.Unit.PIXELS) {
            return Fusion.fromMeter(unitsOut, Fusion.toMeter(unitsIn, value));
        }
        return false;
    };
});