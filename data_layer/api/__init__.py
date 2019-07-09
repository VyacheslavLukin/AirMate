from flask import Flask, Blueprint
from flask_cors import CORS
from flask_migrate import Migrate
import logging
import logging.config

from .db import db
from .views import api
from os import path



def create_app(config=None):
    app = Flask(__name__)
    CORS(app)
    if config is not None:
        app.config.from_pyfile(config)

    register_extensions(app)
    register_blueprints(app)

    return app


def register_extensions(app):
    db.init_app(app)
    Migrate().init_app(app, db)
    pass


def register_blueprints(app):
    app.register_blueprint(api)
    pass

#log_file_path = path.join(path.dirname(path.abspath(__file__)), 'logging.conf')
#logging.config.fileConfig(log_file_path)

import logging.config
from .logs_conf import log_conf


logging.config.dictConfig(log_conf)

app = create_app('config.py')
