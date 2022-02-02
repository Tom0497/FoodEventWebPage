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

# obtain regions and comunas
regions = event_db.get_regions(name_only=True)
comunas = event_db.get_comunas(name_only=True)

# group data in a dict
data = {
    'regions': regions,
    'comunas': comunas
}

print('Content-type: application/json; charset=UTF-8')
print()

print(json.dumps(data), file=utf8stdout)
