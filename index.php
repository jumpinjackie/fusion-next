<?php

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

$tplPath = dirname(__FILE__)."/templates/mapguide/$template/index.templ";
if (!file_exists($tplPath)) {
    echo "ERROR: Could not find template file: $tplPath";
    die;
}

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

//header("Content-type: application/json");
//echo $appDefJson;
$site = $siteConnection->GetSite();
$sessionID = $site->GetCurrentSession();
if (strlen($sessionID) == 0) {
    $site = $siteConnection->GetSite();
    $sessionID =  $site->CreateSession();
    $user->SetMgSessionId($sessionID);
}

$tplContent = sprintf(file_get_contents($tplPath), $template, $appDefJson, $sessionID);
header("Content-type: text/html");
echo $tplContent;

?>