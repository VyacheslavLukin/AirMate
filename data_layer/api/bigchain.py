from bigchaindb_driver import BigchainDB
from bigchaindb_driver.crypto import generate_keypair


from .config import BIGCHAIN_URL
from .aqi import *
import json
import datetime


class BigchainHelper:
    def __init__(self, bdb: BigchainDB) -> None:
        self.bdb = bdb

    def save(self, metadata: dict, data: dict, public_key: str, private_key: str) -> str:
        tx = self.bdb.transactions.prepare(
            operation='CREATE',
            signers=public_key,
            asset={
                'data': {
                    'station_data': data
                }
            },
            metadata=metadata,
        )
        signed_tx = self.bdb.transactions.fulfill(
            tx,
            private_keys=private_key
        )
        self.bdb.transactions.send_commit(signed_tx)

        return signed_tx['id']

    def retrieve(self, transaction_id):
        return self.bdb.transactions.retrieve(transaction_id)

    def search(self, string):
        return self.bdb.assets.get(search=string)
    
    def filter_by_id(self, id):
        history = self.bdb.assets.get(search=id)
        return  [
            json.loads(record['data']['station_data'])
            for record in history
            if json.loads(record['data']['station_data'])['location'] == id
        ]

    def filter_data(self, id, aqi = False, parameters = [], date = {}, limit = -1):
        raw_data = self.filter_by_id(id)
        data = []
        for record in raw_data:
            measurements = [
                measurement
                for measurement in record['measurements']
                if ((measurement['parameter'] in parameters or len(parameters) == 0 ) and (len(date) == 0 or
                   (datetime.datetime.strptime(date['from'], '%Y-%m-%dT%H:%M:%S.%fZ') <= datetime.datetime.strptime(measurement['lastUpdated'], '%Y-%m-%dT%H:%M:%S.%fZ') and
                   datetime.datetime.strptime(measurement['lastUpdated'], '%Y-%m-%dT%H:%M:%S.%fZ') <= datetime.datetime.strptime(date['to'], '%Y-%m-%dT%H:%M:%S.%fZ'))))
            ]
            if len(measurements) > 0:
                element = {
                        'measurements':measurements
                    }
                if aqi:
                    element['aqi'] = get_aqi_of_station(measurements)
                    
                data.append(element)
        return data
            

bdb = BigchainDB(BIGCHAIN_URL,
                 headers={'app_id': 'openaq_id', 'app_key': 'openaq_key'})
bdb_helper = BigchainHelper(bdb)
airmate_keys = generate_keypair()

