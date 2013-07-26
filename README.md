fusion-next
===========

MapGuide Fusion: Rebooted

fusion-next is Fusion mapping framework for MapGuide rebuilt from the ground up.

Motivation
==========

Why are we rebuilding Fusion from scratch?

 * We're currently using JxLib, which has not been maintained for some time now and there are many UI-related issues that we are unable to fix as a result.
 * The use of JxLib/MooTools hampers our ability to integrate with external libraries like jQuery or upgrade to newer versions of OpenLayers with ease and minimal conflict.
 * We have issues with modularity due to lack of proper AMD (asynchronous module definition) support.
 * Fusion has accumulated many years of cruft, hacks and workarounds.
 * Fusion has widget feature creep with plenty of half-implemented widget features that only work under certain conditions

fusion-next is built on the main pillars of OpenLayers and dojo toolkit.

Building fusion-next on top of dojo toolkit gives us a proverbial kitchen sink of UI components, DOM, event, AJAX, effects and animation libraries all through the power of AMD modules, allowing us to pick and choose the bits we're after.

dojo also includes a rich set of charting/graphic/reporting components which opens up new possibilities in Fusion applications.

But more importantly, building on top of dojo toolkit gives us a more stable, mature and *actively supported/maintained* foundation going forward.

Project Goals/Aims
==================

 * The fusion core and all of its widgets to be driven through AMD for complete modularity
 * A well-defined service backend specification that our existing PHP implementation will satisfy, but will allow for future .net and Java implementations to be easily implemented
 * Dropping MapServer support and MapServer-specific widgets. fusion-next will be 100% for MapGuide
 * JSON will be the default and expected data interchange format for all web services and mapagent communication. There will be _ZERO_ use of XML and/or conversion to JSON from XML.
 * More TBD

Thirdparty Libraries/Frameworks used to implement fusion-next
=============================================================

 * OpenLayers 2.13.1 (http://www.openlayers.org)
 * Proj4js (http://trac.osgeo.org/proj4js/)
 * dojo toolkit 1.9.1 (http://www.dojotoolkit.org)
 * URI.js (http://medialize.github.io/URI.js/)

Widgets currently implemented in fusion-next
============================================

 * About
 * Cursor Position
 * Editable Scale
 * Extent History
 * Invoke Script
 * Pan
 * Refresh Map
 * View Size
 * Zoom In
 * Zoom Out
 * Zoom (Rectangle)

Widgets partially implemented in fusion-next
============================================

 * Navigator (slider doesn't work yet)

Unknowns to address/determine/research
======================================

 * How produce API documentation from AMD modules?
 * How best to handle many UI instances mapped to one widget, especially wrt mutual exclusivity
 * How to optimize this down to single-file builds with dojo build system
 * dijit.Tree unknowns
    * How to show checkboxes for certain nodes?
    * How to use inline data URIs for icons instead of CSS classes
 * Should we leverage the functionality offered by dojox/geo/openlayers or go our own way? (currently our own way)
 * Stick with per-template HTML entry points, or go with a single global server-side (PHP/ASP.net/Java) entry point that outputs the specific client template
 * How to load scripts the classic non-AMD way (required for Google Maps/Bing integration)
 * How to load external css stylesheets (for widgets)
 * How to replicate the features of older templates
    * Floating message bar (replicate with dojox.layout.FloatingPane?)
    * Status bar component layout
    * Collapsible sidebar
    * Floating windows (ala. Aqua)
    * Vertical toolbars