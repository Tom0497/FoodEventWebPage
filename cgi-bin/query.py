#!/usr/bin/python3
# -*- coding: utf-8 -*-

"""
query.py:
    script that contains queries as string that are used by database handler to get data from it.
"""

from typing import Optional

insert_event = """
    INSERT INTO evento 
    (comuna_id, sector, nombre, email, celular, dia_hora_inicio, dia_hora_termino, descripcion, tipo)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
insert_social_network = """
    INSERT INTO red_social
    (nombre, identificador, evento_id)
    VALUES (%s, %s, %s)
    """
insert_image = """
    INSERT INTO foto
    (ruta_archivo, nombre_archivo, evento_id)
    VALUES (%s, %s, %s)
    """
comunas_and_images = """
    SELECT co.nombre, count(*)
    FROM evento ev, comuna co, foto fo
    WHERE ev.comuna_id=co.id AND fo.evento_id=ev.id
    GROUP BY co.nombre
    """
events_ids = """
    SELECT id
    FROM evento
    """
events_by_start_date = """
    SELECT DATE_FORMAT(dia_hora_inicio, '%Y-%m-%d') AS fecha, count(*) AS total
    FROM evento
    GROUP BY DATE_FORMAT(dia_hora_inicio, '%Y-%m-%d')
    ORDER BY DATE_FORMAT(dia_hora_inicio, '%Y-%m-%d') ASC
    """
events_by_food_type = """
    SELECT tipo, count(*)
    FROM evento
    GROUP BY tipo
    """


def events_by_month_between_timeframe(init_time: str, end_time: str) -> str:
    query = f"""
    SELECT DATE_FORMAT(dia_hora_inicio, '%Y-%m') AS fecha, count(*) AS total
    FROM evento
    WHERE DATE_FORMAT(dia_hora_inicio, '%H:%i') BETWEEN '{init_time}' AND '{end_time}'
    GROUP BY DATE_FORMAT(dia_hora_inicio, '%Y-%m')
    ORDER BY DATE_FORMAT(dia_hora_inicio, '%Y-%m') ASC
    """

    return query


def column_type(db: str, table: str, column: str) -> str:
    query = f"""
    SELECT COLUMN_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = '{db}' AND TABLE_NAME = '{table}' AND COLUMN_NAME = '{column}'
    """

    return query


def events(limit: Optional[int] = None, offset: Optional[int] = None) -> str:
    query = """
    SELECT id, comuna_id, sector, nombre, email, celular, dia_hora_inicio, dia_hora_termino, descripcion, tipo
    FROM evento
    ORDER BY dia_hora_inicio DESC
    """

    if limit:
        query += f"LIMIT {limit} "

    if offset:
        query += f"OFFSET {offset} "

    return query


def events_by_comuna_id(comuna_id: int) -> str:
    query = f"""
    SELECT id, comuna_id, sector, nombre, email, celular, dia_hora_inicio, dia_hora_termino, descripcion, tipo
    FROM evento
    WHERE comuna_id={comuna_id}
    ORDER BY dia_hora_inicio DESC
    """

    return query


def event_by_id(event_id: int) -> str:
    query = f"""
    SELECT id, comuna_id, sector, nombre, email, celular, dia_hora_inicio, dia_hora_termino, descripcion, tipo
    FROM evento
    WHERE id={event_id}
    """

    return query


def region_by_id(region_id: int) -> str:
    query = f"""
    SELECT nombre
    FROM region
    WHERE region.id='{region_id}'
    """

    return query


def comuna_by_id(comuna_id: int) -> str:
    query = f"""
    SELECT nombre, region_id
    FROM comuna
    WHERE comuna.id='{comuna_id}'
    """

    return query


def comuna_id_by_name(comuna_name: str) -> str:
    query = f"""
    SELECT id 
    FROM comuna 
    WHERE comuna.nombre='{comuna_name}'
    """

    return query


def social_networks_by_event_id(event_id: int) -> str:
    query = f"""
    SELECT nombre, identificador
    FROM red_social
    WHERE evento_id='{event_id}'
    """

    return query


def images_by_event_id(event_id: int) -> str:
    query = f"""
    SELECT ruta_archivo, nombre_archivo
    FROM foto
    WHERE evento_id={event_id}
    """

    return query


def count_rows(table_name: str) -> str:
    query = f"""
    SELECT COUNT(*)
    FROM {table_name}
    """

    return query
