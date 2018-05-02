from bigchaindb_driver import BigchainDB
from bigchaindb_driver.crypto import generate_keypair

bdb_root_url = 'http://localhost:9984'
bdb = BigchainDB(bdb_root_url)
tokens = {'app_id': 'your_app_id', 'app_key': 'your_app_key'}
bdb = BigchainDB(bdb_root_url, headers=tokens)

bicycle = {
    'data': {
        'bicycle': {
            'serial_number': 'abcd1234',
            'manufacturer': 'bkfab',
        },
    },
}

alice, bob = generate_keypair(), generate_keypair()
metadata = {'planet': 'earth'}
prepared_creation_tx = bdb.transactions.prepare(
    operation='CREATE',
    signers=alice.public_key,
    asset=bicycle,
    metadata=metadata,
)
print(prepared_creation_tx)

fulfilled_creation_tx = bdb.transactions.fulfill(
    prepared_creation_tx, private_keys=alice.private_key)

print(fulfilled_creation_tx)

sent_creation_tx = bdb.transactions.send(fulfilled_creation_tx)

print(sent_creation_tx == fulfilled_creation_tx)
txid = fulfilled_creation_tx['id']
print(txid)

creation_tx = bdb.transactions.retrieve(txid)
asset_id = creation_tx['id']
transfer_asset = {
    'id': asset_id,
}

output_index = 0
output = creation_tx['outputs'][output_index]

transfer_input = {
    'fulfillment': output['condition']['details'],
    'fulfills': {
        'output_index': output_index,
        'transaction_id': creation_tx['id'],
    },
    'owners_before': output['public_keys'],
}

prepared_transfer_tx = bdb.transactions.prepare(
    operation='TRANSFER',
    asset=transfer_asset,
    inputs=transfer_input,
    recipients=bob.public_key,
)

fulfilled_transfer_tx = bdb.transactions.fulfill(
    prepared_transfer_tx,
    private_keys=alice.private_key,
)

sent_transfer_tx = bdb.transactions.send(fulfilled_transfer_tx)

print(fulfilled_transfer_tx['outputs'][0]['public_keys'][0] == bob.public_key)
