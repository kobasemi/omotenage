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
mode = str(query['mode'][0])
name = str(query['name'][0])
location = str(query['location'][0])
comefrom = str(query['from'][0])
destination = str(query['to'][0])
tmode = str(query['tmode'][0])
pageUrl = "http://www.firefly.kutc.kansai-u.ac.jp/~k434121/WebRTCCon/webrtc/cgi-bin/generate.cgi?name=%s&location=%s&from=%s&to=%s&tmode=%s" % (name, location, comefrom, destination, tmode)

output = ""


# General Tab
if mode == "general":
  weatherInfo = weather.main(location)

  output = """<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="shorcut icon" type="image/png" href="../img/fav.ico" />
      <link rel="stylesheet" type="text/css" href="https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min.css" />
      <link rel="stylesheet" type="text/css" href="../css/weather.css" />
      <script type="text/javascript" src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
      <script type="text/javascript" src="https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min.js"></script>
      <script type="text/javascript" src="https://maps.google.com/maps/api/js?sensor=true"></script>
    </head>
    <body>
      <div data-role="page" data-title="Omotenage">
        <div data-role="header" data-theme="a">
          <h1>Omotenage</h1>
        </div>
        <div data-role="navbar">
          <ul>
            <li><a href=%s class="ui-btn-active">General</a></li>
            <li><a href=%s>Map</a></li>
            <li><a href=%s>Recommend</a></li>
          </ul>
        </div>
          <!-- Information -->
          <div id="name">
            %s
          </div>
          <div id="weather">
            %s
          </div>
      </div>
    </body>
  </html>
  """ % (pageUrl + "&mode=general",pageUrl + "&mode=map", pageUrl + "&mode=recommend", name, weatherInfo)

# Map Tab
elif mode == "map":
  output = """<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="shorcut icon" type="image/png" href="../img/fav.ico" />
      <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jquerymobile/1.4.3/jquery.mobile.min.css" />
      <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
      <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquerymobile/1.4.3/jquery.mobile.min.js"></script>
      <script type="text/javascript" src="https://maps.google.com/maps/api/js?key=AIzaSyD0FpbGY_lnKFsweaiEWZFzq3csl5fwR-Q&sensor=true"></script>
      <link rel="stylesheet" type="text/css" href="../css/mystyle.css" />
    </head>
    <body>
      <div data-role="page" data-title="Omotenage">
        <div data-role="header" data-theme="a">
          <h1>Omotenage</h1>
        </div>
        <div data-role="navbar">
          <ul>
            <li><a href=%s>General</a></li>
            <li><a href=%s class="ui-btn-active">Map</a></li>
            <li><a href=%s>Recommend</a></li>
          </ul>
        </div>
          <!-- Map -->
        <div id="gmaps">
            <div id="map_canvas"></div>
            <div id="form" class="ui-bar-c ui-corner-all ui-shadow" style="padding: 1.5em; margin: 1.5em;">
              <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">
                <label><input type="radio" name="tmode" id="mode_drive" value="DRIVING" cheched="checked">Drive</label>
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
        </div>
      <script type="text/javascript" src="../js/generate.js"></script> 
    </body>
  </html>
  """ % (pageUrl + "&mode=general",pageUrl + "&mode=map", pageUrl + "&mode=recommend")

# Recommend Tab
elif mode == "recommend":
  # Pick up recommend location
  f = open('../recommend.json', 'r') 
  jsonData = json.load(f)
  f.close()

  recommend = ""
  for item in jsonData["recommend"]:
    if "en" in item["lang"]:
      geocode = item["location"].split(',')
       
      locationName = Geocoder.reverse_geocode(float(geocode[0]), float(geocode[1]))
      recommend += """%s<br />
      Location: %s<br />
      TEL: %s<br />
      Language: %s<br /><Hr>
      """ % (item["name"], locationName[0], item["tel"], item["lang"])
      


  
  output = """<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="shorcut icon" type="image/png" href="../img/fav.ico" />
      <link rel="stylesheet" type="text/css" href="https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min.css" />
      <script type="text/javascript" src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
      <script type="text/javascript" src="https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min.js"></script>
    </head>
    <body>
      <div data-role="page" data-title="Omotenage">
        <div data-role="header" data-theme="a">
          <h1>Omotenage</h1>
        </div>
        <div data-role="navbar">
          <ul>
            <li><a href=%s>General</a></li>
            <li><a href=%s>Map</a></li>
            <li><a href=%s class="ui-btn-active">Recommend</a></li>
          </ul>
        </div>
          <!-- Recommend -->
          <div id="recommend">
                  %s
          </div>
      </div>
    </body>
  </html>
  """ % (pageUrl + "&mode=general",pageUrl + "&mode=map", pageUrl + "&mode=recommend", recommend)


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
