from pymongo import MongoClient

# initialization of database
mongo_client = MongoClient('mongodb://mongodb:27017')
mongo_db = mongo_client['bigchain']


class MongoRepository:

    def __init__(self, collection_name):
        self._db = mongo_db
        self._collection = mongo_db[collection_name]

    def get_by_transaction_id(self, tx_id):
        """
        Returns sensor by sensor id
        :param tx_id: str or ObjectId, id of document in mongo
        :return: dict - mongo document
        """
        result = self._collection.find_one({'id': ObjectId(tx_id)})
        return result

