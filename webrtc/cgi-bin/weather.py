#!/usr/bin/python
#coding:utf-8

import sys
import datetime
import pywapi

# Get Weather Info from Location ID
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

  # Div 0 begin
  output = """<div id="container">\n"""

  # Div 1 weather image begin
  output += """<div id="image">\n"""

  # Weather Image
  if isNight is False:
    #output += """<img src="https://s.imwx.com/v.20131006.214956/img/wxicon/120/%s.png"><br/>\n""" % Info['forecasts'][0]['day']['icon']
    output += """<img src="https://s.imwx.com/v.20131006.214956/img/wxicon/70/%s.png">\n""" % Info['forecasts'][0]['day']['icon']

  else:
    output += """<img src="https://s.imwx.com/v.20131006.214956/img/wxicon/70/%s.png">\n""" % Info['forecasts'][0]['night']['icon']

  # Div 1 weather image end
  output += """</div>\n"""

  # Div 2 info begin
  output += """<div id="info">\n"""

  # Date
  #output += '<br/>DATE : %s<br/><br/><br/>\n' % Info['forecasts'][0]['date']

  # Get date from python native
  d = datetime.datetime.today()
  today = d.strftime("%B %d, %Y")

  #output += '<br/>Date : %s<br/><br/><br/>\n' %  today
  output += 'Date : %s<br/>\n' %  today

  # Location Name
  output += 'Location : %s<br/>\n' % Info['location']['name']

  # High
  #output += '<br/>&nbsp;&nbsp;&nbsp;High&nbsp;|&nbsp;%s%s<br/><br/><br/>\n' % (Info['forecasts'][0]['high'], UnitTemp)
  output += 'High&nbsp;|&nbsp;%s%s<br/>\n' % (Info['forecasts'][0]['high'], UnitTemp)

  # Low
  #output += '&nbsp;&nbsp;&nbsp;Low&nbsp;&nbsp;|&nbsp;%s%s\n' % (Info['forecasts'][0]['low'], UnitTemp)
  output += 'Low&nbsp;&nbsp;|&nbsp;%s%s\n' % (Info['forecasts'][0]['low'], UnitTemp)

  # Div 2 info end
  output += """</div>\n"""

  # Percentage of Chance Precip (Chance of Rain)
  #if isNight is False:
    #output += 'Chance Precip : %s%%<br/>\n' % Info['forecasts'][0]['day']['chance_precip']

  #else:
    #output += 'Chance Precip : %s%%<br/>\n' % Info['forecasts'][0]['night']['chance_precip']

  # Percentage of Humidity
  #if isNight is False:
    #output += 'Humidity : %s%%<br/>\n' % Info['forecasts'][0]['day']['humidity']
  #else:
    #output += 'Humidity : %s%%<br/>\n' % Info['forecasts'][0]['night']['humidity']

  # Div 0 end
  output += """</div>\n"""

  return output

def main(argv):
  
  LocationName = argv
  
  # Get location ids (Type : dictionary. LocationID:LocationName)
  # Example: JATY0006 : Ako, 13, Japan
  LocationIds = pywapi.get_location_ids(LocationName)

  # Get keys list from the dictionary
  KeyList = LocationIds.keys()
  if len(KeyList) == 0:
    output = "Sorry, Your Input Location is Not Found.<br/>Retry another name."
    return output
    sys.exit(1)

  # Get top key from the dictionary
  TopKey = KeyList[0]

  # Get Weather Info from key
  output = getWeatherInfo(TopKey, LocationIds)
  return output
  sys.exit(0)

if __name__ == '__main__':
  print "This script is module use only."
  sys.exit(1)
