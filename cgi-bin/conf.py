#!/usr/bin/python3
# -*- coding: utf-8 -*-

"""
conf.py:
    configuration file that provides important values and definitions.
"""

# database connection credentials
host = 'localhost'
user = 'root'
password = ''
database = 'tarea2'

# number of regions in Chile
num_regions = 16

# email and phone regex expressions
emailregex = r"([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|\[[\t -Z^-~]*])"
phoneregex = r"^\+(?:[0-9] ?){10}[0-9]$"

# datetime expected format
datetimeformat = '%Y-%m-%d %H:%M'
