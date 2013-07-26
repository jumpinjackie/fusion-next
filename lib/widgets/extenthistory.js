define(["fusion/core", "fusion/widget", "dojo/_base/declare", "dojo/topic", "fusion/map"], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];
    var topic = arguments[3];
    var Map = arguments[4];

    var ExtentHistory = declare(Widget, {
    
        events: [],
        aHistory: [],
        sDirection: null,
        EPS: 0.00000001,  //percentage difference allowed in bounds values for test for equal
    
        initializeWidget: function(widgetTag) {
            var json = widgetTag.Extension ? widgetTag.Extension[0] : {};
            
            var sDirection = json.Direction ? json.Direction[0].toLowerCase() : 'previous';
            if (sDirection != 'previous' && sDirection != 'next') {
                this.sDirection = 'previous';
            } else {
                this.sDirection = sDirection;
            }
            
            if (!this.aHistory['history']) {
                this.aHistory['history'] = [];
                this.aHistory['index'] = -1;
                
                topic.subscribe(Map.Events.EXTENTS_CHANGED, OpenLayers.Function.bind(this.extentsChanged, this));
                topic.subscribe(Map.Events.ACTIVE_MAP_CHANGED, OpenLayers.Function.bind(this.reset, this));
            }
            
            topic.subscribe(ExtentHistory.Events.HISTORY_CHANGED, OpenLayers.Function.bind(this.historyChanged, this));
        },
        
        onAttachInit: function() {
            this.disable();
        },
        
        reset: function() {
            if (this.getMap().isMapLoaded()) {
                this.aHistory['history'] = [this.getMap().getCurrentExtents()];
                this.aHistory['index'] = 0;
            } else {
                this.aHistory['history'] = [];
                this.aHistory['index'] = -1;
            }
            this.historyChanged();
        },
        
        extentsChanged: function() {
            var extents = this.getMap().getCurrentExtents();
            if (this.aHistory['history'].length == 0) {
                this.aHistory['history'].push(extents);
                this.aHistory['index'] = 0;
            } else {
                var aExtents = this.aHistory['history'][this.aHistory['index']];
                if (this.boundsEqual(extents, aExtents)) {
                    return;
                }
                //clear forward history if we zoom to a different extent than contained in the history
                if (this.aHistory['index'] != (this.aHistory['history'].length - 1)) {
                    this.aHistory['history'] = this.aHistory['history'].slice(0, this.aHistory['index'] + 1);
                }
                this.aHistory['history'].push(extents);
                this.aHistory['index'] = this.aHistory['history'].length - 1;
            }
            topic.publish(ExtentHistory.Events.HISTORY_CHANGED);
        },
        
        historyChanged: function() {
            if (this.sDirection == 'previous') {
                if (this.aHistory['index'] > 0) {
                    this.enable();
                } else {
                    this.disable();
                }
            } else {
                if (this.aHistory['index'] < (this.aHistory['history'].length - 1)) {
                    this.enable();
                } else {
                    this.disable();
                }
            }
        },
        
        activate: function() {
            if (this.sDirection == 'previous') {
                if (this.aHistory['index'] > 0) {
                    this.aHistory['index'] --;
                    this.getMap().setExtents(this.aHistory['history'][this.aHistory['index']]);
                    topic.publish(ExtentHistory.Events.HISTORY_CHANGED);
                }
            } else {
                if (this.aHistory['index'] < (this.aHistory['history'].length - 1)) {
                    this.aHistory['index'] ++;
                    this.getMap().setExtents(this.aHistory['history'][this.aHistory['index']]);
                    topic.publish(ExtentHistory.Events.HISTORY_CHANGED);
                }
            }
        },
        
        /* 
         * test if 2 OpenLayers.Bounds objects are equal to within some precision
         * @ignore
         */
        boundsEqual: function(b1, b2) {
            var equal = false;

            //prevent divide by 0 errors
            var offset = 100;
            if (b2.top == 0) {
                b1.top += offset;
                b2.top += offset;
            }
            if (b2.bottom == 0) {
                b1.bottom += offset;
                b2.bottom += offset;
            }
            if (b2.left == 0) {
                b1.left += offset;
                b2.left += offset;
            }
            if (b2.right == 0) {
                b1.right += offset;
                b2.right += offset;
            }
            //calculate difference as percentage so all ranges of coordinates can be accommodated
            equal = (Math.abs((b1.top - b2.top) / b2.top) < this.EPS &&
                     Math.abs((b1.bottom - b2.bottom) / b2.bottom) < this.EPS &&
                     Math.abs((b1.left - b2.left) / b2.left) < this.EPS &&
                     Math.abs((b1.right - b2.right) / b2.right) < this.EPS);
            return equal;
        }
    });
    
    ExtentHistory.Events = {
        HISTORY_CHANGED: "fusion/widget/extenthistory/historychanged"
    };
    
    return ExtentHistory;
});