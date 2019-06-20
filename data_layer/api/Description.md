#Description for "AirMate/data_layer/api"

### Methods
#### GET /get_station_data/<station_id> - get the latest data from this station
#### GET /get_nearest_station_data/`<latitude>`/`<longitude>` - get the data from nearest station

##### Reponse
```
{
    "location":"Some location",
    "city":"Some city",
    "country":"Some country",
    "measurements":
    [
        {
            "parameter":"no2", 
            "value": 10.43
            "lastUpdated": 2019-05-27T01:00:00.000Z,
            "unit": \\u00b5g/m\\u00b3,
            "sourceName": "EEA Germany",
            "averagingPeriod":
                {
                    "value": 1,
                    "unit": "hours"
                }
        }
        {...} //there may be many different sensors
        {...}
    ],
    "coordinates":
        {
            "latitude": 52.485813,
            "longitude": 13.348775
        }
}
```

#### GET /get_station_aqi/<station_id> - get the air quality index of station
```
[
    {
        "id":"Station id",
        
        "latitude": 52.485813,
        "longitude": 13.348775,
        "last_txid": "ef0bf154be5482f5796a147599426a0458ec2e4965b0b3d8bd0c8fa943b4cefb",
        "aqi":
            {
                "value": 15.12619380386676    //aqi value
                "text": "Good"                //the meaning of value
            }
    }
]
```

#### GET /get_station_history/<station_id> - get all transactions related to this station
#### GET /get_data_by_date/<date> - get all transactions containing that date
date example: 2019-05-22T10:00:00.000Z

##### Reponse
```
[
    {
        "location":"Some location",
        "city":"Some city",
        "country":"Some country",
        "measurements":
        [
            {
                "parameter":"no2", 
                "value": 10.43
                "lastUpdated": 2019-05-27T01:00:00.000Z,
                "unit": \\u00b5g/m\\u00b3,
                "sourceName": "EEA Germany",
                "averagingPeriod":
                    {
                        "value": 1,
                        "unit": "hours"
                    }
            }
            {...} //there may be many different sensors
            {...}
        ],
        "coordinates":
            {
                "latitude": 52.485813,
                "longitude": 13.348775
            }
    },
    {...} //there may be many transactions
]
```

#### GET /get_stations_list - get the list of all available stations

```
[
    {
        'id': station.id,
        'latitude': station.latitude,
        'longitude': station.longitude,
        'last_txid': station.last_txid  //id of the last related transaction
    },
    {...} //there may be many stations
]
```

#### GET /get_station_history_filter/<station_id>/<parameter> - get the history of parameter values at some station
```
[
    {
        'value': 12
        'date': '2019-06-06T05:00:00.000Z'
        'unit': 'ppm'
        'sourceName': 'AirNow'
    },
    {...} //there may be many values
]
```
#### GET /stations/<parameter> - get the last measurement of this parameter from all stations
Example based on 'so2':
```
[
        {
            'id': station.id,
            'latitude': station.latitude,
            'longitude': station.longitude,
            'last_txid': station.last_txid,     //id of the last related transaction
            'so2': 0.001,
            'date': '2019-06-06T05:00:00.000Z',
            'unit': 'ppm',
            'sourceName': 'AirNow',
            'aqi':{
                'value': 26,    //aqi value
                'text': 'Good'  //the meaning of value
            }
        }
        {...} //there may be many stations
```

#### GET /get_params_list - get the list of names of all parameters in more usable view
```
[ "o3", "no2", ...]
```

#### GET /get_aqi_by_coordinates/`<latitude>`/`<longitude>` - get AQI value at point on the map by coordinates
```
{
"id": "DEBE056",
"latitude": 52.447697,
"longitude": 13.64705,
"last_txid": "41f26e0def71e1f34b88a763a4129cba8ab16750f9f1afed39b58f4c54c8f21e",
"aqi": {
"value": 16.061728395061728,
"text": "Good"
}
}

```