import requests
from time import sleep

from bigchaindb_driver import BigchainDB
from bigchaindb_driver.crypto import generate_keypair

bdb_root_url = 'http://localhost:9984'
bdb = BigchainDB(bdb_root_url)
tokens = {'app_id': 'openaq_id', 'app_key': 'openaq_key'}
bdb = BigchainDB(bdb_root_url, headers=tokens)

url = "https://api.openaq.org/v1/latest"
airmate = generate_keypair()


def get_data():
    api_request = "https://api.openaq.org/v1/latest?country=RU&location=Глебовская"
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


def retrieve_from_bigchain(txid):
    return bdb.transactions.retrieve(txid)


if __name__ == '__main__':
    txid = save_to_bigchain(get_data())
    sleep(5)
    data = retrieve_from_bigchain(txid)
    print(data)
