import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Station(db.Model):
    id = db.Column(db.String, nullable=False, primary_key=True)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    data = db.Column(db.String, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)
    last_txid = db.Column(db.String, nullable=False)

    def __repr__(self):
        return '<station with id={}>'.format(self.id)
