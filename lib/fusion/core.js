define([
    "dojo/topic", 
    "dojo/io-query",
    "openlayers/OpenLayers", 
    "fusion/runtime",
    "fusion/mapagent",
    "dojo/request",
    "urijs/URI",
    "dojo/domReady!"
], function() {
    var topic           = arguments[0];
    var ioQuery         = arguments[1];
    var OpenLayers      = arguments[2];
    var Runtime         = arguments[3];
    var mapagent        = arguments[4];
    var request         = arguments[5];
    var URI             = arguments[6];

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

    /** 
    * the units names spelled out fully
    */
    var _aUnitNames = ['Unknown','Inches', 'Feet', 'Yards', 'Miles', 'Nautical Miles',
                       'Millimeters', 'Centimeters', 'Meters', 'Kilometers', 
                       'Degrees', 'Decimal Degrees', 'Degrees Minutes Seconds', 'Pixels'];
                 
    /** 
    * unit names abbreviations
    */
    var _aUnitAbbr = ['unk', 'in', 'ft', 'yd', 'mi', 'nm', 
                      'mm', 'cm', 'm', 'km', 
                      '&deg;', '&deg;', '&deg;', 'px'];

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
            if (resId == null) {
                //Fetch the ApplicationDefinition.json from the template dir
                request.get("ApplicationDefinition.json", { handleAs: "json"})
                    .then(function(o) {
                        try {
                            Fusion.runtime = new Runtime(o);
                            Fusion.runtime.initialize(Fusion, done);
                        }
                        catch (e) {
                            Fusion.reportError(e);   
                        }
                    }, function(err) {
                        Fusion.reportError(err);
                    });
            } else {
                mapagent.getResourceContent(resId, function(o) {
                    Fusion.runtime = new Runtime(o);
                    Fusion.runtime.initialize(Fusion, done);
                });
            }
        };

        if (Fusion.config.serverVersion == null) {
            mapagent.getSiteVersion(function(ver) {
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
        return uri.absoluteTo(window.location.href);
    }

    var Fusion = {
        Events: {
            FUSION_INITIALIZED: "fusion/core/init",
            FUSION_ERROR: "fusion/core/error"
        },
        MutexWidgetSets: {
            MAP_CONTROLS: "MAP_CONTROLS"
        },
        Unit: {
            /**
             * Constant: UNKNOWN
             * 
             * An unknown unit
             */
            UNKNOWN: 0,
            /**
             * Constant: INCHES
             * 
             * Inch unit
             */
            INCHES: 1,
            /**
             * Constant: FEET
             * 
             * Feet unit
             */
            FEET: 2,
            /**
             * Constant: YARDS
             * 
             * Yard unit
             */
            YARDS: 3,
            /**
             * Constant: MILES
             * 
             * Mile unit
             */
            MILES: 4,
            /**
             * Constant: NAUTICALMILES
             * 
             * Nautical Mile unit
             */
            NAUTICALMILES: 5,
            /**
             * Constant: MILLIMETERS
             * 
             * Millimeter unit
             */
            MILLIMETERS: 6,
            /**
             * Constant: CENTIMETERS
             * 
             * Centimeter unit
             */
            CENTIMETERS: 7,
            /**
             * Constant: METERS
             * 
             * Meter unit
             */
            METERS: 8,
            /**
             * Constant: KILOMETERS
             * 
             * Kilometer unit
             */
            KILOMETERS: 9,
            /**
             * Constant: DEGREES
             * 
             * Degree unit
             */
            DEGREES: 10,
            /**
             * Constant: DECIMALDEGREES
             * 
             * Decimal Degree unit
             */
            DECIMALDEGREES: 11,
            /**
             * Constant: DMS
             * 
             * DMS unit
             */
            DMS: 12,
            /**
             * Constant: PIXELS
             * 
             * Pixel unit
             */
            PIXELS: 13
        },
        sessionID: null,
        runtime: null,
        config: {
            locale: "en",
            serverVersion: null,
            /**
             * Specifies the web platform that Fusion will be communicating with
             */
            webtier: {
                url: null,
                platform: "php",
                scriptExtension: "php"
            },
        },
        /** 
         * Initializes the Fusion framework. When initialization is complete, it will broadcast the
         * FUSION_INITIALIZED event. Parties that are interested in this event should subscribe to it
         * via the dojo.topic class
         */
        initialize: function(options) {

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
        },
        getRootPath: function() {
            return _makeUrlAbsolute(require.baseUrl + "../../"); //TODO: Cleanup relative url
        },
        getLibPath: function() {
            return this.getRootPath() + "lib/" //TODO: Cleanup relative url
        },
        getBasePath: function() {
            return this.getLibPath() + "fusion/"; //TODO: Cleanup relative url
        },
        getWidgetBasePath: function() {
            return this.getLibPath() + "widgets/"; //TODO: Cleanup relative url
        },
        getServiceUrl: function(serviceScriptName) {
            //TODO: Cleanup relative url
            return this.getRootPath() + "svc/MapGuide/" + Fusion.config.webtier.platform + "/" + serviceScriptName + "." + Fusion.config.webtier.scriptExtension;
        },
        reportError: function(e) {
            topic.publish(Fusion.Events.FUSION_ERROR, e);
        },
        /**
         * Function: initUnits
         *
         * initializes the meters per unit values when a new map is loaded.  
         * Some systems make different assumptions for the conversion of degrees
         * to meters so this makes sure both Fusion and OpenLayers are using 
         * the same value.
         *
         * Parameters: 
         * metersPerUnit - {Float} the value returned by LoadMap.php
         *                 for meters per unit
         */
        initUnits: function(metersPerUnit) {
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
        },
        /**
         * Function: unitFromName
         *
         * returns index into the units array for the given unit name or 
         * abbreviation
         *
         * Parameters: 
         * unit - {String} the units name to look up
         *
         * Return: 
         * {Integer} index into the units array
         */
        unitFromName: function(unit) {
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
        },
        
        /**
         * Function: unitSystem
         *
         * Given a unit, this method returns if the units system is one of:
         * imperial, metric, degrees or device units
         *
         * Parameters: 
         * unit - {Integer} the units array index
         *
         * Return: 
         * {String} the units system
         */
        unitSystem: function(unit) {
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
        },
    
        /**
         * Function: unitName
         *
         * Given a unit, this method returns the units name
         *
         * Parameters: 
         * unit - {Integer} the units array index
         *
         * Return: 
         * {String} the units name
         */
        unitName: function(unit) {
            if (unit >= Fusion.Unit.UNKNOWN && unit <= Fusion.Unit.PIXELS) {
              return (_aUnitNames[unit]);
            }
            return 'Unknown';
        },
        
        /**
         * Function: unitAbbr
         *
         * Given a unit, this method returns the units abbreviation
         *
         * Parameters:
         * unit - {Integer} the units array index
         *
         * Return: 
         * {String} the units abbreviation
         */
        unitAbbr: function(unit) {
            if (unit >= Fusion.Unit.UNKNOWN && unit <= Fusion.Unit.PIXELS) {
              return (_aUnitAbbr[unit]);
            }
            return 'Unk';
        },

        /**
         * Function: toMeter
         *
         * Converts a length value from native units into meters.  This is the
         * identity transform if the input units are meters
         *
         * Parameters:
         * unit - {Integer} the units array index
         * value - {Float} the value to be converted
         *
         * Return: 
         * {Float} the value in meters
         */
        toMeter: function(unit, value) {
            if (unit == Fusion.Unit.UNKNOWN) {
                return value;
            }
            if (unit > Fusion.Unit.UNKNOWN && unit < Fusion.Unit.PIXELS) {
              return (_aMeterPerUnit[unit] * value);
            }
            return false;
        },

        /**
         * Function: fromMeter
         *
         * Converts a length value from meters into native units.  This is the
         * identity transform if the native units are meters
         *
         * Parameters:
         * unit - {Integer} the units array index
         * value - {Float} the value to be converted
         *
         * Return: 
         * {Float} the value in native units
         */
        fromMeter: function(unit, value) {
            if (unit == Fusion.Unit.UNKNOWN) {
                return value;
            }
            if (unit > Fusion.Unit.UNKNOWN && unit < Fusion.Unit.PIXELS) {
                return (_aUnitPerMeter[unit] * value);
            }
            return false;
        },

        /**
         * Function: convert
         *
         * Converts a length value from one unit system into another.
         *
         * Parameters:
         * unitsIn - {Integer} the units array index of the input
         * unitsOut - {Integer} the units array index of the output
         * value - {Float} the value to be converted
         *
         * Return: 
         * {Float} the value in output units
         */
        convert: function(unitsIn, unitsOut, value) {
            if (unitsIn >= Fusion.Unit.UNKNOWN && unitsIn < Fusion.Unit.PIXELS && 
                unitsOut >= Fusion.Unit.UNKNOWN && unitsOut < Fusion.Unit.PIXELS) {
                return Fusion.fromMeter(unitsOut, Fusion.toMeter(unitsIn, value));
            }
            return false;
        },
    };
    return Fusion;
});