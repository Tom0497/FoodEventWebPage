#!/usr/bin/python3
# -*- coding: utf-8 -*-

from cgi import FieldStorage
from typing import Dict, Union

from conf import host, user, password, database
from db import EventDatabase

# allowed request types
request_types = ['regions-comunas',
                 'food-types',
                 'social-networks',
                 'comunas-images',
                 'events-comuna',
                 'event',
                 'events']


class URLParamHandler:
    """
    Handler for URL parameters that define a data request from db.

    This class receives a cgi FieldStorage object containing URL params
    that indicate a type of data request to database, this params are
    read and interpreted in order to query the requested data and then
    return it.
    """

    def __init__(self, params: FieldStorage):
        """
        Constructor for URLParamHandler.

        :param params:
            URL params in a cgi FieldStorage.
        """

        self._params: FieldStorage = params  # store params
        self._request: Dict = self.__resolve_params()  # determine type of query

        self._db = EventDatabase(host=host,  # connect with database
                                 user=user,
                                 password=password,
                                 database=database)

        self._response = self.__resolve_request()  # query database and construct response

    def __resolve_params(self) -> Dict[str, Union[str, None]]:
        """
        :return:
            determine type, limit and offset values for request.
        """

        request = self._params.getfirst('type', None)
        limit = self._params.getfirst('limit', None)
        offset = self._params.getfirst('offset', None)
        comuna = self._params.getfirst('comuna', None)
        event_id = self._params.getfirst('id', None)

        if request not in request_types:  # limited types of request permitted
            request = None

        return {
            'type': request,
            'limit': limit,
            'offset': offset,
            'comuna': comuna,
            'event_id': event_id
        }

    def __resolve_request(self):
        """
        :return:
            query data to database based on request params.
        """

        request_type = self._request.get('type')  # get type only if is valid

        if not request_type:  # response in case of invalid request type
            return {
                'response': 'require type param',
                'values': request_types
            }

        if request_type == request_types[0]:  # regions and comunas names
            return {
                'regions': self._db.get_regions(name_only=True),
                'comunas': self._db.get_comunas(name_only=True)
            }

        if request_type == request_types[1]:  # food types for events
            return self._db.get_food_types()

        if request_type == request_types[2]:  # social networks
            return self._db.get_social_networks()

        if request_type == request_types[3]:  # image count per comuna
            return self._db.get_image_count_per_comuna()

        if request_type == request_types[4]:  # events of a comuna
            comuna = self._request.get('comuna')
            return self._db.get_events_by_comuna(comuna_name=comuna)

        if request_type == request_types[5]:  # event data by id
            event_id_str = self._request.get('event_id')
            event_id = int(event_id_str) if event_id_str else None
            return self._db.get_event_by_id(event_id=event_id)

        # events data with optional limit and offset
        request_limit = self._request.get('limit')
        request_offset = self._request.get('offset')

        return self._db.get_events(limit=request_limit, offset=request_offset)

    @property
    def response(self):
        """
        :return:
            property returning response from database to constructed query.
        """

        return self._response
