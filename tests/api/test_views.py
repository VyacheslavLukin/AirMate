import unittest
import json
from data_layer.start_api import api


class ViewsTest(unittest.TestCase):
    def setUp(self):
        self.app = api.test_client()

    def test_get_sensor_data(self):


        resp = self.app.get('/get_sensor_data/1')

        result = json.loads(resp.data.decode('utf-8'))
