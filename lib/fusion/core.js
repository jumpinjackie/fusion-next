define([
    "dojo/topic", 
    "dojo/io-query",
    "openlayers/OpenLayers", 
    "fusion/runtime",
    "fusion/mapagent",
    "dojo/request",
    "dojo/domReady!"
], function() {
    var topic           = arguments[0];
    var ioQuery         = arguments[1];
    var OpenLayers      = arguments[2];
    var Runtime         = arguments[3];
    var mapagent        = arguments[4];
    var request         = arguments[5];

    function _initLocale(locale) {
        console.log("Using locale: " + locale);
        Fusion.config.locale = locale;
    }

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
                        Fusion.runtime = new Runtime(o);
                        Fusion.runtime.initialize(done);
                    }, function(err) {
                        Fusion.reportError(err);
                    });
            } else {
                mapagent.getResourceContent(resId, function(o) {
                    Fusion.runtime = new Runtime(o);
                    Fusion.runtime.initialize(done);
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

    var Fusion = {
        Events: {
            FUSION_INITIALIZED: "fusion/core/init",
            FUSION_ERROR: "fusion/core/error"
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
                url: "../../../../mapagent/mapagent.fcgi",
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

            var uri = window.location.href;
            var qryString = uri.substring(uri.indexOf("?") + 1, uri.length);
            var qryObj = ioQuery.queryToObject(qryString);

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
            return require.baseUrl + "../../"; //TODO: Cleanup relative url
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
        }
    };
    return Fusion;
});