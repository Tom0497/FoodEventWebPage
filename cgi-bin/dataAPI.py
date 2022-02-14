#!/usr/bin/python3
# -*- coding: utf-8 -*-

import cgi
import cgitb
import json

from urlparamhandler import URLParamHandler

cgitb.enable()
utf8stdout = open(1, 'w', encoding='utf-8', closefd=False)

query_params = cgi.FieldStorage()
handler = URLParamHandler(query_params)
response = handler.response

print('Content-type: application/json; charset=UTF-8')
print('')

print(json.dumps(response), file=utf8stdout)
