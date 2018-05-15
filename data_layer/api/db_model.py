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
