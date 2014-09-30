#!/usr/bin/python
#coding:utf-8

import cgi
import sys
import datetime
import pywapi


# Get Weather Info from Location ID
# return  value of Weather Info with Icon, and Location ID List(Select tag)
def getWeatherInfo(LocationId, LocationIds):
  isNight = False
  # Display symbol of degree celsius using ISO code
  UnitTemp = '&#8451;'

  Info = pywapi.get_weather_from_weather_com(LocationId)

  if len(Info['forecasts'][0]['day']['icon']) == 0:
    isNight = True

  if Info['units']['temperature'] != 'C':
    # Display symbol of degree fahrenheit using ISO code
    UnitTemp = '&#8457;'

  output = 'document.open();\n'

  # Div 0 begin
  output += """document.write('<div id="container">');\n"""

  # Div 1 weather image begin
  output += """document.write('<div id="image">');\n"""

  # Weather Image
  if isNight is False:
    output += """document.write("<img src='https://s.imwx.com/v.20131006.214956/img/wxicon/120/%s.png'><br/>");\n""" % Info['forecasts'][0]['day']['icon']

  else:
    output += """document.write("<img src='https://s.imwx.com/v.20131006.214956/img/wxicon/120/%s.png'><br/>");\n""" % Info['forecasts'][0]['night']['icon']

  # Div 1 weather image end
  output += """document.write('</div>');\n"""

  # Div 2 date and location begin
  output += """document.write('<div id="date">');\n"""

  # Date
  #output += 'document.write("<br/>Date : %s<br/><br/><br/>");\n' % Info['forecasts'][0]['date']

  # Get date from python native
  d = datetime.datetime.today()
  today = d.strftime("%B %d, %Y")
  
  output += 'document.write("<br/>Date : %s<br/><br/><br/>");\n' %  today

  # Location Name
  output += 'document.write("Location : %s");\n' % Info['location']['name']

  # Div 2 date and location end
  output += """document.write('</div>');\n"""

  # Div 3 temperature start
  output += """document.write('<div id="temperature">');\n"""

  # High
  output += 'document.write("<br/>&nbsp;&nbsp;&nbsp;High&nbsp;|&nbsp;%s%s<br/><br/><br/>");\n' % (Info['forecasts'][0]['high'], UnitTemp)

  # Low
  output += 'document.write("&nbsp;&nbsp;&nbsp;Low&nbsp;&nbsp;|&nbsp;%s%s");\n' % (Info['forecasts'][0]['low'], UnitTemp)

  # Div 3 temperature end
  output += """document.write('</div>');\n"""

  # Percentage of Chance Precip (Chance of Rain)
  #if isNight is False: 
    #output += 'document.write("Chance Precip : %s%%<br/>");\n' % Info['forecasts'][0]['day']['chance_precip']

  #else:
    #output += 'document.write("Chance Precip : %s%%<br/>");\n' % Info['forecasts'][0]['night']['chance_precip']

  # Percentage of Humidity
  #if isNight is False:
    #output += 'document.write("Humidity : %s%%<br/>");\n' % Info['forecasts'][0]['day']['humidity']
  #else:
    #output += 'document.write("Humidity : %s%%<br/>");\n' % Info['forecasts'][0]['night']['humidity']

  # Div 0 end
  output += """document.write('</div>');\n"""

  output += 'document.close();\n'
  #output += 'var selectElement = document.createElement("select");\n'
  #output += 'selectElement.setAttribute("name", "selectLocId");\n'
  #output += 'selectElement.setAttribute("id", "selectLocId");\n'

  #for key, value in LocationIds.items():
    #output += 'var option = document.createElement("option");\n'
    #output += 'option.value = "%s";\n' % key
    #output += 'option.text = "%s";\n' % value
    #output += 'selectElement.appendChild(option);\n'

  #output += 'var objBody = document.getElementsByTagName("body").item(0);\n'
  #output += 'objBody.appendChild(selectElement);\n'

  return output
  

print "Content-Type: text/html\n\n"
#print "Location: http://www.firefly.kutc.kansai-u.ac.jp/~k434121/test.html\n\n"
print "<html><body>"

form = cgi.FieldStorage()

# Call from textfield input
if form.has_key("LocationName"):
  # Get location name from form
  LocationName = form["LocationName"].value
  
  # Get location ids (Type : dictionary. LocationID:LocationName)
  # Example: JATY0006 : Ako, 13, Japan
  LocationIds = pywapi.get_location_ids(LocationName)
  
  # Get keys list from the dictionary
  KeyList = LocationIds.keys()
  if len(KeyList) == 0:
    output = 'document.open();\n'
    output += 'document.write("Sorry, Your Input Location is Not Found.<br/>Retry another name.");\n'
    output += 'document.close();\n'
    f = open('/home/scwttn-117/www/webrtc/js/weather.js', 'w')
    f.write(output) 
    f.close()
    sys.exit()
  
  # Get top key from the dictionary
  TopKey = KeyList[0]

  # Get Weather Info from key
  output = getWeatherInfo(TopKey, LocationIds)

  f = open('/home/scwttn-117/www/webrtc/js/weather.js', 'w')
  f.write(output)
  f.close()


# Call from select
elif form.has_key("locName"):
  print "Location Name is Null" 
  sys.exit()


print "</body></html>"
