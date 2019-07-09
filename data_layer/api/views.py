import json
import logging
import time

from flask import Response, Blueprint, abort, request


from .db import *
from .bigchain import bdb_helper
from .aqi import *

api = Blueprint('api', __name__)


log = logging.getLogger('Views')

@api.route('/stations')
def stations_list():
    start_time = time.time()
    log.info("Request: '/stations'")
    log.info("Requesting the list of stations from Postgres..")
    stations = get_list_of_stations()
    resp = Response(json.dumps(stations), status=200, mimetype='application/json')
    log.info("Response: %s, %s seconds" % (resp.status, time.time() - start_time))
    return resp

@api.route('/stations/data')
def stations_data():
    log.info("Request: '/stations/data' with args: %s" % (json.dumps(request.args)))
    start_time = time.time()
    parameters = []
    if 'parameter' in request.args:
        parameters = request.args.getlist('parameter')
    coordinates = None
    if 'latitude' in request.args and 'longitude' in request.args:
        coordinates = {'latitude': float(request.args.get('latitude')),
                       'longitude': float(request.args.get('longitude'))}
    aqi = False
    if 'aqi' in request.args:
        if request.args.get('aqi') == 'true':
            aqi = True
    limit = None
    if 'limit'in request.args:
        limit = int(request.args.get('limit'))
    unit = None
    if 'unit' in request.args:
        unit = request.args.get('unit')

    data = get_stations_data(aqi, parameters, unit, coordinates, limit)
    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    log.info("Response: %s, %s seconds" % (resp.status, time.time() - start_time))
    return resp

@api.route('/stations/aqi')
def get_stations_aqi():
    log.info("Request: '/stations/aqi'")
    start_time = time.time()
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
    log.info("Result: %d records" % (len(data)))
    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    log.info("Response: %s, %s seconds" % (resp.status, time.time() - start_time))
    return resp


# <path:param> for handling "/" in param string
@api.route('/station/<path:id>')
def station_data(id):
    log.info("Request: '/station/%s'" % id)
    start_time = time.time()
    data = get_station_data(id)
    if 'aqi' in request.args and request.args.get('aqi') == 'true':
        aqi = get_aqi_of_station(data['measurements'])
        data["aqi"] = aqi[0]

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    log.info("Response: %s, %s seconds" % (resp.status, time.time() - start_time))
    return resp

@api.route('/station/<path:id>/history')
def station_history(id):
    # get station from postgres
    log.info("Request: '/station/%s/history'" % id)
    start_time = time.time()
    station = Station.query.get(id)
    if station is None:
        log.error("No station with such id.")
        abort(404)
    log.info("Query arguments: %s" % (json.dumps(request.args)))
    parameters = []
    if 'parameter' in request.args: 
       parameters = request.args.getlist('parameter')
    date = None
    if 'from' in request.args or 'to' in request.args:
        date = {}
        if 'from' in request.args:
            date['from'] = request.args.get('from')
        if 'to' in request.args:
            date['to'] = request.args.get('to')
    aqi = False
    if 'aqi' in request.args and request.args.get('aqi') == 'true':
        aqi = True
    limit = None
    if 'limit'in request.args:
        limit = int(request.args.get('limit'))

    # get all instances related to this station
    data =  bdb_helper.filter_data(id,aqi,parameters,date,limit)

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    log.info("Response: %s, %s seconds" % (resp.status, time.time() - start_time))
    return resp

@api.route('/station/<path:id>/aqi')
def station_aqi(id):
    log.info("Request: '/station/%s/aqi'" % id)
    start_time = time.time()
    data = get_station_data(id)
    aqi = get_aqi_of_station(data['measurements'])
    resp = Response(json.dumps(aqi), status=200, mimetype='application/json')
    log.info("Response: %s, %s seconds" % (resp.status, time.time() - start_time))
    return resp

# Return list of exists parameters: ["o3","no2", ...]
@api.route('/stations/parameters')
def parameters_list():
    log.info("Request: '/stations/parameters'")
    start_time = time.time()
    params = get_list_of_parameters()
    resp = Response(json.dumps(params), status=200, mimetype='application/json')
    log.info("Response: %s, %s seconds" % (resp.status, time.time() - start_time))
    return resp






