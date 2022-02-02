#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os
import re
from cgi import FieldStorage
from collections import defaultdict
from datetime import datetime
from typing import Dict, Tuple, List

import filetype

from conf import host, user, password, database, emailregex, phoneregex, datetimeformat, maxfilesize, mimevalid
from db import EventDatabase


class FormHandler:
    def __init__(self, post_data: FieldStorage):
        # post data and transformation to dict
        self.post_data = post_data
        self.dict_data = self._cgi_to_dict()

        # database connection
        self.db = EventDatabase(host=host,
                                user=user,
                                password=password,
                                database=database)

        # valid regions, comunas and food types
        self.valid_regions = self.db.get_regions(name_only=True)
        self.valid_comunas = self.db.get_comunas(name_only=True)
        self.valid_food_types = self.db.get_food_types()

        # validation response
        self.form_check = self._check_data()

    def _cgi_to_dict(self) -> Dict:
        datadict = {}
        for key in self.post_data.keys():
            if key in ['foto-comida', 'red-social']:
                datadict[key] = self.post_data.getlist(key=key)
            else:
                datadict[key] = self.post_data.getfirst(key=key, default="")
        for key, value in datadict.items():
            if value is None:
                datadict[key] = ""

        return defaultdict(lambda: '', datadict)

    def _check_data(self) -> Dict:

        region_valid = self.__check_region()
        comuna_valid = self.__check_comuna()
        sector_valid = self.__check_sector()

        name_valid = self.__check_name()
        email_valid = self.__check_email()
        phone_valid = self.__check_phone_number()

        description_valid = self.__check_description()
        food_type_valid = self.__check_food_type()
        open_date_valid = self.__check_open_date()
        close_date_valid = self.__check_close_date()

        images_valid = self.__check_images()

        return {
            'region': region_valid,
            'comuna': comuna_valid,
            'sector': sector_valid,
            'nombre': name_valid,
            'email': email_valid,
            'celular': phone_valid,
            'descripcion-evento': description_valid,
            'tipo-comida': food_type_valid,
            'dia-hora-inicio': open_date_valid,
            'dia-hora-termino': close_date_valid,
            'foto-comida': images_valid
        }

    def __check_region(self) -> Tuple[bool, str]:
        region = self.dict_data.get('region')
        valid = False
        message = ''

        if region in self.valid_regions:
            valid = True
        elif region == '':
            message = 'Debe seleccionar una región.'
        else:
            message = 'La región seleccionada no es una opción válida.'

        return valid, message

    def __check_comuna(self) -> Tuple[bool, str]:
        comuna = self.dict_data.get('comuna')
        valid = False
        message = ''

        region = self.dict_data.get('region')
        region_valid = self.__check_region()[0]

        if not region_valid:
            message = 'Chequear región.'
        elif comuna in self.valid_comunas[self.valid_regions.index(region)]:
            valid = True
        elif comuna == '':
            message = 'Debe seleccionar una comuna.'
        else:
            message = 'La comuna seleccionada no es una opción válida.'

        return valid, message

    def __check_sector(self) -> Tuple[bool, str]:
        sector = self.dict_data.get('sector')
        valid = False
        message = ''

        if 0 <= len(sector) <= 100:
            valid = True
        else:
            message = 'Largo máximo de caracteres excedido.'

        return valid, message

    def __check_name(self) -> Tuple[bool, str]:
        name = self.dict_data.get('nombre')
        valid = False
        message = ''

        if name == '':
            message = 'Debe ingresar un nombre de contacto.'
        elif not (3 <= len(name) <= 200):
            message = 'Al menos 3 caracteres, máximo 200.'
        else:
            valid = True

        return valid, message

    def __check_email(self) -> Tuple[bool, str]:
        email = self.dict_data.get('email')
        valid = False
        message = ''

        email_regex = re.compile(emailregex)

        if email == '':
            message = 'Debe ingresar un email.'
        elif not email_regex.fullmatch(email):
            message = 'Formato de email no válido.'
        else:
            valid = True

        return valid, message

    def __check_phone_number(self) -> Tuple[bool, str]:
        phone_number = self.dict_data.get('celular')
        valid = False,
        message = ''

        phone_regex = re.compile(phoneregex)

        if phone_number == '':
            valid = True
        elif not phone_regex.fullmatch(phone_number):
            message = 'Número de celular no válido, ver ejemplo.'
        else:
            valid = True

        return valid, message

    def __check_description(self) -> Tuple[bool, str]:
        description = self.dict_data.get('descripcion-evento')
        valid = False
        message = ''

        if not (0 <= len(description) <= 1000):
            message = 'Largo máximo de caracteres excedido.'
        else:
            valid = True

        return valid, message

    def __check_food_type(self) -> Tuple[bool, str]:
        food_type = self.dict_data.get('tipo-comida')
        valid = False
        message = ''

        if food_type in self.valid_food_types:
            valid = True
        elif food_type == '':
            message = 'Debe seleccionar un tipo de comida.'
        else:
            message = 'El tipo seleccionado no es válido.'

        return valid, message

    def __check_open_date(self) -> Tuple[bool, str]:
        open_date = self.dict_data.get('dia-hora-inicio')
        valid = False
        message = ''

        if open_date == '':
            message = 'Debe ingresar la fecha de inicio del evento.'
        elif not (len(open_date) == 16 and datetime_has_format(open_date, datetimeformat)):
            message = 'Formato incorrecto, ver ejemplo.'
        else:
            valid = True

        return valid, message

    def __check_close_date(self) -> Tuple[bool, str]:
        open_date = self.dict_data.get('dia-hora-inicio')
        close_date = self.dict_data.get('dia-hora-termino')
        valid = False
        message = ''

        open_date_valid = self.__check_open_date()[0]

        if close_date == '':
            message = 'Debe ingresar la fecha de término del evento.'
        elif not (len(close_date) == 16 and datetime_has_format(close_date, datetimeformat)):
            message = 'Formato incorrecto, ver ejemplo.'
        elif not open_date_valid:
            message = 'Chequear la fecha de inicio.'
        elif not dates_are_ordered(open_date, close_date):
            message = 'El término debe ser después del inicio del evento.'
        else:
            valid = True

        return valid, message

    def __check_images(self) -> Tuple[bool, List[Tuple[bool, str]]]:
        total_valid = True
        response = []

        if 'foto-comida' in self.post_data:
            images = self.post_data['foto-comida']
            if not isinstance(images, list):
                images = [images]
        else:
            return False, [(False, 'Subir una imagen.')]

        for image in images:
            valid, message = check_image(image)
            total_valid = total_valid and valid
            response.append((valid, message))

        return total_valid, response

    def __check_social_networks(self):
        pass


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
