#!/usr/bin/python3
# -*- coding: utf-8 -*-

import re
from cgi import FieldStorage
from typing import Dict, Tuple, List

from conf import host, user, password, database, emailregex, phoneregex, datetimeformat
from db import EventDatabase
from utils import datetime_has_format, dates_are_ordered, check_image, check_social_network_link


class FormHandler:
    """
    Handler for data submitted through a POST request.

    This class provides functionality for receiving data from a POST
    request as a cgi FieldStorge. It expects certain fields of information
    with fixed key names, and for each one of them performs a checking of
    their input validity, given that data came from user input and, therefore
    cannot be trusted.

    Establish connection with database in order to retrieve valid types for
    some input fields, and once the server validation has returned a positive
    outcome, submits POST data to database handler for its saving into the
    database.

    In case of finding errors in one or more input fields, messages detailing
    these errors are grouped as a response to front-end in order to instruct
    user to correct data and try to submit again.
    """

    def __init__(self, post_data: FieldStorage):
        f"""
        Constructor for FormHandler class.

        :param post_data:
            data submitted to a cgi script, expected a cgi FieldStorage.
        """

        # post data and transformation to dict
        self._post_data = post_data

        # database connection
        self._db = EventDatabase(host=host,
                                 user=user,
                                 password=password,
                                 database=database)

        # valid regions, comunas, food types, and social networks
        self._valid_regions = self._db.get_regions(name_only=True)
        self._valid_comunas = self._db.get_comunas(name_only=True)
        self._valid_food_types = self._db.get_food_types()
        self._valid_social_networks = self._db.get_social_networks()

        # validation response
        self._form_valid, self._form_check = self._check_data()
        self._ok_status_db = self._db.register_event(self._post_data) if self._form_valid else False

    @property
    def response(self) -> Tuple[bool, Dict]:
        """
        :return:
            property returning handler response after checking POST data.
        """

        return self._ok_status_db, self._form_check

    @property
    def db_saved(self) -> bool:
        """
        :return:
            property returning whether database was able to correctly save POST data.
        """

        return self._ok_status_db

    def _check_data(self) -> Tuple[bool, Dict]:
        """
        Validate POST data, and generate messages in case of errors.

        :return:
            bool - whether POST data is server valid. <br>
            dict - response for every input validation.
        """

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
        """
        :return:
            bool - whether region submitted is valid. <br>
            str  - message in case of invalid input.
        """

        region = self._post_data.getfirst('region', '')
        valid = False
        message = ''

        if region in self._valid_regions:
            valid = True
        elif region == '':
            message = 'Debe seleccionar una región.'
        else:
            message = 'La región seleccionada no es una opción válida.'

        return valid, message

    def __check_comuna(self) -> Tuple[bool, str]:
        """
        :return:
            bool - whether comuna submitted is valid. <br>
            str  - message in case of invalid input.
        """

        comuna = self._post_data.getfirst('comuna', '')
        valid = False
        message = ''

        region = self._post_data.getfirst('region', '')
        region_valid = self.__check_region()[0]

        if not region_valid:
            message = 'Chequear región.'
        elif comuna in self._valid_comunas[self._valid_regions.index(region)]:
            valid = True
        elif comuna == '':
            message = 'Debe seleccionar una comuna.'
        else:
            message = 'La comuna seleccionada no es una opción válida.'

        return valid, message

    def __check_sector(self) -> Tuple[bool, str]:
        """
        :return:
            bool - whether sector submitted is valid. <br>
            str  - message in case of invalid input.
        """

        sector = self._post_data.getfirst('sector', '')
        valid = False
        message = ''

        if 0 <= len(sector) <= 100:
            valid = True
        else:
            message = 'Largo máximo de caracteres excedido.'

        return valid, message

    def __check_name(self) -> Tuple[bool, str]:
        """
        :return:
            bool - whether name submitted is valid. <br>
            str  - message in case of invalid input.
        """

        name = self._post_data.getfirst('nombre', '')
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
        """
        :return:
            bool - whether email submitted is valid. <br>
            str  - message in case of invalid input.
        """

        email = self._post_data.getfirst('email', '')
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
        """
        :return:
            bool - whether phone number submitted is valid. <br>
            str  - message in case of invalid input.
        """

        phone_number = self._post_data.getfirst('celular', '')
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
        """
        :return:
            bool - whether event description submitted is valid. <br>
            str  - message in case of invalid input.
        """

        description = self._post_data.getfirst('descripcion-evento', '')
        valid = False
        message = ''

        if not (0 <= len(description) <= 1000):
            message = 'Largo máximo de caracteres excedido.'
        else:
            valid = True

        return valid, message

    def __check_food_type(self) -> Tuple[bool, str]:
        """
        :return:
            bool - whether event food type submitted is valid. <br>
            str  - message in case of invalid input.
        """

        food_type = self._post_data.getfirst('tipo-comida', '')
        valid = False
        message = ''

        if food_type in self._valid_food_types:
            valid = True
        elif food_type == '':
            message = 'Debe seleccionar un tipo de comida.'
        else:
            message = 'El tipo seleccionado no es válido.'

        return valid, message

    def __check_open_date(self) -> Tuple[bool, str]:
        """
        :return:
            bool - whether event start date submitted is valid. <br>
            str  - message in case of invalid input.
        """

        open_date = self._post_data.getfirst('dia-hora-inicio', '')
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
        """
        :return:
            bool - whether event end date submitted is valid. <br>
            str  - message in case of invalid input.
        """

        open_date = self._post_data.getfirst('dia-hora-inicio', '')
        close_date = self._post_data.getfirst('dia-hora-termino', '')
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
        """
        :return:
            bool - whether all images submitted are valid. <br>
            list - list of (bool, str) tuples response for each image.
        """

        total_valid = True
        response = []

        if 'foto-comida' in self._post_data:
            images = self._post_data['foto-comida']
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
        """
        :return:
            bool - whether all social networks urls submitted are valid. <br>
            list - list of (bool, str) tuples response for each social network url.
        """

        total_valid = True
        response = []

        social_networks = self._post_data.getlist('red-social')
        already_considered = []

        if len(social_networks) == 0:
            return total_valid, response

        for social_network in social_networks:
            valid, message, sn = check_social_network_link(social_network,
                                                           already_considered,
                                                           self._valid_social_networks)

            total_valid = total_valid and valid
            response.append((valid, message))
            if sn:
                already_considered.append(sn)

        return total_valid, response
