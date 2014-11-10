#!/usr/local/bin/python
#coding:utf-8

import os, cgi, json, datetime
import requests
from pygeocoder import Geocoder

if 'QUERY_STRING' in os.environ:
  query = cgi.parse_qs(os.environ['QUERY_STRING'])
else:
  query = {}

# Receive posted data
name = str(query['name'][0])
location = str(query['location'][0])
comefrom = str(query['from'][0])
destination = str(query['to'][0])
tmode = str(query['tmode'][0])

#########################
# Information Page
#########################
##### Weather
### Japan Standard Time
class JST(datetime.tzinfo):
    def utcoffset(self, dt):
        return datetime.timedelta(hours=9)
    def dst(self, dt):
        return datetime.timedelta(0)
    def tzname(self, dt):
        return 'JST'

### Create HTML about Weather
weather_html = "<h2>Weather</h2>"
try:
    # Get Latlng from the posted location
    weather_latlng = Geocoder.geocode(location)[0].coordinates
    # Request weather data from Openweathermap
    OWM_API_URL = "http://api.openweathermap.org/data/2.5/forecast"
    r = requests.get(OWM_API_URL, params={
        'lat' : weather_latlng[0],
        'lon' : weather_latlng[1],
        })
    weather_data = r.json()
    # Get weather data list
    # See. openweathermap.org/weather-data#5days
    weather_list = weather_data["list"]

    # Create four div boxes about weather
    for i in range(4):
        # Background Color
        if i%2:
            bg_color = "#FFFFFF"
        else:
            bg_color = "#EEEEEE"

        # dt(UNIX time) to JST
        d = datetime.datetime.fromtimestamp(weather_list[i]["dt"], JST())
        date = d.strftime("%Y-%m-%d")
        time = d.strftime("%H:%M:%S")
        imgsrc = weather_list[i]["weather"][0]["icon"]
        imgalt = weather_list[i]["weather"][0]["description"]
        temp = str(weather_list[i]["main"]["temp"]-273.15) + "C"
        weather_html += """
                    <div style="float: left; text-align: center; padding: 0em .5em 0em; background: %s">
                        <div title="Date">%s</div>
                        <div title="Time">%s</div>
                        <img src="http://openweathermap.org/img/w/%s.png" alt="%s">
                        <div title="Temperature">%s</div>
                    </div>
                    """ % (bg_color, date, time, imgsrc, imgalt, temp)

    # More Information
    weather_html += """<div style="clear: left; color: gray; font-size: small"><a href="http://openweathermap.org/city/%s" target="_blank">More...</a></div>
    """ % (str(weather_data["city"]["id"]))
except:
    # When failed to Geocode
    weather_html = "<h2>Can't Load Weather Data</h2>"

##### Cross Flag
cc = 'br'
svg_html = """
<svg width="100%%" viewBox="0 0 360 170">
    <!-- Japan Flag -->
    <g transform="translate(280) rotate(45)">
    <rect x="0" y="0" width="10" height="225" fill="brown" />
    <image x="10" y="0" width="100" height="75" xlink:href="../img/flags/jp.svg"/>
    </g>
    <!-- Partner Flag -->
    <g transform="translate(80) scale(-1, 1) rotate(45)">
    <rect x="0" y="0" width="10" height="225" fill="brown" />
    <image x="10" y="0" width="100" height="75" xlink:href="../img/flags/%s.svg"/>
    </g>
</svg>
""" % (cc)

info_page = """
        <!-- Information -->
        <div id="general" data-role="page" data-title="Omotenage">
            <div role="main" style="padding: 1.5em;">
                <div class="ui-bar-a ui-corner-all ui-shadow" style="padding: 1em; margin: 0 auto; max-width: 640px;">
                    <h1><span id="greet">Hello</span>, <span id="name">%s</span>.</h1>

                    <div style="text-align: center;">
                        <h2><span id="welcom">Welcome to Japan</span>.</h2>
                        <div style="margin: 0 auto; max-width: 480px;">
                            %s
                        </div>
                    </div>
                    <div style="overflow: auto; max-width: 640px; margin: 0 auto;">
                        %s
                    </div>
                </div>
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
""" % (name, svg_html.encode('utf-8'), weather_html.encode('utf-8'))

#########################
# Google Maps Page
#########################
mode_drive = mode_walk = ""
if(tmode == "DRIVING"):
    mode_drive = "checked"
elif(tmode == "WALKING"):
    mode_walk = "checked"

gmaps_page = """
        <!-- Google Maps -->
        <div id="gmaps" data-role="page" data-url="map_page" data-title="Omotenage">
            <div role="main">
                <div id="map_canvas"></div>
                <div id="form" class="ui-bar-c ui-corner-all ui-shadow" style="padding: 1.5em; margin: 1.5em;">
                    <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">
                        <label><input type="radio" name="tmode" id="mode_drive" value="DRIVING" %s>Drive</label>
                        <label><input type="radio" name="tmode" id="mode_walk" value="WALKING" %s>Walk</label>
                    </fieldset>
                    <p>
                        <label for="input_from">From</label>
                        <input type="text" name="input_from" id="input_from" placeholder="From" value="%s">
                    </p>
                    <p>
                        <label for="input_to">To</label>
                        <input type="text" name="input_to" id="input_to" placeholder="To" value="%s">
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
""" % (mode_drive, mode_walk, comefrom, destination)

#########################
# Recommend Page
#########################
recomm_page = """
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
"""

# Output HTML
print "Content-Type: text/html"
print
print """
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" type="image/png" href="../img/fav.ico" />
        <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jquerymobile/1.4.3/jquery.mobile.min.css" />
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquerymobile/1.4.3/jquery.mobile.min.js"></script>
        <script type="text/javascript" src="https://maps.google.com/maps/api/js?sensor=true&language=en"></script>
        <link rel="stylesheet" type="text/css" href="../css/mystyle.css" />
    </head>
    <body>
        %s
        %s
        %s
        <script type="text/javascript" src="../js/omotenage.js"></script>
    </body>
</html>
""" % (info_page, gmaps_page, recomm_page)
