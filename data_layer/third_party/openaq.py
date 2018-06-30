import copy
from datetime import datetime
import json


class OpenaqInterface:

    def __init__(self, name, country, city, coordinates, measurements):
        """

        :param name: unique location name
        :param country: country name
        :param city: string with city name
        :param coordinates: dict with longitude and latitude
        :param measurements: is a dict:
            {
                parameter: [co2, pm2.5/10, no2 ...]
                value:
                unit:
                source:
            }
        """
        self.location = name
        self.country = country
        self.city = city
        self.measurements = self._set_measures(measurements)
        self.coordinates = coordinates
        self.last_update = self.find_latest()

    @staticmethod
    def _set_measures(measurements):
        result = list()
        measures = copy.deepcopy(measurements)
        for item in measures:
            single_measurement = dict()
            item.pop('averagingPeriod', None)
            source = item.pop('sourceName', None)
            single_measurement['source'] = source
            single_measurement.update(item)
            result.append(single_measurement)
        return result

    def find_latest(self):
        time_list = list()
        for record in self.measurements:
            time_list.append(datetime.strptime(record['lastUpdated'], "%Y-%m-%dT%H:%M:%S.%fZ"))
        sorted(time_list)
        return datetime.strftime(time_list[0], "%Y-%m-%dT%H:%M:%S.%fZ")

    def to_json(self):
        return json.dumps({
            'location': self.location,
            'country': self.country,
            'city': self.city,
            'latitude': self.coordinates['latitude'],
            'longitude': self.coordinates['longitude'],
            'measures': self.measurements
        })