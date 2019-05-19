# AirMate
#### Green Sensing: Smart Sensing: Global Distributed GHG and Local Pollutant Sensing Networks for Climate Accountability
You need docker and docker-compose installed on your machine in order to be able to work with the project

1. ```Edit .env and set login with password. They are used inside minimax_watchdog.py.```
2. ```Edit web/.env and set API_URL. It's used by a client side of the web application.```
3. ```Run bigchaindb:```
   * ```docker-compose -f blockchain/bigchaindb/docker-compose.yml up -d bigchaindb```
4. ```Edit data_layer/.env and provide valid BIGCHAIN_URL.```
5. ```docker-compose up -d```
6. ```Attach bigchaindb container to airmate_dev network:```
   * ```docker network connect airmate_dev <bigchaindb_container>```

## API description

### Response structure

```
{
    “status”: string,
    “data”: object,
    “message”: string,
    “error”: object
}
```

* Status variants: fail, success
* Data - any object containing relevant information for request
* Message - any string to be shown in case of error
* Error - error object containing details regarding the error 

### Methods
#### GET /api/layers - get list of the available layers

##### Reponse
```
{
    “status”: “success”,
    “data”: {
    	"layers":[{
    		"title": "pollution",
    		"url": "/api/layers/pollution"
    	},{
    		"title": "stephen",
    		"url": "/api/layers/stephen"
    	}]
    }
}
```

#### GET /api/layers/{layer-name} - get data for specific layer
##### Reponse
```
{
    “status”: “success”,
    “data”: {
    	"points":[{
		...
    	},{
		...
    	}]
    }
}
```

#### GET /api/profile - get user data
##### Reponse
```
{
    “status”: “success”,
    “data”: {
    	"name":"string", //name of the person
    	"requests": 100, //number of requests she has to call the API,
    	"key": "some API key", //developer key to access the API
    }
}
```
#### POST /api/profile - set user data
##### Request
```
{
    	"name":"string", //name of the person
    	"requests": 100, //number of requests she has to call the API,
    	"key": "some API key", //developer key to access the API
}
```
##### Response:
```
Same as for GET
```

#### GET /api/buy - buy 100 requests
##### Reponse
```
{
    “status”: “success”,
    “data”: {
    	"wallet":"string", //the wallet address to deposit coins
    	"coins":100 //number of coins to be transfered
    }
}
```

#### GET /api/sensors - list your sensors
##### Reponse
```
{
    “status”: “success”,
    “data”: {
    	"sensors": [{
    	    "id":"string",//hardware id
    	    "lat":lat,
    	    "lng":lng,
    	    "type":"string",//type of the sensor
    	}]
    }
}
```

