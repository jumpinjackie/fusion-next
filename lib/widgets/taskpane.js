define([
    "dojo/_base/declare", 
    "fusion/core", 
    "fusion/widget", 
    "dijit/layout/BorderContainer",
    "dojox/layout/ContentPane",
    "dijit/Toolbar",
    "dojo/query",
], function() {
    var declare                 = arguments[0];
    var Fusion                  = arguments[1];
    var Widget                  = arguments[2];
    var BorderContainer         = arguments[3];
    var ContentPane             = arguments[4];
    var Toolbar                 = arguments[5];
    var query                   = arguments[6];

    var TaskPane = declare(Widget, {
        initializeWidget: function(widgetTag) {
            var tp = query("#TaskPane");
            var bc = new BorderContainer(null, tp[0]);
            var tb = new Toolbar({
                region: "top"
            });
            this.content = new ContentPane({
                region: "center",
                executeScripts: true
            });
            bc.addChild(tb);
            bc.addChild(this.content);
            this.loadUrl(require.toUrl("widgets/TaskPane/TaskPane.html"));
        },
        loadUrl: function(url) {
            this.content.setHref(url);
        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: function() { return true; }
    });
    return TaskPane;
});