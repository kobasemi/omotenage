#!/usr/local/bin/python
#coding:utf-8

import os, cgi

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
remote_id = str(query['remote_id'][0])

output = """<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <p>name : %s</p>
    <p>location : %s</p>
    <p>from : %s</p>
    <p>to : %s</p>
    <p>tmode : %s</p>
    <p>remote_id : %s</p>
  </body>
</html>
""" % (name, location, comefrom, destination, tmode, remote_id)

filePath = "../nav/%s.html" % remote_id

f = open(filePath, "w")
f.write(output)
f.close()

print "Content-Type:text/javascript"
print
print "callback({'url':'%s'});" % filePath
