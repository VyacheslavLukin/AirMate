from bigchaindb_driver import BigchainDB
from bigchaindb_driver.crypto import generate_keypair

from .config import BIGCHAIN_URL


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


bdb = BigchainDB(BIGCHAIN_URL,
                 headers={'app_id': 'openaq_id', 'app_key': 'openaq_key'})
bdb_helper = BigchainHelper(bdb)
airmate_keys = generate_keypair()
