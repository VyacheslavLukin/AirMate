from data_layer.api import api
from data_layer.api import db
db.create_all()
api.run(debug=True, host='0.0.0.0')
