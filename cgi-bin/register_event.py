#!/usr/bin/python3
# -*- coding: utf-8 -*-

import cgi
import cgitb
import json

from formhandler import FormHandler

cgitb.enable()
utf8stdout = open(1, 'w', encoding='utf-8', closefd=False)

form = cgi.FieldStorage(keep_blank_values=True)
form_handler = FormHandler(post_data=form)
response = form_handler.form_check

print('Content-type: application/json; charset=UTF-8')
print()

print(json.dumps(response), file=utf8stdout)
