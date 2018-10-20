import requests
import json
import os
from datetime import datetime
from time import sleep
from data_layer.api import db
from db.db_model import Openaq
from db.db_model import Sensor
from sqlalchemy import desc

from data_layer.sensors_management import add_sensor
from bigchaindb_driver import BigchainDB
from bigchaindb_driver.crypto import generate_keypair
from data_layer.third_party.openaq import OpenaqInterface

bdb_root_url = 'http://172.17.0.1:9984'
tokens = {'app_id': 'openaq_id', 'app_key': 'openaq_key'}
bdb = BigchainDB(bdb_root_url, headers=tokens)

url = "https://api.openaq.org/v1/latest"
airmate = generate_keypair()


def get_latest_data(country, city):
    api_request = "https://api.openaq.org/v1/latest?country=" + country + \
                  "&city=" + city
    raw_data = requests.get(api_request)
    json_data = raw_data.json()
    results = list()
    for location_record in json_data['results']:
        results.append(OpenaqInterface(name=location_record["location"],
                                       city=location_record["city"],
                                       country=location_record['country'],
                                       coordinates=location_record['coordinates'],
                                       measurements=location_record['measurements'])
                       )
    return results


def save_to_bigchain(data):
    metadata = {'data_provider': 'openaq'}
    sensor = {
        'data': {
            'location': data.to_json()
        }
    }
    prepared_creation_tx = bdb.transactions.prepare(
        operation='CREATE',
        signers=airmate.public_key,
        asset=sensor,
        metadata=metadata,
    )

    fulfilled_creation_tx = bdb.transactions.fulfill(
        prepared_creation_tx, private_keys=airmate.private_key)

    bdb.transactions.send(fulfilled_creation_tx)
    txid = fulfilled_creation_tx['id']

    return txid


def save_to_postgres(provider, sensor_id, txid):
    record = Openaq.query.filter_by(sensor_id=sensor_id).first()
    if record:
        record.transaction_id = txid
        record.update_time = datetime.utcnow()
        db.session.commit()
    else:
        try:
            bdb_transaction = Openaq(sensor_id, txid, datetime.utcnow())
            db.session.add(bdb_transaction)
            db.session.commit()
        except Exception as e:
            print("Unable to save transaction ", txid)
            raise
        else:
            return True
    return True


def retrieve_from_bigchain(sensor_id):
    openaq_record = Openaq.query.order_by(desc(Openaq.update_time)).filter_by(sensor_id=sensor_id).first()
    postgresdb_record = Sensor.query.filter_by(sensor_id=sensor_id).first()
    bdb_record = bdb.transactions.retrieve(openaq_record.transaction_id)
    return json.dumps({
        "longitude": postgresdb_record.longitude,
        "latitude": postgresdb_record.latitude,
        "transaction": openaq_record.transaction_id,
        "timestamp": str(openaq_record.update_time),
        "measures": bdb_record['asset'],
    })


def get_list_of_available_sensors():
    sensors = Sensor.query.all()
    result = list()
    for item in sensors:
        single_item = dict()
        single_item['id'] = item.sensor_id
        single_item['latitude'] = item.latitude
        single_item['longitude'] = item.longitude
        result.append(single_item)
    return json.dumps(result)


if __name__ == '__main__':
    available_sensors_list = [x.sensor_id for x in Sensor.query.all()]
    while True:
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'third_party', 'data_src.json'), 'r') as src:
            country_city = json.load(src)

        for sCountry, lCities in country_city:
            for sCity in lCities:
                print(sCity, lCities)
                city_data = get_latest_data(country=sCountry, city=sCity)
                print(city_data)
                for location in city_data:
                    txid = save_to_bigchain(location)
                    sensor_id = location.location
                    print(sensor_id)
                    if sensor_id not in available_sensors_list:
                        add_sensor(sensor_id,
                                   latitude=location.coordinates['latitude'],
                                   longitude=location.coordinates['longitude'])
                    if save_to_postgres(provider="openaq", sensor_id=sensor_id, txid=txid):
                        print("Saved data for city={},  sensor_id={}, with transaction={}".format(
                            sCity, sensor_id, txid))
                    sleep(10)
