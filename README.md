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

fusion-next is built on top of the following libraries/frameworks:

 * dojo toolkit 1.9.1
 * OpenLayers 2.13.1

Building fusion-next on top of dojo toolkit gives us a proverbial kitchen sink of UI components, DOM, event, AJAX, effects and animation libraries all through the power of AMD modules, allowing us to pick and choose the bits we're after.

But more importantly, building on top of dojo toolkit gives us a more stable, mature and *actively supported/maintained* foundation going forward.

Project Goals/Aims
==================

 * The fusion core and all of its widgets to be driven through AMD for complete modularity
 * A well-defined service backend specification that our existing PHP implementation will satisfy, but will allow for future .net and Java implementations to be easily implemented
 * Dropping MapServer support and MapServer-specific widgets. fusion-next will be 100% for MapGuide
 * More TBD

Widgets currently implemented in fusion-next
============================================

 * About
 * Cursor Position
 * Invoke Script
 * Refresh Map
 * Zoom In
 * Zoom Out