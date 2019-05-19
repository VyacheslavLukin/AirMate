from flask import Flask
from flask_migrate import Migrate

from .db import db
from .views import api


def create_app(config=None):
    app = Flask(__name__)
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


app = create_app('config.py')
