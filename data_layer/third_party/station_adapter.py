import abc
import json
from datetime import datetime
from typing import List

import pytz

from api.db import Station


class StationAdapter(abc.ABC):
    @abc.abstractmethod
    def get_stations(self):
        pass


class OpenaqSatationAdapter(StationAdapter):
    def __init__(self, data) -> None:
        self.data = data

    def get_stations(self) -> List[Station]:
        for station_data in self.data['results']:
            last_updated = max(map(
                lambda x: datetime.strptime(x['lastUpdated'],
                                            '%Y-%m-%dT%H:%M:%S.%fZ').replace(
                    tzinfo=pytz.utc),
                station_data['measurements']))
            coordinates = station_data.get('coordinates', {'latitude': None, 'longitude': None})
            yield Station(id=str(station_data['location']),
                          latitude=coordinates['latitude'],
                          longitude=coordinates['longitude'],
                          data=json.dumps(station_data),
                          updated_at=last_updated)


class MinimaxStationAdapter(StationAdapter):
    def __init__(self, data) -> None:
        super().__init__()
        self.data = data

    def get_stations(self) -> List[Station]:
        for station_data in self.data['responseBody']:
            yield Station(id=str(station_data['id']),
                          latitude=55.7517167,
                          longitude=48.7516195,
                          data=json.dumps(station_data['data']),
                          updated_at=datetime.strptime(station_data['datetime'],
                                                       "%Y-%m-%dT%H:%M:%S%z").replace(
                              tzinfo=pytz.utc))
