import json
import os
import sys
from time import sleep

import requests

sys.path.insert(0, os.path.abspath('..'))

from api import app
from api.bigchain import bdb_helper, airmate_keys
from api.db import Station, db
from station_adapter import MinimaxStationAdapter


class _RequestHelper():
    _BASE_API = 'https://pkcup.ru/index.php?module=ws&format=json&v=1.0'
    _AUTH_URL = _BASE_API + '&method=authorize&login={login}&password={password}'
    _DATA_URL = _BASE_API + '&method=meteo.getLastData&id={station_id}&auth_token={auth_token}'

    def __init__(self, login, password):
        self.login = login
        self.password = password
        self.auth_token = None
        self._authorize()

    def _authorize(self):
        request_url = _RequestHelper._AUTH_URL.format(login=self.login, password=self.password)
        json_data = self._do_request(request_url)
        self.auth_token = json_data['responseBody']['auth_token']

    def get_last_data(self, station_id):
        request_url = _RequestHelper._DATA_URL.format(station_id=station_id, auth_token=self.auth_token)
        return self._do_request(request_url, retry_auth=True)

    def _do_request(self, request_url, retry_auth=False):
        result = requests.get(request_url)
        result.raise_for_status()
        json_data = result.json()

        if json_data['responseCode'] == 0:
            return json_data

        if json_data['responseCode'] == 4 and retry_auth:
            self._authorize()
            return self._do_request(request_url)

        raise RuntimeError(json_data)


if __name__ == '__main__':
    request_helper = _RequestHelper(login=os.getenv('PKCUP_LOGIN'), password=os.getenv('PKCUP_PASSWORD'))
    data_src = 'minimax_data_src.json'
    with app.app_context():
        while True:
            with open(data_src) as src:
                data = json.load(src)

            for station_id in map(lambda x: x['station_id'], data):
                json_data = request_helper.get_last_data(station_id)
                station_adapter = MinimaxStationAdapter(json_data)

                for station in station_adapter.get_stations():
                    stored_station = Station.query.get(station.id)
                    if stored_station is not None:
                        if stored_station.updated_at == station.updated_at:
                            continue

                        stored_station.updated_at = station.updated_at
                    else:
                        db.session.add(station)
                        stored_station = station

                    txid = bdb_helper.save({'data_provider': 'minimax'}, station.data,
                                           airmate_keys.public_key,
                                           airmate_keys.private_key)

                    stored_station.last_txid = txid
                    db.session.commit()

                    print(f'Station with id={station.id} updated.')

            sleep(60)
