#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os
from cgi import FieldStorage
from datetime import datetime
from typing import Tuple, List, Union
from urllib.parse import urlparse

import filetype

from conf import datetimeformat, maxfilesize, mimevalid


def check_social_network_link(social_network_link: str,
                              considered: List[str],
                              allowed: List[str]) -> Tuple[bool, str, str]:
    valid = False
    message = ''
    social_network = None

    try:
        url = urlparse(social_network_link)
        scheme = url.scheme
        hostname = resolve_hostname(url.hostname, allowed[:-1])
        path = url.path

        protocol_valid = scheme in ['http', 'https']
        hostname_valid = hostname in allowed
        path_valid = path not in ['', '/'] and len(path) >= 2
        available = hostname not in considered

        if not protocol_valid:
            message = 'URL debe comenzar con https:// o http://'
        elif not hostname_valid:
            message = 'URL proporcionada no es válida.'
        elif not path_valid:
            message = 'URL no contiene path (https://www.hostname.com/path)'
        elif not available:
            message = 'Máximo un link por tipo de red social.'
        else:
            social_network = hostname

        valid = all((protocol_valid, hostname_valid, path_valid, available))
    except ValueError:
        message = 'URL proporcionada no es válida.'

    return valid, message, social_network


def resolve_hostname(hostname: Union[str, None], allowed: List[str]) -> str:
    if not hostname:
        return ''

    cleaned_hostname = None
    for social_network in allowed:
        if social_network in hostname:
            cleaned_hostname = social_network
            break

    if not cleaned_hostname:
        hasdot = '.' in hostname[1:-1]  # at least a dot between beginning and end
        hasminlen = len(hostname) >= 4  # at least 4 characters e.g. g.co

        cleaned_hostname = 'otra' if (hasdot and hasminlen) else ''

    return cleaned_hostname


def datetime_has_format(date: str, dateformat: str) -> bool:
    try:
        datetime.strptime(date, dateformat)
        return True
    except ValueError:
        return False


def dates_are_ordered(first_date: str, second_date: str) -> bool:
    firstdatefmt = datetime.strptime(first_date, datetimeformat)
    seconddatefmt = datetime.strptime(second_date, datetimeformat)

    return firstdatefmt < seconddatefmt


def check_image(fileitem: FieldStorage) -> Tuple[bool, str]:
    valid = False
    message = 'Debe subir una imagen.'

    if not fileitem.filename:  # no file was submitted
        return valid, message

    try:
        size = os.fstat(fileitem.file.fileno()).st_size  # file size
        real_type = filetype.guess(fileitem.file)  # mime type
        fileitem.file.seek(0, 0)  # return pointer to beginning of file

        if not (real_type.mime in mimevalid):
            message = 'Extensión del archivo debe ser (.jpg .jpeg .png).'
        elif size > maxfilesize:
            message = f'Tamaño del archivo {size / 1000000:.3f} MB excede el máximo {maxfilesize / 1000000:.3f} MB.'
        else:
            message = ''
            valid = True
    except IOError:
        message = 'Error al leer el archivo.'  # error while trying to read file

    return valid, message
