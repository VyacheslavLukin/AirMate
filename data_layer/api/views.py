import json

from flask import Response, Blueprint, abort

from .db import Station
from .bigchain import bdb_helper

api = Blueprint('api', __name__)

#<path:param> for handling "/" in param string
@api.route('/get_station_data/<path:station_id>')
def get_station_data(station_id):
    station = Station.query.get(station_id)
    if station is None:
        abort(404)

    transaction = bdb_helper.retrieve(station.last_txid)
    data = json.loads(transaction['asset']['data']['station_data'])
    aqi = get_aqi_of_station(data['measurements'])
    data["aqi"] = aqi[0]

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin' \
                 ''] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp

@api.route('/get_station_aqi/<path:station_id>')
def get_station_aqi(station_id):
    station = Station.query.get(station_id)
    if station is None:
        abort(404)

    aqi = get_aqi_of_station(json.loads(station.data)['measurements'])
    data = [
        {
            'id': station.id,
            'latitude': station.latitude,
            'longitude': station.longitude,
            'last_txid': station.last_txid,
            'aqi': aqi[0]
        }
    ]
    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp

@api.route('/get_station_history/<path:station_id>')
def get_station_history(station_id):
    # get station from postgres
    station = Station.query.get(station_id)
    if station is None:
        abort(404)

    # create search string
    search_string = station_id

    # get all instances related to this station
    history = bdb_helper.search(string=search_string)
    data = [
        record['data']['station_data']
        for record in history
        if json.loads(record['data']['station_data'])['location'] == station_id
    ]

    # search_string = str(station.latitude)+' '+str(station.longitude)
    #
    # # get all instances related to this location
    # history = bdb_helper.search(string=search_string)
    #
    # # get correct transactions (they will be the first ones)
    # data = []
    # for record in history:
    #
    #     station_data = json.loads(record['data']['station_data'])
    #
    #     if(abs(station_data['coordinates']['latitude'] - station.latitude) < 0.000001) and\
    #             (abs(station_data['coordinates']['longitude'] - station.longitude) < 0.000001):
    #         data.append(record['data']['station_data'])
    #     else:
    #         break

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp


@api.route('/get_station_history_filter/<path:station_id>/<parameter>')
def get_station_history_of_parameter(station_id, parameter):
    # get station from postgres
    station = Station.query.get(station_id)
    if station is None:
        abort(404)

    # create search string
    search_string = station_id

    # get all instances related to this station
    history = bdb_helper.search(string=search_string)
    data = [
        {
            'value': measurement['value'],
            'date': measurement['lastUpdated'],
            'unit': measurement['unit'],
            'sourceName': measurement['sourceName']
        }
        for record in history
        for measurement in json.loads(record['data']['station_data'])['measurements']
        if
        measurement['parameter'] == parameter and json.loads(record['data']['station_data'])['location'] == station_id
    ]

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


@api.route('/stations/<parameter>')
def get_stations_data_by_parameter(parameter):
    data = get_list_of_stations_with_data(parameter)
    for i in range(len(data)):
        if data[i]['unit'] == 'ppm':
            data[i][parameter] = convert_ppm_to_ugm3(parameter, data[i][parameter])
            data[i]['unit'] = '\\u00b5g/m\\u00b3'
    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp

@api.route('/stations/aqi')
def get_stations_aqi():
    stations = Station.query.all()
    data = []
    step = 0
    for station in stations:
        transaction = bdb_helper.retrieve(station.last_txid)
        aqi = get_aqi_of_station(json.loads(transaction['asset']['data']['station_data'])['measurements'])
        data.append({
            'id': station.id,
            'latitude': station.latitude,
            'longitude': station.longitude,
            'aqi': aqi[0]
        })
        step+=1
        print(step)

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp



