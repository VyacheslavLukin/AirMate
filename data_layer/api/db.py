import datetime
import json

from flask_sqlalchemy import SQLAlchemy
from flask import abort
from .aqi import *

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
    station = Station.query.get(id)
    if station is None:
        return False
    return True


def get_list_of_stations():
    stations = Station.query.all()
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
    stations = Station.query.all()
    params = []
    for station in stations:
        for measurement in json.loads(station.data)['measurements']:
            if not (measurement['parameter'] in params):
                params.append(measurement['parameter'])
    return [
        parameter for parameter in params
    ]


def get_station_data(id):
    station = Station.query.get(id)
    if station is None:
        abort(404)

    return json.loads(station.data)


def get_stations_data(aqi = False, parameters=[], coordinates = {}, limit = -1):
    stations = Station.query.all()
    if 'latitude' in coordinates.keys() and 'longitude' in coordinates.keys():
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
        measurements = [
            measurement
            for measurement in json.loads(station.data)['measurements']
            if measurement['parameter'] in parameters or len(parameters) == 0
        ]
        if len(measurements) > 0:
            station_data['measurements'] = measurements
            if aqi:
                station_data['aqi'] = get_aqi_of_station(measurements)
            data.append(station_data)
    
    if limit >=0:
        return data[:limit]
    return data
