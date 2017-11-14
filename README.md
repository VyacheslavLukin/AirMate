# #Hack4Climate
You need nodejs and docker installed on your machine in order to be able to work with a project

1. ```npm i```
2. ```webpack --config webpack.config.vendor.js```
3. ```npm start```
4. ```PROFIT!!!```

#API description

##Response structure

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

##Methods
###GET /api/layers - get list of the available layers

####Reponse
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

###GET /api/layers/{layer-name} - get data for specific layer
####Reponse
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

GET /api/profile - get user data
Reponse:
{
    “status”: “success”,
    “data”: {
    	"name":"string", //name of the person
    	"requests": 100, //number of requests she has to call the API,
    	"key": "some API key", //developer key to access the API
    }
}
POST /api/profile - set user data
Request:
{
    	"name":"string", //name of the person
    	"requests": 100, //number of requests she has to call the API,
    	"key": "some API key", //developer key to access the API
}
Response:
Same as for GET
