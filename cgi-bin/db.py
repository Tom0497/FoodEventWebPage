#!/usr/bin/python3
# -*- coding: utf-8 -*-

from cgi import FieldStorage
from typing import List, Tuple, Any

import mysql.connector

from conf import num_regions
from urllib.parse import urlparse
from utils import resolve_hostname


class EventDatabase:
    """
    Class to provide connection with MySQL database.

    A proxy class to establish a connection with a MySQL database
    using mysql-connector. Its main purpose is to serve from the
    backend of a web app important and relevant information and data
    to display in frontend.
    """

    def __init__(self,
                 host: str,
                 user: str,
                 password: str,
                 database: str):
        """
        Constructor of EventDatabase.

        :param host:
            IP address that is serving the database.
        :param user:
            user for accessing database.
        :param password:
            password associated with user to access database.
        :param database:
            name of schema to be accessed.
        """

        # parameters
        self.host = host
        self.database = database

        # connection to database
        self.cnx = mysql.connector.connect(user=user,
                                           password=password,
                                           host=host,
                                           database=database)
        # cursor to execute queries to database
        self.cursor = self.cnx.cursor()

    def get_social_networks(self) -> List[str]:
        """
        :return:
            social networks options accepted by database.
        """

        # get food type enum from database
        social_networks = self._static_query(
            f"""
            SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '{self.database}' AND TABLE_NAME = 'red_social' AND COLUMN_NAME = 'nombre'
            """
        )

        # database requires cleaning before returning
        clean_response = social_networks[0][0]
        clean_response = clean_response.replace('enum(', '[')
        clean_response = clean_response.replace(')', ']')

        # clean response is a string, eval transforms it into a list
        return eval(clean_response)

    def get_food_types(self) -> List[str]:
        """
        :return:
            food type options accepted by database.
        """

        # get food type enum from database
        food_types = self._static_query(
            f"""
            SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '{self.database}' AND TABLE_NAME = 'evento' AND COLUMN_NAME = 'tipo'
            """
        )

        # database requires cleaning before returning
        clean_response = food_types[0][0]
        clean_response = clean_response.replace('enum(', '[')
        clean_response = clean_response.replace(')', ']')

        # clean response is a string, eval transforms it into a list
        return eval(clean_response)

    def get_regions(self, name_only: bool) -> List[Tuple or str]:
        """
        :return:
            regions from Chile registered in database.
        """

        # database registered regions (full row response -> [id, name])
        regions = self._static_query("SELECT * FROM region")
        if not name_only:
            # return full row response
            return regions

        # return names of regions only
        return [region_name for _, region_name in regions]

    def get_comunas(self, name_only: bool) -> List[List[Tuple or str]]:
        """
        :return:
            comunas from Chile registered in database
        """

        # database registered comunas (full row response -> [id, name, region-id])
        temp_comunas = self._static_query("SELECT * FROM comuna")

        # group comunas by region
        comunas = [[] for _ in range(num_regions)]
        for comuna in temp_comunas:
            if not name_only:
                # add full row response for comuna
                comunas[comuna[2] - 1].append(comuna)
            else:
                # consider name only for comuna
                comunas[comuna[2] - 1].append(comuna[1])

        return comunas

    def _static_query(self, query: str) -> List:
        """
        Perform a query with no parameters to database.

        :param query:
            string that represents the static query.
        :return:
            database response to given query as a list of tuples.
        """

        self.cursor.execute(query)
        return self.cursor.fetchall()

    def _dynamic_query(self, query: str, data: Tuple[Any, ...]) -> List:

        self.cursor.execute(query, data)
        self.cnx.commit()
        return self.cursor.lastrowid

    def register_event(self, postdata: FieldStorage) -> bool:

        region = postdata.getfirst('region', default='')
        comuna = postdata.getfirst('comuna', default='')
        sector = postdata.getfirst('sector', default='')

        name = postdata.getfirst('nombre', default='')
        email = postdata.getfirst('email', default='')
        phone = postdata.getfirst('celular', default='')

        description = postdata.getfirst('descripcion-evento', default='')
        food_type = postdata.getfirst('tipo-comida', default='')
        open_date = postdata.getfirst('dia-hora-inicio', default='')
        close_date = postdata.getfirst('dia-hora-termino', default='')

        images = postdata['foto-comida']
        if not isinstance(images, list):
            images = [images]
        social_networks = postdata.getlist('red-social')

        comuna_id = self._static_query(f"""
        SELECT id FROM comuna WHERE comuna.nombre='{comuna}'
        """)[0][0]

        eventquery = """
        INSERT INTO evento 
        (comuna_id, sector, nombre, email, celular, dia_hora_inicio, dia_hora_termino, descripcion, tipo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        event_id = self._dynamic_query(eventquery, (
            comuna_id, sector, name, email, phone, open_date, close_date, description, food_type
        ))

        social_network_query = """
        INSERT INTO red_social
        (nombre, identificador, evento_id)
        VALUES (%s, %s, %s)
        """

        for social_network in social_networks:
            hostname = urlparse(social_network).hostname
            social_network_name = resolve_hostname(hostname, self.get_social_networks())

            self._dynamic_query(social_network_query, (
                social_network_name, social_network, event_id
            ))

        image_query = """
        INSERT INTO foto
        (ruta_archivo, nombre_archivo, evento_id)
        VALUES (%s, %s, %s)
        """

        for image in images:
            filepath = '../media'
            filename = image.filename

            self._dynamic_query(image_query, (
                filepath, filename, event_id
            ))

        return True
