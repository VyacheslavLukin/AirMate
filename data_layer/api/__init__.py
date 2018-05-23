from flask import Flask
from flask_sqlalchemy import SQLAlchemy

POSTGRES = {
    'user': 'airmate',
    'pw': 'airpass',
    'db': 'airmate',
    'host': 'postgres',
    'port': '5432',
}

api = Flask(__name__)
api.config["SQLALCHEMY_DATABASE_URI"] = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES
db = SQLAlchemy(api)

from data_layer.api import views