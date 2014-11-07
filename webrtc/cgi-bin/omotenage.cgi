#!/usr/local/bin/python
#coding:utf-8

import os, cgi
import pywapi, weather
from pygeocoder import Geocoder
import json

if 'QUERY_STRING' in os.environ:
  query = cgi.parse_qs(os.environ['QUERY_STRING'])
else:
  query = {}

# Receive posted data
#mode = str(query['mode'][0])
#name = str(query['name'][0])
#location = str(query['location'][0])
#comefrom = str(query['from'][0])
#destination = str(query['to'][0])
#tmode = str(query['tmode'][0])

output = ""

# General Tab
#weatherInfo = weather.main(location)

output = """
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" type="image/png" href="./img/fav.ico" />
        <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jquerymobile/1.4.3/jquery.mobile.min.css" />
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquerymobile/1.4.3/jquery.mobile.min.js"></script>
        <script type="text/javascript" src="https://maps.google.com/maps/api/js?sensor=true"></script>
        <link rel="stylesheet" type="text/css" href="../css/mystyle.css" />
    </head>
    <body>

        <!-- Information -->
        <div id="general" data-role="page" data-title="Omotenage">
            <div role="main" class="ui-bar-c ui-corner-all ui-shadow" style="padding: 1.5em; margin:1.5em;">
                <h1>
                    Hello, <span id="username">anonymous</span>.
                    <span id="welcom">Welcome to Japan</span>.
                </h1>

            </div>
            <div data-role="footer" data-position="fixed" data-theme='b'>
                <div data-role="navbar">
                    <ul>
                        <li><a href="#" data-icon="info" class="ui-btn-active ui-state-persist"></a></li>
                        <li><a href="#gmaps" data-icon="navigation"></a></li>
                        <li><a href="#recommend" data-icon="star" class="acc-contents"></a></li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Google Maps -->
        <div id="gmaps" data-role="page" data-url="map_page" data-title="Omotenage">
            <div role="main">
                <div id="map_canvas"></div>
                <div id="form" class="ui-bar-c ui-corner-all ui-shadow" style="padding: 1.5em; margin: 1.5em;">
                    <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">
                        <label><input type="radio" name="tmode" id="mode_drive" value="DRIVING" checked="checked">Drive</label>
                        <label><input type="radio" name="tmode" id="mode_walk" value="WALKING">Walk</label>
                    </fieldset>
                    <p>
                        <label for="input_from">From</label>
                        <input type="text" name="input_from" id="input_from" placeholder="From">
                    </p>
                    <p>
                        <label for="input_to">To</label>
                        <input type="text" name="input_to" id="input_to" placeholder="To">
                    </p>
                    <a id="update" data-role="button" data-icon="search" data-inline="true" data-corners="true" data-shadow="true">Update</a>
                </div>
            </div>
            <div data-role="footer" data-position="fixed" data-theme='b'>
                <div data-role="navbar">
                    <ul>
                        <li><a href="#general" data-icon="info"></a></li>
                        <li><a href="#" data-icon="navigation" class="ui-btn-active ui-state-persist"></a></li>
                        <li><a href="#recommend" data-icon="star" class="acc-contents"></a></li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Recommend -->
        <div id="recommend" data-role="page" data-title="Omotenage">
            <div role="main">
            </div>
            <div data-role="footer" data-position="fixed" data-theme='b'>
                <div data-role="navbar">
                    <ul>
                        <li><a href="#general" data-icon="info"></a></li>
                        <li><a href="#gmaps" data-icon="navigation"></a></li>
                        <li><a href="#" data-icon="star" class="acc-contents"></a></li>
                    </ul>
            </div>
        </div>

        <script type="text/javascript" src="../js/omotenage.js"></script>
    </body>
</html>
"""

print "Content-Type: text/html"
print
print output

"""
filePath = "../nav/%s.html" % remote_id

f = open(filePath, "w")
f.write(output)
f.close()

print "Content-Type:text/javascript"
print
print "callback({'url':'%s'});" % filePath
"""
