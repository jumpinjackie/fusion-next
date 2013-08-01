<?php

// index.php
//
// This is the server-side entry point to a Fusion application
//
// Having the entry point server-side instead of a client-side HTML page gives us the following
// benefits:
//
//  1. We save future requests to CreateSession.php and requesting the Application Definition resource as we can do that right here
//  2. The user/developer can implement additional initialization and/or security checks here
//
// Request Parameters:
//
// template - The name of the template to load (required)
// ApplicationDefinition - The resource id of the ApplicationDefinition (optional. If omitted, will use ApplicationDefinition.xml/json from the template dir)
// locale - The locale to use for localized strings (optional. Defaults to "en" if omitted)
// session - The MapGuide session id. (optional. Will not generate one if specified)
// username - The MapGuide user name (optional. Will use this username/password for authentication and generating a session id if provided)
// password - The MapGuide user password (optional. Will use this username/password for authentication and generating a session id if provided)

include(dirname(__FILE__)."/svc/common/php/Utilities.php");
include(dirname(__FILE__)."/svc/MapGuide/php/Common.php");

$template = "";
$appDefId = "";
$appDefJson = "";

if (array_key_exists("template", $_REQUEST)) {
    $template = $_REQUEST["template"];
} else {
    echo "ERROR: Missing required parameter 'template'";
    die;
}
if (array_key_exists("ApplicationDefinition", $_REQUEST)) {
    $appDefId = $_REQUEST["ApplicationDefinition"];
}

//Resolve template path based on template name
$tplPath = dirname(__FILE__)."/templates/mapguide/$template/index.templ";
if (!file_exists($tplPath)) {
    echo "ERROR: Could not find template file: $tplPath";
    die;
}

//Application Definition resolution priority
//
// 1. Resource ID, if specified
// 2. ApplicationDefinition.xml on the template dir
// 3. ApplicationDefinition.json on the template dir
//
// If we get an XML document, convert it to JSON with xml2json() (#2 won't be the case)
if (strlen($appDefId) == 0) {
    $xmlPath = dirname(__FILE__)."/templates/mapguide/$template/ApplicationDefinition.xml";
    if (!file_exists($xmlPath)) {
        $jsonPath = dirname(__FILE__)."/templates/mapguide/$template/ApplicationDefinition.json";
        if (!file_exists($jsonPath)) {
            echo "ERROR: Could not find ApplicationDefinition.xml or ApplicationDefinition.json in template path";
            die;
        } else {
            $appDefJson = file_get_contents($jsonPath);
        }
    } else {
        $doc = DOMDocument::load($xmlPath);
        $appDefJson = xml2json($doc);
    }
} else {
    $resId = new MgResourceIdentifier($appDefId);
    $appDefContent = $resourceService->GetResourceContent($resId);
    $doc = DOMDocument::loadXML($appDefContent->ToString());
    $appDefJson = xml2json($doc);
}

//Make a session ID if needed
$site = $siteConnection->GetSite();
$sessionID = $site->GetCurrentSession();
if (strlen($sessionID) == 0) {
    $site = $siteConnection->GetSite();
    $sessionID =  $site->CreateSession();
    $user->SetMgSessionId($sessionID);
}

$scripts = "";

// Find and replace the following tokens if found:
//
// %PAGE_TITLE% - The title of the page
// %SCRIPTS%    - A list of script tags (for Google/Bing/OSM)
// %APP_DEF%    - The Application Definition JSON
// %SESSION_ID% - The MapGuide Session ID
//
$tplContent = file_get_contents($tplPath);
$tplContent = str_replace("%PAGE_TITLE%", $template, $tplContent);
$tplContent = str_replace("%SCRIPTS%", $scripts, $tplContent);
$tplContent = str_replace("%APP_DEF%", $appDefJson, $tplContent);
$tplContent = str_replace("%SESSION_ID%", $sessionID, $tplContent);

header("Content-type: text/html");
echo $tplContent;

?>