# Return list of exists parameters: ["o3","no2", ...]
@api.route('/get_params_list')
def get_params_list():
    params = get_list_of_parameters()
    resp = Response(json.dumps(params), status=200, mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,content-type'
    resp.headers['Access-Control-Allow-Credentials'] = True
    return resp

@api.route('/get_aqi_by_coordinates/<latitude>/<longitude>')
def get_AQI_by_coordinates(latitude, longitude):
    station = get_nearest_station(latitude, longitude)
    if station is None:
        abort(404)
    transaction = bdb_helper.retrieve(station.last_txid)

    aqi = get_aqi_of_station(json.loads(transaction['asset']['data']['station_data'])['measurements'])
    data = [
        {
            'id': station.id,
            'latitude': station.latitude,
            'longitude': station.longitude,
            'last_txid': station.last_txid,
            'aqi': aqi[0]
        }
    ]

    resp = Response(json.dumps(data), status=200, mimetype='application/json')
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


def get_list_of_stations_with_data(parameter):
    stations = Station.query.all()
    return [
        {
            'id': station.id,
            'latitude': station.latitude,
            'longitude': station.longitude,
            'last_txid': station.last_txid,
            parameter: measurement['value'],
            'date': measurement['lastUpdated'],
            'unit': measurement['unit'],
            'sourceName': measurement['sourceName'],
            'aqi': get_aqi_of_parameter(parameter, measurement['value'], measurement['unit'])[0]
        }
        for station in stations
        for measurement in json.loads(station.data)['measurements']
        if measurement['parameter'] == parameter
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


def convert_ppm_to_ugm3(parameter, ppm_value):
    # The formula used : μg/m3 = ppm / (Vm/M) * 1000
    # Where Vm is molar volume and M is molar mass

    return ppm_value / (22.4 / get_molar_mass(parameter)) * 1000


def convert_ugm3_to_ppm(parameter, ugm3_value):
    # The formula used : ppm = μg/m3 * (Vm/M) / 1000
    # Where Vm is molar volume and M is molar mass

    return ugm3_value * (22.4 / get_molar_mass(parameter)) / 1000


def get_molar_mass(parameter):
    # define mm (molar mass)
    if parameter == 'no2':
        mm = 518.20206
    elif parameter == 'o3':
        mm = 47.99820
    elif parameter == 'pm10':
        mm = 1449.127490
    elif parameter == 'pm25':
        mm = 3622.818725
    elif parameter == 'so2':
        mm = 64.066
    elif parameter == 'co':
        mm = 58.9331950
    elif parameter == 'bc':
        mm = 12.011
    else:
        mm = 0.001
    return mm


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


def get_aqi_of_parameter(parameter, value, units):
    # I - the (Air Quality) index
    # value - the pollutant concentration
    # c_high - the upper concentration breakpoint
    # c_low - the lower concentration breakpoint
    # i_high - the upper index breakpoint corresponding to c_high
    # i_low - the lower index breakpoint corresponding to c_low

    # Formula used: I = (i_high - i_low)/(c_high-c_low) * (value - c_low) + i_low

    breakpoints = []
    i_bounds = [[0, 50], [51, 100], [101, 150], [151, 200], [201, 300], [301, 400], [401, 500], [501, 999]]
    i_meaning = ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy", "Hazardous",
                 "Hazardous", "Hazardous"]
    if parameter == 'o3':
        breakpoints = [[0, 54], [55, 70], [71, 85], [86, 105], [106, 200], [201, 404], [405, 604], [605, 9999]]
        if units != 'ppm':
            value = convert_ugm3_to_ppm(parameter, value)  # convert to ppm
        value = round(value * 1000)  # convert ppm to ppb

    elif parameter == 'no2':
        breakpoints = [[0, 53], [54, 100], [101, 360], [361, 649], [650, 1249], [1250, 1649], [1650, 2049],
                       [2050, 9999]]
        if units != 'ppm':
            value = convert_ugm3_to_ppm(parameter, value)  # convert to ppm
        value = round(value * 1000)  # convert ppm to ppb

    elif parameter == 'so2':
        breakpoints = [[0, 35], [36, 75], [76, 185], [186, 304], [305, 604], [605, 804], [805, 1004],
                       [1005, 9999]]
        if units != 'ppm':
            value = convert_ugm3_to_ppm(parameter, value)  # convert to ppm
        value = round(value * 1000)  # convert ppm to ppb

    elif parameter == 'pm25':
        breakpoints = [[0, 12], [12.1, 35.4], [35.5, 55.4], [55.5, 150.4], [150.5, 250.4], [250.5, 350.4],
                       [350.5, 500.4], [500.5, 9999]]
        if units == 'ppm':
            value = round(convert_ppm_to_ugm3(parameter, value), 1)  # convert to ugm3

    elif parameter == 'pm10':
        breakpoints = [[0, 54], [55, 154], [155, 254], [255, 354], [355, 424], [425, 504], [505, 604],
                       [605, 9999]]
        if units == 'ppm':
            value = round(convert_ppm_to_ugm3(parameter, value))  # convert to ugm3

    elif parameter == 'co':
        breakpoints = [[0, 4.4], [4.5, 9.4], [9.5, 12.4], [12.5, 15.4], [15.5, 30.4], [30.5, 40.4], [40.5, 50.4],
                       [50.5, 9999]]
        if units != 'ppm':
            value = round(convert_ugm3_to_ppm(parameter, value), 1)  # convert to ppm
    else:
        return [
            {
                "value": 0,
                "text": "Undefined"
            }
        ]

    # define to which sector the concentration correspond to
    sector = 0
    while value > breakpoints[sector][1]:
        sector += 1

    c_high = breakpoints[sector][1]
    c_low = breakpoints[sector][0]
    i_high = i_bounds[sector][1]
    i_low = i_bounds[sector][0]

    I = (i_high - i_low) / (c_high - c_low) * (value - c_low) + i_low

    return [
        {
            "value": I,
            "text": i_meaning[sector]
        }
    ]


def get_aqi_of_station(measurements):
    all_aqis = []
    i_bounds = [[0, 50], [51, 100], [101, 150], [151, 200], [201, 300], [301, 400], [401, 500], [501, 999]]
    i_meaning = ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy", "Hazardous",
                 "Hazardous", "Hazardous"]

    for measurement in measurements:
        if measurement['parameter'] != 'bc':
            aqi = get_aqi_of_parameter(measurement['parameter'], measurement['value'], measurement['unit'])
            all_aqis.append(aqi[0]['value'])
    if len(all_aqis)> 0:
        station_aqi = sum(all_aqis)/len(all_aqis)
        sector = 0
        while station_aqi > i_bounds[sector][1]:
            sector += 1
        return [
            {
                "value": station_aqi,
                "text": i_meaning[sector]
            }
        ]
    else:
        return [
            {
                "value": 0,
                "text": "Undefined"
            }
        ]

