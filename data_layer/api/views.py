from data_layer.api import api
import json


@api.route('/get_sensor_data/<sensor_id>')
def get_sensor_data(sensor_id):
    return json.dumps(
        {
            "longitude": 55.7517163,
            "latitude": 48.747309,
            "data": {
                "transaction":
                    "12434",
                "timestamp": "12:45",
                "co2": 1.0
            }
        }
    )
