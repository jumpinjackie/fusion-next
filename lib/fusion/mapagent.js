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
            return lang.extend(params, {
                SESSION: Fusion.sessionID,
                LOCALE: this.locale,
                FORMAT: "application/json"
            });
        },
        getSiteVersion: function(pass, fail) {
            request.get(this.url, {
                query: this.getParams({
                    OPERATION: "GETSITEVERSION",
                    VERSION: "1.0.0"
                }),
                handleAs: "json"
            }).then(pass, (fail || this.defaultErrorHandler));
        }
    });
    return mapagent;
})