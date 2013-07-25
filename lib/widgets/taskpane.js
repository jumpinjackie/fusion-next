define([
    "dojo/_base/declare", 
    "fusion/core", 
    "fusion/widget", 
    "dijit/layout/BorderContainer",
    "dojox/layout/ContentPane",
    "dijit/Toolbar",
    "dojo/query",
    "dijit/form/Button",
    "dijit/form/DropDownButton",
    "dijit/DropDownMenu",
    "fusion/stringbundle",
    "openlayers/OpenLayers",
    "urijs/URI",
    "fusion/map",
    "dojo/topic"
], function() {

    var declare                 = arguments[0];
    var Fusion                  = arguments[1];
    var Widget                  = arguments[2];
    var BorderContainer         = arguments[3];
    var ContentPane             = arguments[4];
    var Toolbar                 = arguments[5];
    var query                   = arguments[6];
    var Button                  = arguments[7];
    var DropDownButton          = arguments[8];
    var DropDownMenu            = arguments[9];
    var StringBundle            = arguments[10];
    var OpenLayers              = arguments[11];
    var URI                     = arguments[12];
    var Map                     = arguments[13];
    var topic                   = arguments[14];

    /**
     * The task pane is a generic widget that allows developers to insert custom functionality 
     * into an application without having to create a full widget.  Functionality is added by 
     * creating InvokeURL widgets and adding them to the TaskPane widget. The InvokeURL widget 
     * loads your custom script into the page for the user, and provides access to the current 
     * server-side session, map name and other critical runtime information
     * @class TaskPane
     * @extends Widget
     */
    var TaskPane = declare(Widget, {
        homeBtn: null,
        backBtn: null,
        forwardBtn: null,
        tasksMenu: null,
        initialUrl: null,
        initializeWidget: function(widgetTag) {

            var json = widgetTag.Extension ? widgetTag.Extension[0] : {};

            this.initialUrl = json.InitialTask ? json.InitialTask[0] : Fusion.getAssetPathForWidget("TaskPane", "TaskPane.html");
            this.menuContainerId = json.MenuContainer ? json.MenuContainer[0] : "";

            var tp = query("#TaskPane");
            var bc = new BorderContainer({ gutters: false }, tp[0]);
            var tb = new Toolbar({
                region: "top"
            });
            this.homeBtn = new Button({
                label: StringBundle.i18n("L_GO_HOME"),
                showLabel: false,
                iconClass: "fusion-icon fusion-home",
                onClick: OpenLayers.Function.bind(this.goHome, this)
            });
            this.backBtn = new Button({
                label: StringBundle.i18n("L_GO_BACK"),
                showLabel: false,
                iconClass: "fusion-icon fusion-back",
                onClick: OpenLayers.Function.bind(this.goBack, this)
            });
            this.forwardBtn = new Button({
                label: StringBundle.i18n("L_GO_FORWARD"),
                showLabel: false,
                iconClass: "fusion-icon fusion-forward",
                onClick: OpenLayers.Function.bind(this.goForward, this)
            });
            this.tasksMenu = new DropDownButton({
                label: StringBundle.i18n("L_TASKS"),
                showLabel: true,
                style: "float: right",
                iconClass: "fusion-icon fusion-tasks",
                dropDown: (this.menuContainerId === "") ? new DropDownMenu() : new DropDownMenu({ id: this.menuContainerId })
            });
            tb.addChild(this.homeBtn);
            tb.addChild(this.backBtn);
            tb.addChild(this.forwardBtn);
            tb.addChild(this.tasksMenu);

            this.content = new ContentPane({
                region: "center",
                style: "padding: 0; overflow: hidden",
                content: "<iframe id='TaskFrame' style='border: 0; width: 100%; height: 100%'></iframe>"
            });
            bc.addChild(tb);
            bc.addChild(this.content);
            bc.startup();
            this.taskFrame = query("#TaskFrame")[0];

            //We cannot set initial url immediately as the map has not been initialized yet, so listen for when
            //its safe to do so
            topic.subscribe(Map.Events.ACTIVE_MAP_CHANGED, OpenLayers.Function.bind(this.onMapChanged, this));
        },
        onMapChanged: function(e) {
            if (e.isFirstLoad) {
                this.loadUrl(this.initialUrl);
            }
        },
        /**
         * Loads the given URL
         * @param {String} url the URL to load
         * @memberof TaskPane
         * @instance
         */
        loadUrl: function(url) {
            var map = Fusion.runtime.getMapByIndice(0);
            url = URI(url).addSearch({ session: Fusion.sessionID, mapname: map.getMapName() });

            //this.content.setHref(url);
            this.taskFrame.src = url;
        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         * @ignore
         */
        isTemplateResident: function() { return true; }
    });
    return TaskPane;
});