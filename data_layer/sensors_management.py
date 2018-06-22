from db.db_model import Sensor
from data_layer.api import db


def add_sensor(sensor_id, latitude, longitude):
    new_sensor = Sensor(sensor_id, latitude, longitude)
    db.session.add(new_sensor)
    db.session.commit()
