/**
 * The mapagent module provides the {@link mapagent} class for communicating with the MapGuide
 * web tier
 * @module fusion/mapagent
 */
define(["dojo/_base/declare", "dojo/_base/lang", "fusion/core", "dojo/request"], function() {
    var declare = arguments[0];
    var lang = arguments[1];
    var Fusion = arguments[2];
    var request = arguments[3];

    /**
     * The MapAgent class is a web service client to the MapGuide mapagent interface.
     *
     * The MapAgent class will never make requests for XML. All responses will be in JSON format.
     * @class MapAgent
     * @param {Object} args An object containing the following properties:
     * <ul>
     *   <li>url: The mapagent url</li>
     *   <li>locale: The locale</li>
     * </ul>
     */
    var MapAgent = declare(null, {
        url: null,
        locale: null,
        constructor: function(args) {
            this.url = args.url;
            this.locale = args.locale;
        },
        defaultErrorHandler: function(err) {
            Fusion.reportError(err);
        },
        getParams: function(params) {
            var p = params || {};
            p.SESSION = Fusion.sessionID;
            p.LOCALE = this.locale;
            p.FORMAT = "application/json";
            return p;
        },
        /**
         * Gets the version of the MapGuide Server that is serving the mapagent requests
         * @memberof MapAgent
         * @instance
         * @param {Function} done The callback that is invoked when the operation succeeds. The operation response will be passed to this callback
         * @param {Function} fail The callback that is invoked whe the operation fails. If none is specified, the default error handler is invoked
         */
        getSiteVersion: function(done, fail) {
            request.get(this.url, {
                query: this.getParams({
                    OPERATION: "GETSITEVERSION",
                    VERSION: "1.0.0"
                }),
                handleAs: "json"
            }).then(function() {
                try {
                    done.apply(this, arguments);
                } catch (e) {
                    Fusion.reportError(e);
                }
            }, (fail || this.defaultErrorHandler));
        },
        /**
         * Gets the resource content of the specified resource id in JSON format
         * @memberof MapAgent
         * @instance
         * @param {String} resId The resource id of the resource to fetch
         * @param {Function} done The callback that is invoked when the operation succeeds. The operation response will be passed to this callback
         * @param {Function} fail The callback that is invoked whe the operation fails. If none is specified, the default error handler is invoked
         */
        getResourceContent: function(resId, done, fail) {
            request.get(this.url, {
                query: this.getParams({
                    OPERATION: "GETRESOURCECONTENT",
                    VERSION: "1.0.0",
                    RESOURCEID: resId
                }),
                handleAs: "json"
            }).then(function() {
                try {
                    done.apply(this, arguments);
                } catch (e) {
                    Fusion.reportError(e);
                }
            }, (fail || this.defaultErrorHandler));
        }
    });
    return MapAgent;
})