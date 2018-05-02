from flask import Flask

api = Flask(__name__)
from data_layer.api import views