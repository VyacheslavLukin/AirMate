import json

from flask import Response, Blueprint, abort

from .db import Station
from .bigchain import bdb_helper

api = Blueprint('api', __name__)


@api.route('/get_station_data/<station_id>')
def get_station_data(station_id):
    station = Station.query.get(station_id)
    if station is None:
        abort(404)

    transaction = bdb_helper.retrieve(station.last_txid)
    resp = Response(transaction['asset']['data']['station_data'], status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp


@api.route('/get_station_history/<station_id>')
def get_station_history(station_id):
    # get station from postgres
    station = Station.query.get(station_id)
    if station is None:
        abort(404)

    # get the transaction mentioned in postgres
    transaction = bdb_helper.retrieve(station.last_txid)

    # retrieve the location information
    location = transaction['asset']['data']['station_data']['location']

    # get all instances related to this location
    history = bdb_helper.search(string=location)

    data = [asset['data']['station_data'] for asset in history]

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp


@api.route('/get_data_by_date/<date>')
def get_data_by_date(date):

    # date example: 2019-05-22T10:00:00.000Z
    row_data = bdb_helper.search(string=date)
    data = [asset['data']['station_data'] for asset in row_data]

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp

@api.route('/get_stations_list')
def get_stations_list():
    stations = get_list_of_available_stations()
    resp = Response(json.dumps(stations), status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp



def get_list_of_available_stations():
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
