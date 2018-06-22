from data_layer.api import api
from data_layer.openaq_watchdog import retrieve_from_bigchain, get_list_of_available_sensors


@api.route('/get_sensor_data/<sensor_id>')
def get_sensor_data(sensor_id):
    return retrieve_from_bigchain(sensor_id)


@api.route('/get_sensors_list')
def get_sensors_list():
    return get_list_of_available_sensors()

