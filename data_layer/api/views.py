from data_layer.api import api
from data_layer.openaq_watchdog import retrieve_from_bigchain, get_list_of_available_sensors
from flask import Response


@api.route('/get_sensor_data/<sensor_id>')
def get_sensor_data(sensor_id):
    resp = Response(retrieve_from_bigchain(sensor_id),
                    status=200,
                    mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp


@api.route('/get_sensors_list')
def get_sensors_list():
    resp = Response(get_list_of_available_sensors(),
                    status=200,
                    mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp

