define(["dojo/_base/declare", "dojo/_base/lang", "fusion/core", "dojo/request"], function() {
    var declare = arguments[0];
    var lang = arguments[1];
    var Fusion = arguments[2];
    var request = arguments[3];

    var mapagent = declare(null, {
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
    return mapagent;
})