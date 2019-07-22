import unittest
import json
from data_layer.api.converter import *
from data_layer.api.aqi import *


class TestMathMethods(unittest.TestCase):

    def test_converter(self):
        with open('ppm_and_ugm3.json') as f:
            tests = json.load(f)
        for test in tests:
            result = convert_ppm_to_ugm3(test['parameter'], test['ppm'])
            answer = test['ug/m3']
            self.assertTrue(result - answer < 0.0000001)

            result = convert_ugm3_to_ppm(test['parameter'], test['ug/m3'])
            answer = test['ppm']
            self.assertTrue(result - answer < 0.0000001)

    def test_parameter_aqi(self):
        with open('parameter_aqi.json') as f:
            tests = json.load(f)
        for test in tests:
            result = get_aqi_of_parameter(test)
            self.assertTrue(result['value'] == test['aqi'] and result['text'] == test['text'])
