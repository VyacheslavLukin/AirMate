from data_layer.api import db
from data_layer.api.db_model import Openaq

# create the database and the database table
db.create_all()