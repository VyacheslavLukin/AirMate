import os
from pathlib import Path

from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / '..' / '.env'
load_dotenv(dotenv_path=env_path, verbose=True)

POSTGRES = {
    'user': 'airmate',
    'pw': 'airpass',
    'db': 'airmate',
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': '5432',
}
SQLALCHEMY_DATABASE_URI = 'postgresql://%(user)s:%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES
SQLALCHEMY_TRACK_MODIFICATIONS = False
BIGCHAIN_URL = os.getenv('BIGCHAIN_URL')
