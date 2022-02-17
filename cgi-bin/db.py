#!/usr/bin/python3
# -*- coding: utf-8 -*-

import hashlib
import os
from cgi import FieldStorage
from pathlib import Path
from typing import List, Tuple, Any, Union, Dict, Optional
from urllib.parse import urlparse

import mysql.connector

import query as qr
from conf import num_regions, datetimeformat
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

    def _dynamic_query(self, query: str, data: Tuple[Any, ...]) -> int:
        """
        Perform a query expected to modify database.

        :param query:
            string representing query to database.
        :param data:
            data for query as a tuple.

        :return:
            id of table-row where query inserted data.
        """

        self.cursor.execute(query, data)
        self.cnx.commit()
        return self.cursor.lastrowid

    def get_events(self, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict:
        """
        Retrieve events from database, limit and offset can be set for query.

        :param limit:
            maximum number of rows to retrieve, if None retrieve every row.
        :param offset:
            number of rows to skip from response.

        :return:
            dictionary with events data formatted and event count.
        """

        db_events = self._static_query(qr.events(limit=limit, offset=offset))  # query events from db
        cleaned_events = self.__get_cleaned_events(db_events)  # clean and order events data

        return {
            'count': self.event_count,
            'data': cleaned_events
        }

    def get_events_by_comuna(self, comuna_name: Optional[str]) -> Dict:
        """
        Retrieve events from database that take place in a specific comuna.

        :param comuna_name:
            comuna's name where events are queried.

        :return:
            all events data reported for a certain comuna.
        """

        valid_comunas = self.get_comunas(name_only=True)  # get valid comunas
        flatten_comunas = [comuna for region_comunas in valid_comunas for comuna in region_comunas]  # flatten list

        if not (comuna_name and comuna_name in flatten_comunas):  # check if name is not None and is valid
            return {'response': 'Debe ingresar un nombre de comuna válido.', 'comunas': flatten_comunas}

        comuna_id = self._static_query(qr.comuna_id_by_name(comuna_name=comuna_name))[0][0]
        db_events = self._static_query(qr.events_by_comuna_id(comuna_id))
        cleaned_events = self.__get_cleaned_events(db_events)

        return {
            'count': self.event_count,
            'data': cleaned_events
        }

    def get_event_by_id(self, event_id: Optional[int]):
        """
        Retrieve event from database that has a specific id.

        :param event_id:
            id of event searched in db.

        :return:
            data of event cleaned for readability.
        """

        valid_ids = self.get_events_ids()
        flatten_ids = [event_id for event in valid_ids for event_id in event]  # flatten list

        if not (event_id and event_id in flatten_ids):  # check if id is not None and is valid
            return {'response': 'Debe ingresar un id valido'}

        db_event = self._static_query(qr.event_by_id(event_id=event_id))
        cleaned_event = self.__get_cleaned_events(db_event)

        return {
            'count': self.event_count,
            'data': cleaned_event
        }

    def __get_cleaned_events(self, db_events: List[Tuple]) -> List[Dict]:
        """
        Get events data in a cleaner manner.

        :param db_events:
            events data retrieved directly from db.

        :return:
            all data concerning events queried, as a dictionary for readability.
        """

        cleaned_events = []
        for event in db_events:
            event_id, comuna_id = event[:2]  # ids to get event info from other tables in db

            comuna, region_id = self._static_query(qr.comuna_by_id(comuna_id=comuna_id))[0]  # comuna name, region id
            region = self._static_query(qr.region_by_id(region_id=region_id))[0][0]  # region name
            social_networks = self._static_query(qr.social_networks_by_event_id(event_id=event_id))  # social networks
            images = self._static_query(qr.images_by_event_id(event_id=event_id))  # images

            # order images and social networks as objects for easy component reading
            temp_networks = [
                {'social-network': social_network[0], 'url': social_network[1]} for social_network in social_networks
            ]
            temp_images = [
                {'basepath': image[0], 'image-path': image[1]} for image in images
            ]

            # order and append data cleaned_events list
            cleaned_events.append({
                'event-id': event_id,
                'region': region,
                'comuna': comuna,
                'sector': event[2],
                'nombre': event[3],
                'email': event[4],
                'celular': event[5],
                'dia-hora-inicio': event[6].strftime(datetimeformat),
                'dia-hora-termino': event[7].strftime(datetimeformat),
                'descripcion-evento': event[8],
                'tipo-comida': event[9],
                'red-social': temp_networks,
                'foto-comida': temp_images
            })

        return cleaned_events

    @property
    def event_count(self) -> int:
        """
        :return:
            property returning total number of events in db.
        """

        return self._static_query(qr.count_rows('evento'))[0][0]

    def get_social_networks(self) -> List[str]:
        """
        :return:
            social networks options accepted by database.
        """

        # get social network enum from database
        social_networks = self._static_query(qr.column_type(self.database, 'red_social', 'nombre'))

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
        food_types = self._static_query(qr.column_type(self.database, 'evento', 'tipo'))

        # database requires cleaning before returning
        clean_response = food_types[0][0]
        clean_response = clean_response.replace('enum(', '[')
        clean_response = clean_response.replace(')', ']')

        # clean response is a string, eval transforms it into a list
        return eval(clean_response)

    def get_regions(self, name_only: bool) -> List[Union[Tuple, str]]:
        """
        :return:
            regions from Chile registered in database.
        """

        # database registered regions (full row response -> [id, name])
        regions = self._static_query("SELECT * FROM region")
        if not name_only:
            return regions  # return full row response

        return [region_name for _, region_name in regions]  # return names of regions only

    def get_comunas(self, name_only: bool) -> List[List[Union[Tuple, str]]]:
        """
        :return:
            comunas from Chile registered in database
        """

        # database registered comunas (full row response -> [id, name, region-id])
        temp_comunas = self._static_query("SELECT * FROM comuna")

        comunas = [[] for _ in range(num_regions)]  # group comunas by region
        for comuna in temp_comunas:
            region_idx = comuna[2] - 1
            if not name_only:
                comunas[region_idx].append(comuna)  # add full row response for comuna
            else:
                comunas[region_idx].append(comuna[1])  # consider name only for comuna

        return comunas

    def get_events_ids(self):
        """
        :return:
            ids from events registered in db.
        """

        ids = self._static_query(qr.events_ids)
        return ids

    def get_image_count_per_comuna(self):
        """
        :return:
            image count from events per comuna.
        """

        comunas_and_images = self._static_query(qr.comunas_and_images)
        return comunas_and_images

    def register_event(self, postdata: FieldStorage) -> bool:
        """
        Register an event by saving data received as a POST request.

        :param postdata:
            data submitted by front-end as a POST request.

        :return:
            whether db handler correctly saved POST data.
        """

        comuna = postdata.getfirst('comuna', default='')
        sector = postdata.getfirst('sector', default='')

        name = postdata.getfirst('nombre', default='')
        email = postdata.getfirst('email', default='')
        phone = postdata.getfirst('celular', default='')

        description = postdata.getfirst('descripcion-evento', default='')
        food_type = postdata.getfirst('tipo-comida', default='')
        open_date = postdata.getfirst('dia-hora-inicio', default='')
        close_date = postdata.getfirst('dia-hora-termino', default='')

        # save in event table first
        comuna_id = self._static_query(qr.comuna_id_by_name(comuna))[0][0]
        event_id = self._dynamic_query(qr.insert_event, (
            comuna_id, sector, name, email, phone, open_date, close_date, description, food_type
        ))

        # save images and check for errors
        images: Union[List[FieldStorage], FieldStorage] = postdata['foto-comida']
        if not isinstance(images, list):
            images: List[FieldStorage] = [images]

        images_num = len(images)
        ok_saved = 0
        filepath = 'media'
        for image in images:
            filename = image.filename

            file_count = self._static_query("SELECT MAX(id) FROM foto")[0][0] + 1
            file_hash = hashlib.sha256(filename.encode()).hexdigest()[:30]
            hash_name = str(file_count) + file_hash

            image_path = Path(filepath) / hash_name
            correct = safe_save(image, image_path)
            ok_saved += int(correct)

            self._dynamic_query(qr.insert_image, (
                filepath, hash_name, event_id
            ))

        event_saved_ok = images_num == ok_saved
        if not event_saved_ok:
            self._dynamic_query(f"""DELETE FROM evento WHERE id={event_id}""", (None,))
            return False

        social_networks = postdata.getlist('red-social')
        for social_network in social_networks:
            hostname = urlparse(social_network).hostname
            social_network_name = resolve_hostname(hostname, self.get_social_networks())

            self._dynamic_query(qr.insert_social_network, (
                social_network_name, social_network, event_id
            ))

        return event_saved_ok


def safe_save(file: FieldStorage, save_path: Path) -> bool:
    """
    Save a file checking equal size of origin and saved file.

    :param file:
        file to be saved.
    :param save_path:
        path to save file.

    :return:
         whether saved file has same size as origin file.
    """

    size = os.fstat(file.file.fileno()).st_size  # submitted file size
    correct = False
    while not correct:
        file.file.seek(0, 0)  # return pointer to beginning of file
        with open(save_path, 'wb') as f:
            f.write(file.file.read())

        with open(save_path, 'rb') as f:
            saved_fd = f.fileno()
            saved_file_size = os.fstat(saved_fd).st_size  # saved file size

        correct = saved_file_size == size  # check file saved has same size

    return correct
