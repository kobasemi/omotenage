<?php

// GET Parameter
$name     = $_POST['name'];
$location = $_POST['location'];
$from     = $_POST['from'];
$to       = $_POST['to'];
$tmode    = $_POST['tmode'];
$cc       = $_POST['cc'];
$lc       = $_POST['lc'];

/***************************/
// Information Page
/***************************/
//////////////////////////////////////////////////////
// HTML about Cross Flag written by SVG
$svg_html = <<<EOT
<svg width="100%" viewBox="0 0 360 170">
    <!-- Japan Flag -->
    <g transform="translate(280) rotate(45)">
        <rect x="0" y="0" width="10" height="225" fill="brown" />
        <image x="10" y="0" width="100" height="75" xlink:href="../img/flags/4x3/jp.svg"/>
    </g>
    <!-- Partner Flag -->
    <g transform="translate(80)">
        <rect x="0" y="0" width="10" height="225" fill="brown" transform="scale(-1, 1)rotate(45)" />
        <image x="10" y="0" width="100" height="75" xlink:href="../img/flags/4x3/$cc.svg"/ transform="rotate(-45)translate(-120, 0)" />
    </g>
</svg>
EOT;
//////////////////////////////////////////////////////

//////////////////////////////////////////////////////
// HTML about Weather Data
$weather_html = '';
// Set timezone
date_default_timezone_set('Asia/Tokyo');
// Geocoding the posted location to get the coordinates
$coords = get_coords_by_geocode($location);
// Get weather data
// See. openweathermap.org/weather-data#5days
$weather_data = get_weather_data($coords);

if($weather_data === null)
    // Failed
    $weather_html = "<p style='color: red;'>Can't Load Weather Data</p>";
else{
    // Success
    $weather_list = $weather_data["list"];
    // Create FOUR div boxes about weather
    for($i=0; $i<4; $i++){
        if($i%2)
            $bg_color = "#FFFFFF";
        else
            $bg_color = "#EEEEEE";

        // UNIX Time to JST
        $date = strftime("%Y-%m-%d", $weather_list[$i]["dt"]);
        $time = strftime("%H:%M:%S", $weather_list[$i]["dt"]);
        // Weather Icon
        $imgsrc = $weather_list[$i]["weather"][0]["icon"];
        $imgalt = $weather_list[$i]["weather"][0]["description"];
        // Temperature
        $temp = strval($weather_list[$i]["main"]["temp"]-273.15)."C";

        $weather_html .= <<<EOT
        <div style="float: left; text-align: center; padding: 0em .5em 0em; background: $bg_color; border: solid thin black;">
            <div title="Date">$date</div>
            <div title="Time">$time</div>
            <img src="http://openweathermap.org/img/w/$imgsrc.png" alt="$imgalt">
            <div title="Temperature">$temp</div>
        </div>
EOT;
}

// URL for More Information
$more = "http://openweathermap.org/city/".strval($weather_data["city"]["id"]);
$weather_html .= <<<EOT
<div style="clear: left; color: gray; font-size: small"><a href="$more" target="_blank">More...</a></div>
EOT;
}
//////////////////////////////////////////////////////

//////////////////////////////////////////////////////
// Translate from English to $lc
require "translate.php";
// Original Text
$greet   = "Hello";
$welcome = "Welcome To Japan";
if($lc !== 'en'){
    // If translation target is not English
    // Translate
    $greet   = translate($greet, 'en', $lc);
    $welcome = translate($welcome, 'en', $lc);
}
//////////////////////////////////////////////////////

//////////////////////////////////////////////////////
// Combine two htmls to form $info_page
$info_page = <<<EOT
<!-- Information -->
<div id="general" data-role="page" data-title="Omotenage">
    <div role="main" style="padding: 1.5em;">
        <div class="ui-bar-a ui-corner-all ui-shadow" style="padding: 1em; margin: 0 auto; max-width: 640px;">
            <h1><span id="greet">$greet</span>, <span id="name">$name</span>.</h1>

            <div style="text-align: center;">
                <h2><span id="welcom">$welcome</span>.</h2>
                <div style="margin: 0 auto; max-width: 480px;">
                    $svg_html
                </div>
            </div>
            <div style="overflow: auto; max-width: 640px; margin: 0 auto;">
                <h2>Weather</h2>
                $weather_html
            </div>
        </div>
    </div>
    <div data-role="footer" data-position="fixed" data-theme='b'>
        <div data-role="navbar">
            <ul>
                <li><a href="#" data-icon="info" class="ui-btn-active ui-state-persist"></a></li>
                <li><a href="#gmaps" data-icon="navigation"></a></li>
                <li><a href="#recommend" data-icon="star"></a></li>
            </ul>
        </div>
    </div>
</div>
EOT;
//////////////////////////////////////////////////////

/***************************/
// Google Maps Page
/***************************/
// Check selected mode
$mode_drive = $mode_walk = "";
if($tmode === "DRIVING")
    $mode_drive = "checked";
else
    $mode_walk = "checked";
$from = get_formatted_address_by_geocode($from);
$to   = get_formatted_address_by_geocode($to);

