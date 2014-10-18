#!/usr/local/bin/python
#coding:utf-8

import os, cgi, sys
sys.path.append("/home/k434121/www/WebRTCCon/webrtc/cgi-bin")
import pywapi, weather

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

weatherInfo = weather.main(location)

output = """<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="logo.svg">
    <link rel="stylesheet" type="text/css" href="https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min.css" />
    <link rel="stylesheet" type="text/css" href="../css/weather.css" />
    <script type="text/javascript" src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min.js"></script>
    <script type="text/javascript" src="https://maps.google.com/maps/api/js?sensor=true"></script>
    <script type="text/javascript" src="js/jquery.ui.map.js"></script>
    <script type="text/javascript" src="js/jquery.ui.map.services.js"></script>
    <script type="text/javascript" src="js/jquery.ui.map.oerlays.js"></script>
    <script type="text/javascript" src="js/jquery.ui.map.extensions.js"></script>
  </head>
  <body>
    <div data-role="page" data-title="omotenage">
      <div data-role="header" data-theme="a">
        <h1>Omotenage</h1>
      </div>
      <div data-role="navbar">
        <ul>
          <li><a href=%s>General</a></li>
          <li><a href=%s>Map</a></li>
          <li><a href=%s>Recommend</a></li>
        </ul>
      </div>
      <div id="main" data-role="content">
        <!-- Information -->
        <div id="name">
          %s
        </div>
        <div id="weather">
          %s
        </div>
        <div id="mode">
          %s
        </div>
      </div>
    </div>
  </body>
</html>
""" % (pageUrl + "&mode=general",pageUrl + "&mode=map", pageUrl + "&mode=recommend", name, weatherInfo, mode)

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
