import datetime
import json

from flask_sqlalchemy import SQLAlchemy

from flask import abort
from .aqi import *
from .converter import *

import logging
log = logging.getLogger('Postgres')


db = SQLAlchemy()


class Station(db.Model):
    id = db.Column(db.String, nullable=False, primary_key=True)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    data = db.Column(db.String, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)
    last_txid = db.Column(db.String, nullable=False)

    def __repr__(self):
        return '<station with id={}>'.format(self.id)


def station_exists(id):
    """
    Check if station with given id exist in database
    :param id: Station id
    :return: True if it exists, False otherwise
    """
    station = Station.query.get(id)
    if station is None:
        return False
    return True


def get_list_of_stations():
    """
    :return: List of dics with station names and coordinates
    """
    # stations = Station.query.all()
    query = db.session.query(Station)
    log.info("Query: %s" % (str(query)))
    stations = query.all()
    log.info("Result: %d stations" % (len(stations)))
    return [
        {
            'id': station.id,
            'latitude': station.latitude,
            'longitude': station.longitude,
            'last_txid': station.last_txid
        }
        for station in stations
    ]


def get_list_of_parameters():
    """
    :return: List of strings
    """
    stations = Station.query.all()
    params = []
    for station in stations:
        for measurement in json.loads(station.data)['measurements']:
            if not (measurement['parameter'] in params):
                params.append(measurement['parameter'])
    log.info("Result: %d parameters" % (len(params)))
    return [
        parameter for parameter in params
    ]


def get_station_data(id):
    """
    :param id: Station id
    :return: json object station.data stored in database
    """
    log.info("Quering station with id = %s" % id)
    station = Station.query.get(id)
    if station is None:
        log.error("No station with such id.")
        abort(404)
    return json.loads(station.data)


def get_stations_data(aqi = False, parameters=[], unit=None, coordinates = None, limit = None):
    """
    Filter the latest data from all stations
    :param aqi: True/False if calculation needed, not required
    :param parameters: List of strings, not required
    :param unit: 'ppm' or 'ug/m3', all data returned in specified unit, not required
    :param coordinates: dic with 'latitude' and 'longitude'
    :param limit: The number of raws to return, not required
    :return: All data which match defined filters
    """
    log.info("Filters received:{ aqi: %r, parameters: %s, unit: %s, coordinates: %s, limit: %s}" %
             (aqi, str(parameters), (unit or 'not defined'), (json.dumps(coordinates) or 'not defined'), (limit or 'not defined')))
    stations = Station.query.all()
    if coordinates is not None and ('latitude' in coordinates.keys() and 'longitude' in coordinates.keys()):
        stations = sorted(stations,
                        key=lambda station:
                        pow(json.loads(station.data)['coordinates']['latitude'] - coordinates['latitude'], 2) +
                        pow(json.loads(station.data)['coordinates']['longitude'] - coordinates['longitude'], 2))
    data = []
    for station in stations:
        station_data = {
            'id': station.id,
            'latitude': station.latitude,
            'longitude': station.longitude,
            'last_txid': station.last_txid,
        }
        measurements = []
        for measurement in json.loads(station.data)['measurements']:
            if measurement['parameter'] in parameters or len(parameters) == 0:
                if unit == None or \
                    (measurement['unit'] == 'ppm' and unit == 'ppm') or \
                        (measurement['unit'] != 'ppm' and unit == 'ug/m3') or \
                        (unit != 'ppm' and unit != 'ug/m3'):
                    measurements.append(measurement)
                elif measurement['unit'] != 'ppm':
                    measurement['value'] = convert_ugm3_to_ppm(measurement['parameter'], measurement['value'])
                    measurement['unit'] = 'ppm'
                    measurements.append(measurement)
                else:
                    measurement['value'] = convert_ppm_to_ugm3(measurement['parameter'], measurement['value'])
                    measurement['unit'] = '\\u00b5g/m\\u00b3'
                    measurements.append(measurement)
        if len(measurements) > 0:
            station_data['measurements'] = measurements
            if aqi:
                station_data['aqi'] = get_aqi_of_station(measurements)
            data.append(station_data)

    if limit is not None and limit >= 0:
        log.info("Result: %d records" % limit)
        return data[:limit]
    log.info("Result: %d records" % (len(data)))
    return data
