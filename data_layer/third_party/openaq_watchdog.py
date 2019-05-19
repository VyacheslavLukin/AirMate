import json
import os
import sys
from time import sleep

import requests

sys.path.insert(0, os.path.abspath('..'))

from api import app
from api.bigchain import bdb_helper, airmate_keys
from api.db import Station, db
from station_adapter import OpenaqSatationAdapter


if __name__ == '__main__':
    API_URL = 'https://api.openaq.org/v1/latest?country={}&city={}'

    data_src = 'data_src.json'

    with app.app_context():
        while True:
            with open(data_src) as src:
                country_city = json.load(src)

            for sCountry, lCities in country_city.items():
                for sCity in lCities:
                    request_url = API_URL.format(sCountry, sCity)
                    data = requests.get(request_url)
                    json_data = data.json()

                    station_adapter = OpenaqSatationAdapter(json_data)

                    for station in station_adapter.get_stations():

                        if station.latitude is None or station.longitude is None:
                            print(f'Station with id={station.id} has no coordinates.')
                            continue

                        stored_station = Station.query.get(station.id)
                        if stored_station is not None:
                            if stored_station.updated_at == station.updated_at:
                                continue

                            stored_station.updated_at = station.updated_at
                        else:
                            db.session.add(station)
                            stored_station = station

                        txid = bdb_helper.save({'data_provider': 'openaq'}, station.data,
                                               airmate_keys.public_key,
                                               airmate_keys.private_key)

                        stored_station.last_txid = txid
                        db.session.commit()

                        print(f'Station with id={station.id} updated.')

                    sleep(5)
