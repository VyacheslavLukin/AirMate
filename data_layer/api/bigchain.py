from bigchaindb_driver import BigchainDB
from bigchaindb_driver.crypto import generate_keypair


from .config import BIGCHAIN_URL
from .aqi import *
import json
import datetime

import logging
log = logging.getLogger('BigchainDB')

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
        """
        :param transaction_id: The id of transaction in BigchainDB
        :return: Transaction
        """
        return self.bdb.transactions.retrieve(transaction_id)

    def search(self, string):
        """
        :param string: string to search
        :return: all transactions containing such string
        """
        return self.bdb.assets.get(search=string)
    
    def filter_by_id(self, id):
        """
        Fetch all transactions made by station
        :param id: Station id
        :return: Transactions where location = id
        """
        log.info("Request for all records from station with id = %s" % (id))
        history = self.bdb.assets.get(search=id)
        log.info("Result: %d records" % (len(history)))
        return  [
            json.loads(record['data']['station_data'])
            for record in history
            if json.loads(record['data']['station_data'])['location'] == id
        ]

    def filter_data(self, id, aqi = False, parameters = [], date = None, limit = None):
        """
        Filter all transactions made by station
        :param id: Station id
        :param aqi: True/False if calculation needed, not required
        :param parameters: List of strings, not required
        :param date: Dict with 'from' and/or 'to' keys with values as 2019-07-04T09:00:00.000Z, not required
        :param limit: The number of raws to return, not required
        :return: All transactions which match defined filters
        """
        log.info("Filters received:{ id: %s, aqi: %r, parameters: %s, date bounds: %s, limit: %s}" %
                 (id, aqi, str(parameters), (json.dumps(date) or 'not defined'),
                  (limit or 'not defined')))
        raw_data = self.filter_by_id(id)
        data = []
        for record in raw_data:
            measurements = [
                measurement
                for measurement in record['measurements']
                if ((measurement['parameter'] in parameters or len(parameters) == 0 ) and (date is None or
                   ((not('from' in date) or datetime.datetime.strptime(date['from'], '%Y-%m-%dT%H:%M:%S.%fZ') <= datetime.datetime.strptime(measurement['lastUpdated'], '%Y-%m-%dT%H:%M:%S.%fZ')) and
                    (not('to' in date) or datetime.datetime.strptime(measurement['lastUpdated'], '%Y-%m-%dT%H:%M:%S.%fZ') <= datetime.datetime.strptime(date['to'], '%Y-%m-%dT%H:%M:%S.%fZ')))))
            ]
            if len(measurements) > 0:
                element = {
                        'measurements':measurements
                    }
                if aqi:
                    element['aqi'] = get_aqi_of_station(measurements)
                    
                data.append(element)
        log.info("After filters: %d records" % (len(data)))
        return data
            

bdb = BigchainDB(BIGCHAIN_URL,
                 headers={'app_id': 'openaq_id', 'app_key': 'openaq_key'})
bdb_helper = BigchainHelper(bdb)
airmate_keys = generate_keypair()

