import json

from flask import Response, Blueprint, abort, request


from .db import *
from .bigchain import bdb_helper
from .converter import *
from .aqi import *

api = Blueprint('api', __name__)

@api.route('/stations')
def stations_list():
    stations = get_list_of_stations()
    resp = Response(json.dumps(stations), status=200, mimetype='application/json')
    return resp

@api.route('/stations/data')
def stations_data():
    parameters = []
    if 'parameter' in request.args: 
       parameters = request.args.getlist('parameter')
    coordinates = {}
    if 'latitude' in request.args and 'longitude' in request.args:
        coordinates['latitude'] = float(request.args.get('latitude'))
        coordinates['longitude'] = float(request.args.get('longitude'))
    aqi = False
    if 'aqi' in request.args and request.args.get('aqi') == 'true':
        aqi = True
    limit = -1
    if 'limit'in request.args:
        limit = int(request.args.get('limit'))
    data = get_stations_data(aqi, parameters, coordinates, limit)
    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    return resp

@api.route('/stations/aqi')
def get_stations_aqi():
    stations = Station.query.all()
    data = []
    for station in stations:
        measurements = json.loads(station.data)['measurements']
        aqi = get_aqi_of_station(measurements)
        data.append({
            'id': station.id,
            'latitude': station.latitude,
            'longitude': station.longitude,
            'aqi': aqi[0]
        })

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    return resp

#<path:param> for handling "/" in param string
@api.route('/station/<path:id>')
def station_data(id):
    data = get_station_data(id)
    if 'aqi' in request.args and request.args.get('aqi') == 'true':
        aqi = get_aqi_of_station(data['measurements'])
        data["aqi"] = aqi[0]

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    return resp

@api.route('/station/<path:id>/history')
def station_history(id):
    # get station from postgres
    station = Station.query.get(id)
    if station is None:
        abort(404)

    parameters = []
    if 'parameter' in request.args: 
       parameters = request.args.getlist('parameter')
    date = {}
    if 'from' in request.args and 'to' in request.args:
        date['from'] = request.args.get('from')
        date['to'] = request.args.get('to')
    aqi = False
    if 'aqi' in request.args and request.args.get('aqi') == 'true':
        aqi = True
    limit = -1
    if 'limit'in request.args:
        limit = int(request.args.get('limit'))

    # get all instances related to this station
    data =  bdb_helper.filter_data(id,aqi,parameters,date,limit)

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    return resp

@api.route('/station/<path:id>/aqi')
def station_aqi(id):
    data = get_station_data(id)
    aqi = get_aqi_of_station(data['measurements'])
    resp = Response(json.dumps(aqi), status=200, mimetype='application/json')
    return resp

# Return list of exists parameters: ["o3","no2", ...]
@api.route('/stations/parameters')
def parameters_list():
    params = get_list_of_parameters()
    resp = Response(json.dumps(params), status=200, mimetype='application/json')
    return resp






