import requests
from datetime import datetime
from time import sleep
from data_layer.api import db
from data_layer.api.db_model import Openaq

from bigchaindb_driver import BigchainDB
from bigchaindb_driver.crypto import generate_keypair

bdb_root_url = 'http://172.17.0.1:9984'
bdb = BigchainDB(bdb_root_url)
tokens = {'app_id': 'openaq_id', 'app_key': 'openaq_key'}
bdb = BigchainDB(bdb_root_url, headers=tokens)

url = "https://api.openaq.org/v1/latest"
airmate = generate_keypair()


def get_latest_data(country, location):
    api_request = "https://api.openaq.org/v1/latest?country=" + country + \
                  "&location=" + location
    raw_data = requests.get(api_request)
    json_data = raw_data.json()
    return json_data['results']


def save_to_bigchain(data):
    metadata = {'data_provider': 'openaq'}
    sensor = {
        'data': {
            'sensor': data
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
    bdb_transaction = Openaq(sensor_id, txid, datetime.utcnow())
    try:
        db.session.add(bdb_transaction)
        db.session.commit()
    except:
        print("Unable to save transaction ", txid)
        raise
    else:
        return True


def retrieve_from_bigchain(sensor_id):
    db_record = Openaq.query.filter_by(sensor_id=sensor_id).first()
    print("db_record - {}".format(db_record))
    txid = db_record[1]
    print("txid = {}".format(txid))
    return bdb.transactions.retrieve(txid)


if __name__ == '__main__':
    while True:
        measurement = get_latest_data(country="RU", location="Гобелевская")
        txid = save_to_bigchain(measurement)
        sensor_id = 1
        if save_to_postgres(provider="openaq", sensor_id=sensor_id, txid=txid):
            print("Saved data for sensor_id={}, with transaction={}".format(sensor_id, txid))
        sleep(10)
