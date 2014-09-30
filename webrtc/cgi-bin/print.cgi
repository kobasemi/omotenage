#!/usr/bin/python
#coding:utf-8

import sys, cgi
sys.path.append("/home/scwttn-117/www/webrtc/cgi-bin")
#import pywapi
import weather

print "Content-Type: text/html"
print
print """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" /> 
<meta name="viewport" content="width=device-width, initial-scale=1" /> 
<link rel="shortcut icon" href="img/logo.png">
<link rel="stylesheet" type="text/css" href="https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min.css" />
<link rel="stylesheet" type="text/css" href="css/weather.css" />
<script type="text/javascript" src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
<script type="text/javascript" src="https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min.js"></script>
<script type="text/javascript" src="https://maps.google.com/maps/api/js?sensor=true"></script>
<script type="text/javascript" src="js/jquery.ui.map.js"></script>
<script type="text/javascript" src="js/jquery.ui.map.services.js"></script>
<script type="text/javascript" src="js/jquery.ui.map.overlays.js"></script>
<script type="text/javascript" src="js/jquery.ui.map.extensions.js"></script>
</head>
<body>
<div data-role="page" data-title="WebRTC × おもてなし">
    <div data-role="header" data-theme="a">
        <h1>OMOTENASHI</h1>
    </div>
    <div id="main" data-role="content">
        <!-- Information -->
        <div id="weather">
          <script type="text/javascript" src="js/weather.js"></script>
        </div>

        <!-- Google Maps -->
        <div id="gmap">
            <div id="map_canvas" style="height:300px;"></div>
            <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">
                <label><input type="radio" name="tmode" id="mode_drive" value="DRIVING" checked="checked">Drive</label>
                <label><input type="radio" name="tmode" id="mode_walk" value="WALKING">Walk</label>
            </fieldset>
            <div class="ui-grid-a ui-responsive">
                <div class="ui-block-a" style="padding:0.5em;">
                    <label for="input_from">From(as A Marker):</label>
                    <input type="text" name="input_from" id="input_from" placeholder="From">
                </div>
                <div class="ui-block-b" style="padding:0.5em;">
                    <label for="input_to">To(as B Marker):</label>
                    <input type="text" name="input_to" id="input_to" placeholder="To">
                </div>
            </div>
        </div>

        <!-- Recommendation -->
        <div id="recommend">
            <!-- 未完成 -->
            <div>
                <p>お勧め情報</p>
            </div>
        </div>
    </div>
</div>
<script type="text/javascript" src="omotenashi/give.js"></script>
</body>
</html>
"""

if len(sys.argv) == 2:
  weather.main(sys.argv)
