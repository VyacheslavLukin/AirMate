#Description for "AirMate/data_layer/api"

### Methods
#### GET /get_station_data/<station_id> - get the latest data from this station
#### GET /get_nearest_station_data/<latitude>/<longitude> - get the data from nearest station

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

#### GET /get_station_history/<station_id> - get all transactions related to this station
#### GET /get_data_by_date/<date> - get all transactions containing that date
date example: 2019-05-22T10:00:00.000Z

##### Reponse
```
[{
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
[{
    'id': station.id,
    'latitude': station.latitude,
    'longitude': station.longitude,
    'last_txid': station.last_txid  //id of the last related transaction
},
{...} //there may be many stations
]
```