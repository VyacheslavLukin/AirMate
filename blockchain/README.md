# BigchainDB node for development
Don't suitable for production

## Initial configuration
Enter `airmate/blockchain/bigchaindb` directory and build docker images for mongo, bigchaindb and tendermint

```
$ docker-compose build bigchaindb
```

## Run services
To start node use this command
```
$ docker-compose up -d bdb
```

For relevant information look in [bigchaindb docs](https://docs.bigchaindb.com/projects/contributing/en/latest/dev-setup-coding-and-contribution-process/run-node-with-docker-compose.html)
