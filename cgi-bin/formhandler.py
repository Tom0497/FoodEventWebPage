#!/usr/bin/python3
# -*- coding: utf-8 -*-

import re
from cgi import FieldStorage
from collections import defaultdict
from typing import Dict, Tuple, List

from conf import host, user, password, database, emailregex, phoneregex, datetimeformat
from db import EventDatabase
from utils import datetime_has_format, dates_are_ordered, check_image, check_social_network_link


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

        # valid regions, comunas, food types, and social networks
        self.valid_regions = self.db.get_regions(name_only=True)
        self.valid_comunas = self.db.get_comunas(name_only=True)
        self.valid_food_types = self.db.get_food_types()
        self.valid_social_networks = self.db.get_social_networks()

        # validation response
        self.form_valid, self.form_check = self._check_data()
        if self.form_valid:
            self.ok_status_db = self.db.register_event(self.post_data)

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

    def _check_data(self) -> Tuple[bool, Dict]:

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
        social_networks_valid = self.__check_social_networks()

        formvalid = all(
            (region_valid[0],
             comuna_valid[0],
             sector_valid[0],
             name_valid[0],
             email_valid[0],
             phone_valid[0],
             description_valid[0],
             food_type_valid[0],
             open_date_valid[0],
             close_date_valid[0],
             images_valid[0],
             social_networks_valid[0])
        )

        return (
            formvalid,
            {
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
                'foto-comida': images_valid,
                'red-social': social_networks_valid
            }
        )

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

    def __check_social_networks(self) -> Tuple[bool, List[Tuple[bool, str]]]:
        total_valid = True
        response = []

        social_networks = self.dict_data.get('red-social', None)
        already_considered = []

        if not social_networks:
            return total_valid, response

        for social_network in social_networks:
            valid, message, sn = check_social_network_link(social_network,
                                                           already_considered,
                                                           self.valid_social_networks)

            total_valid = total_valid and valid
            response.append((valid, message))
            if sn:
                already_considered.append(sn)

        return total_valid, response
