#!/usr/bin/python3
# -*- coding: utf-8 -*-

import cgitb
import json

from conf import host, user, password, database
from db import EventDatabase

cgitb.enable()
utf8stdout = open(1, 'w', encoding='utf-8', closefd=False)

# connect with database
event_db = EventDatabase(host=host,
                         user=user,
                         password=password,
                         database=database)

data = event_db.get_food_types()

print('Content-type: application/json; charset=UTF-8')
print()

print(json.dumps(data), file=utf8stdout)
