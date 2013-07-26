define([
    "fusion/core",
    "fusion/widget",
    "dojo/_base/declare",
    "dojo/topic",
    "dijit/form/ToggleButton",
    "openlayers/OpenLayers"
], function() {

    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];
    var topic = arguments[3];
    var ToggleButton = arguments[4];
    var OpenLayers = arguments[5];

    var Pan = declare(Widget, {
        olControl: null,
        initializeWidget: function(widgetTag) {
            
        },
        onAttachInit: function() {
            this.olControl = new OpenLayers.Control.DragPan();
            this.getMap().oMapOL.addControl(this.olControl);
            this.olControl.handler.keyMask = 0;

            var assetPath = Fusion.getAssetPath();
            var grabpath= "url(" + assetPath + "cursors/grab.cur" + "), move";
            var grabbingpath = "url(" + assetPath + "cursors/grabbing.cur" + "), move";
            
            this.cursorNormal = [grabpath, 'grab', '-moz-grab', 'move'];
            this.cursorDrag = [grabbingpath, 'grabbing', '-moz-grabbing', 'move'];

            //This contains auto-activate logic
            this.inherited(arguments);
        },
        getItemUiClass: function(containerType) {
            if (containerType == "toolbar") {
                return ToggleButton;
            } 
            return this.inherited(arguments);
        },
        isAutoActivate: function() { return true; },
        setUiObject: function(uiObj) {
            this.inherited(arguments);
            Fusion.registerMutexWidget(this.getMutexWidgetSet(), this);
        },
        getMutexWidgetSet: function() {
            return Fusion.MutexWidgetSets.MAP_CONTROLS;
        },
        activate: function() {
            this.inherited(arguments);
            this.olControl.activate();
            this.getMap().setCursor(this.cursorNormal);
            topic.publish(Widget.Events.ACTIVATED, this);
        },
        deactivate: function() {
            this.inherited(arguments);
            this.olControl.deactivate();
            //this.getMap().setCursor('auto');
        }
    });
    return Pan;
});