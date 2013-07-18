define([
    "dojo/_base/declare", 
    "dojo/query", 
    "fusion/map", 
    "fusion/toolbarbuilder",
    "dijit/registry"
], function() {

    var declare         = arguments[0];
    var query           = arguments[1];
    var MapWidget       = arguments[2];
    var ToolbarBuilder  = arguments[3];
    var registry        = arguments[4];

    /**
     * Class: Runtime
     *
     * Runtime represents the Fusion runtime environment initialized by the Application Definition
     */
    var Runtime = declare(null, {
        mapInstances: [],
        widgetDefinitions: {},
        widgetInstances: {},
        constructor: function(o) {
            this.oAppDef = o.ApplicationDefinition;
        },
        initialize: function(done, fail) {
            var mapSet = this.oAppDef.MapSet;
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

            var that = this;

            //For some unknown reason, plugging this anonymous function
            //directly into the require call screws up not only the outer scope
            //variables, but also the arguments that we need to fetch the widget
            //class definitions from, so define it here.
            var onModulesRequested = function() {

                //Process the map widget first
                var mapWidget = new MapWidget(widgetSet.MapWidget[0]);
                that.mapInstances.push(mapWidget);

                for (var i = 0; i < widgetSet.Widget.length; i++) {
                    var widgetDef = widgetSet.Widget[i];
                    var widgetName = widgetDef.Type[0];

                    var WidgetClass = arguments[i];

                    var widgetInstance = new WidgetClass({ name: widgetDef.Name[0] });
                    //If not template-resident, there's a UI class and options attached to this
                    if (widgetInstance.isTemplateResident) {
                        var el = query(widgetInstance.domElId);
                        if (el.length == 0)
                            console.warn("DOM element ID (" + widgetInstance.domElId + ") could not be found for template-resident widget (" + widgetName + ")");
                    }

                    widgetInstance.setMap(mapWidget);
                    widgetInstance.initializeWidget(widgetDef);
                    if (widgetInstance.name in that.widgetInstances) {
                        console.warn("A widget instance of name (" + widgetInstance.name + ") is already registered");
                    }
                    that.widgetInstances[widgetInstance.name] = widgetInstance;
                }

                for (var i = 0; i < widgetSet.Container.length; i++) {
                    var container = widgetSet.Container[i];
                    var containerId = container.Name[0];

                    var builder = new ToolbarBuilder(container);
                    builder.buildItems(that);
                }

                //Force re-layout here as initializing the OpenLayers map may flow over dynamically populated toolbars
                var layout = registry.byId("AppContainer");
                layout.layout();

                //Initialize the map widget
                mapWidget.initializeWidget(widgetSet.MapWidget[0]);

                if (typeof(done) == 'function')
                    done();
            };

            //Require all in one shot
            require(widgetModules, onModulesRequested);
        },
        getMapByIndice: function(indice) {
            return this.mapInstances[indice];
        }
    });
    return Runtime;
});