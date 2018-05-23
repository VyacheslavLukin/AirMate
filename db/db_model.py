from data_layer.api import db


class Openaq(db.Model):
    __tablename__ = 'openaq_data'

    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.Integer, nullable=False)
    transaction_id = db.Column(db.String, nullable=False)
    update_time = db.Column(db.DateTime, nullable=False)

    def __init__(self, sensor_id, transaction_id, update_time):
        self.sensor_id = sensor_id
        self.transaction_id = transaction_id
        self.update_time = update_time

    def __repr__(self):
        return '<sensor_id {}'.format(self.sensor_id)


class Sensor(db.Model):
    __tablename__ = "sensors"

    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    measures = db.Column(db.JSON)

    def __init__(self, latitude, longitude, measure):
        self.latitude = latitude
        self.longitude = longitude
        self.measures = measure

    def __repr__(self):
        return '<sensor_id {}'.format(self.id)
