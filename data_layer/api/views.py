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
    resp.headers['Access-Control-Allow-Origin' \
                 ''] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return res


@api.route('/get_station_history/<station_id>')
def get_station_history(station_id):
    # get station from postgres
    station = Station.query.get(station_id)
    if station is None:
        abort(404)

    # create search string
    search_string = str(station.latitude)+' '+str(station.longitude)

    # get all instances related to this location
    history = bdb_helper.search(string=search_string)

    # get correct transactions (they will be the first ones)
    data = []
    for record in history:

        station_data = json.loads(record['data']['station_data'])

        if(abs(station_data['coordinates']['latitude'] - station.latitude) < 0.000001) and\
                (abs(station_data['coordinates']['longitude'] - station.longitude) < 0.000001):
        # if (abs(record['data']['station_data'][len(record['data']['station_data'])-1][0] - station.latitude) < 0.000001) and \
        #         (abs(record['data']['station_data'][len(record['data']['station_data'])-1][1] - station.longitude) < 0.000001):
            data.append(record['data']['station_data'])
        else:
            break

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp


@api.route('/get_nearest_station_data/<latitude>/<longitude>')
def get_nearest_station_data(latitude, longitude):
    station = get_nearest_station(latitude, longitude)
    if station is None:
        abort(404)

    transaction = bdb_helper.retrieve(station.last_txid)
    resp = Response(transaction['asset']['data']['station_data'], status=200, mimetype='application/json')
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


def get_nearest_station(latitude, longitude):

    # stations close by latitude
    station1 = Station.query.filter(Station.latitude > latitude).order_by(Station.latitude.asc()).first()
    station2 = Station.query.filter(Station.latitude <= latitude).order_by(Station.latitude.desc()).first()
    # stations close by longitude
    station3 = Station.query.filter(Station.longitude > longitude).order_by(Station.longitude.asc()).first()
    station4 = Station.query.filter(Station.longitude <= longitude).order_by(Station.longitude.desc()).first()

    candidates = [station1, station2, station3, station4]
    closest_station = station1
    # distance from target point to candidate station
    distance = -1


    # define the closest candidate
    for candidate in candidates:
        temp_distance = pow(candidate.latitude - float(latitude), 2) + pow(candidate.longitude - float(longitude), 2)
        if (distance < 0) or (distance > temp_distance):
            closest_station = candidate

    return closest_station
