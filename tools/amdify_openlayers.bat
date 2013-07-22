@echo off
if "%1" == "" goto usage
if "%2" == "" goto usage

if not exist %1 (
    echo File not found: %1
    goto usage
)

echo define([], function() { > %2
type %1 >> %2
echo return OpenLayers; >> %2
echo }); >> %2

echo DONE!
goto quit

:usage
echo Usage: amdify_openlayers.bat [OL input file] [output file]
exit /B 1
:quit