$gmaps_page = <<<EOT
<!-- Google Maps -->
<div id="gmaps" data-role="page" data-url="map_page" data-title="Omotenage">
    <div role="main" style="padding: 1.5em;">
        <div class="ui-bar-a ui-corner-all ui-shadow" style="padding: 1em; margin: 0 auto; max-width: 640px;">
            <div id="map_canvas"></div>
            <div id="form">
                <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">
                    <label><input type="radio" name="tmode" id="mode_drive" value="DRIVING" $mode_drive>Drive</label>
                    <label><input type="radio" name="tmode" id="mode_walk" value="WALKING" $mode_walk>Walk</label>
                </fieldset>
                <p>
                    <label for="input_from">From</label>
                    <input type="text" name="input_from" id="input_from" placeholder="From" value="$from" class="geocomplete">
                </p>
                <p>
                    <label for="input_to">To</label>
                    <input type="text" name="input_to" id="input_to" placeholder="To" value="$to" class="geocomplete">
                </p>
                <a id="update" data-role="button" data-icon="search" data-inline="true" data-corners="true" data-shadow="true">Update</a>
            </div>
        </div>
    </div>
    <div data-role="footer" data-position="fixed" data-theme='b'>
        <div data-role="navbar">
            <ul>
                <li><a href="#general" data-icon="info"></a></li>
                <li><a href="#" data-icon="navigation" class="ui-btn-active ui-state-persist"></a></li>
                <li><a href="#recommend" data-icon="star"></a></li>
            </ul>
        </div>
    </div>
</div>
EOT;

/***************************/
// Recommend Page
/***************************/
//////////////////////////////////////////////////////
// Read Recommend.json
$json = file_get_contents("../json/Recommend.json");
$recomm_data = json_decode($json, true);

$recomm_html = '';
foreach($recomm_data['Recommend'] as $data){
    $type    = $data['type'];    // Location Type(Hotel, Restaurant, etc...)
    $name    = $data['name'];    // Location Name
    $address = $data['address']; // Location Address
    $tel     = $data['tel'];     // Location Telephone Number
    $lang    = $data['lang'];    // Support Language
    $url     = $data['url'];     // Location Website

    $recomm_div = <<<EOT
<div data-role="collapsible" data-collapsed-icon="$type" data-expanded-icon="$type">
    <h2>$name</h2>
    <ul data-role="listview">
        <li><div class="ui-btn-icon-left ui-icon-Address">$address</div></li>
        <li><div class="ui-btn-icon-left ui-icon-Phone">$tel</div></li>
        <li><div class="ui-btn-icon-left ui-icon-Language">$lang</div></li>
    </ul>
    <div style="text-align: center;">
        <a href="$url" data-role="button" data-inline="true" data-icon="action" data-mini="true" rel="external" target="_blank">Website</a>
        <a href="#" data-role="button" data-inline="true" data-icon="navigation" data-mini="true">Navi</a>
    </div>
</div>
EOT;

    $recomm_html .= $recomm_div;
}
//////////////////////////////////////////////////////

$recomm_page = <<<EOT
<!-- Recommend -->
<div id="recommend" data-role="page" data-title="Omotenage">
    <div role="main" style="padding: 1.5em;">
        <div class="ui-bar-a ui-corner-all ui-shadow" style="padding: 1em; margin: 0 auto; max-width: 640px;">
            <div data-role="collapsibleset" data-theme="a" data-content-theme="a" data-filter="true">
                $recomm_html
            </div>
        </div>
    </div>
    <div data-role="footer" data-position="fixed" data-theme='b'>
        <div data-role="navbar">
            <ul>
                <li><a href="#general" data-icon="info"></a></li>
                <li><a href="#gmaps" data-icon="navigation"></a></li>
                <li><a href="#" data-icon="star" class="ui-btn-active ui-state-persist"></a></li>
            </ul>
    </div>
</div>
EOT;

// Output HTML
echo <<<EOF
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" type="image/png" href="../img/fav.ico" />
        <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jquerymobile/1.4.3/jquery.mobile.min.css" />
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquerymobile/1.4.3/jquery.mobile.min.js"></script>
        <script type="text/javascript" src="https://maps.google.com/maps/api/js?language=en&sensor=true&libraries=places"></script>
        <script src="../js/jquery.geocomplete.min.js"></script>
        <link rel="stylesheet" type="text/css" href="../css/mystyle.css" />
    </head>
    <body>
        $info_page
        $gmaps_page
        $recomm_page
        <script type="text/javascript" src="../js/omotenage.js"></script>
    </body>
</html>
EOF;

// Get the $location coordinates
// $location: Geocoding Location
// Return: array('lat', 'lng')
function get_coords_by_geocode($location){
    // Default Coordinates (at Tokyo Station)
    $c = array("lat"=> 35.673559, "lng"=> 139.766084);
    
    // GET Request
    $ch = curl_init('https://maps.google.com/maps/api/geocode/json?address='.urlencode($location).'&sensor=false');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $r = curl_exec($ch);
    // Get geocoding in JSON format
    $geo_json = json_decode($r, true);

    curl_close($ch);
    if($geo_json['status'] === 'OK')
        // Success
        $c = $geo_json['results'][0]['geometry']['location'];
    return $c;
}

// Get the $location address
// $location: Geocoding Location
// Return: formatted address in English
function get_formatted_address_by_geocode($location){
    // GET Request
    $ch = curl_init('https://maps.google.com/maps/api/geocode/json?address='.urlencode($location).'&sensor=false&language=en');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $r = curl_exec($ch);
    // Get geocoding in JSON format
    $geo_json = json_decode($r, true);

    curl_close($ch);

    if($geo_json['status'] === 'OK')
        // Success
        return $geo_json['results'][0]['formatted_address'];
    return $location;
}

// Get the weather data at the coordinates from Openweathermap
// $coords: Location Coodinates (array('lat', 'lng'))
// Return: 
function get_weather_data($coords){
    // Request weather data from Openweathermap
    $ch = curl_init('http://api.openweathermap.org/data/2.5/forecast?lat='.$coords['lat'].'&lon='.$coords['lng']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $r = curl_exec($ch);

    if($r)
        // Success
        // Get weather data in JSON format
        $weather_json = json_decode($r, true);
    else
        // Failed
        $weather_json = null;

    curl_close($ch);
    return $weather_json;
}
