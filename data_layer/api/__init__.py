from flask import Flask
from flask_sqlalchemy import SQLAlchemy

api = Flask(__name__)
db = SQLAlchemy(api)

from data_layer.api import views