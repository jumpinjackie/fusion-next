define([
    "dojo/_base/declare", 
    "dojo/query", 
    "fusion/map", 
    "fusion/toolbarbuilder",
    "fusion/statusbarbuilder",
    "dijit/registry",
    "openlayers/OpenLayers",
    "dojo/topic",
    "fusion/widget",
    "dojo/request/script",
    "dojo/promise/all"
], function() {

    var declare         = arguments[0];
    var query           = arguments[1];
    var MapWidget       = arguments[2];
    var ToolbarBuilder  = arguments[3];
    var StatusBarBuilder = arguments[4];
    var registry        = arguments[5];
    var OpenLayers      = arguments[6];
    var topic           = arguments[7];
    var Widget          = arguments[8];
    var script          = arguments[9];
    var all             = arguments[10];

    var Func = OpenLayers.Function;

    //HACK: Yes, we're doing the antithesis of AMD, but global OpenLayers is needed for dynamically loading OpenStreetMap.js
    if (typeof(window.OpenLayers) == 'undefined')
        window.OpenLayers = OpenLayers;

    /**
     * Class: Runtime
     *
     * Runtime represents the Fusion runtime environment initialized by the Application Definition
     */
    var Runtime = declare(null, {
        mapInstances: [],
        widgetDefinitions: {},
        widgetInstances: {},
        mutexWidgetSets: {},
        constructor: function(o) {
            this.oAppDef = o.ApplicationDefinition;
        },
        initialize: function(Fusion, done, fail) {
            var mapSet = this.oAppDef.MapSet[0];
            var widgetSet = this.oAppDef.WidgetSet[0];

            var widgetModules = [];

            //Due to the async nature of require() we can't call this one at a time for each iteration
            //of this loop. So require() it all in one shot after collecting all the names here first.
            for (var i = 0; i < widgetSet.Widget.length; i++) {
                var widgetDef = widgetSet.Widget[i];
                this.widgetDefinitions[widgetDef.Name[0]] = widgetDef;
                var widgetName = widgetDef.Type[0].toLowerCase();
                widgetModules.push("widgets/" + widgetName);
            }

            var scripts = [];
            for (var name in this.oAppDef.Extension[0]) {
                if (name != "OpenStreetMapScript") //OSM is the only that works ATM
                    continue;
                var scriptUrl = this.oAppDef.Extension[0][name][0];
                scripts.push(script.get(scriptUrl));
            }

            var that = this;

            //For some unknown reason, plugging this anonymous function
            //directly into the require call screws up not only the outer scope
            //variables, but also the arguments that we need to fetch the widget
            //class definitions from, so define it here.
            var onModulesRequested = function() {

                try {
                    //Process the map widget first
                    var mapWidget = new MapWidget(widgetSet.MapWidget[0]);
                    that.mapInstances.push(mapWidget);

                    for (var i = 0; i < widgetSet.Widget.length; i++) {
                        var widgetDef = widgetSet.Widget[i];
                        var widgetName = widgetDef.Type[0];

                        var WidgetClass = arguments[i];

                        var widgetInstance = new WidgetClass({ name: widgetDef.Name[0] });
                        //If not template-resident, there's a UI class and options attached to this
                        if (widgetInstance.isTemplateResident()) {
                            var el = query(widgetInstance.domElId);
                            if (el.length == 0)
                                console.warn("DOM element ID (" + widgetInstance.domElId + ") could not be found for template-resident widget (" + widgetName + ")");
                        }

                        widgetInstance.setMap(mapWidget);
                        widgetInstance.initializeWidget(widgetDef, Fusion);
                        if (widgetInstance.name in that.widgetInstances) {
                            console.warn("A widget instance of name (" + widgetInstance.name + ") is already registered");
                        }
                        that.widgetInstances[widgetInstance.name] = widgetInstance;
                    }

                    for (var i = 0; i < widgetSet.Container.length; i++) {
                        var container = widgetSet.Container[i];
                        var containerId = container.Name[0];
                        if (container.Type[0] == "Splitterbar") {
                            var builder = new StatusBarBuilder(container);
                            builder.buildItems(that);
                        } else {
                            var builder = new ToolbarBuilder(container);
                            builder.buildItems(that);
                        }
                    }

                    //Force re-layout here as initializing the OpenLayers map may flow over dynamically populated toolbars
                    var layout = registry.byId("AppContainer");
                    layout.layout();

                    //Initialize the map widget
                    mapWidget.initializeWidget(widgetSet.MapWidget[0], mapSet, Fusion);

                    //Set up mutex widget handling
                    topic.subscribe(Widget.Events.ACTIVATED, Func.bind(that.onWidgetActivated, that));

                    //Call any attach init handlers
                    for (var i = 0; i < widgetSet.Widget.length; i++) {
                        var widgetDef = widgetSet.Widget[i];
                        var wgtInst = that.widgetInstances[widgetDef.Name[0]];
                        wgtInst.onAttachInit();
                    }

                    if (typeof(done) == 'function')
                        done();
                }
                catch (e) {
                    Fusion.reportError(e);
                }
            };

            //var onExternalScriptsLoaded = function() {
            //    debugger;      
            //};

            //require(scripts, onExternalScriptsLoaded);
            //Require all in one shot
            
            if (scripts.length > 0) {
                all(scripts).then(function(results) {
                    require(widgetModules, onModulesRequested);
                }, function(error) {
                    Fusion.reportError(error);
                });
            } else {
                require(widgetModules, onModulesRequested);
            }
        },
        getMapByIndice: function(indice) {
            return this.mapInstances[indice];
        },
        /**
         * Registers a widget to a mutually exclusive set
         */
        registerMutexWidget: function(setName, widget) {
            if (!(setName in this.mutexWidgetSets))
                this.mutexWidgetSets[setName] = [];
            this.mutexWidgetSets[setName].push(widget);

            console.log("Widget (" + widget.name + ") added to mutex set (" + setName + ")");
        },
        /**
         * Called when a widget has been activated
         */
        onWidgetActivated: function(widget) {
            var mutexSet = widget.getMutexWidgetSet();
            if (mutexSet != null && (mutexSet in this.mutexWidgetSets)) {
                //Un-select all UI instances in this set
                for (var i = 0; i < this.mutexWidgetSets[mutexSet].length; i++) {
                    var wgt = this.mutexWidgetSets[mutexSet][i];
                    if (wgt.uiObj == null)
                        debugger;
                    wgt.uiObj.set("checked", false);
                    if (wgt.isActive && wgt != widget)
                        wgt.deactivate();
                }
                //Then select the one of the activated widget
                widget.uiObj.set("checked", true);
            }
        }
    });
    return Runtime;
});