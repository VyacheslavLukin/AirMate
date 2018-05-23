#!/usr/bin/env sh
geth --identity "node_2" --rpc --rpcport "8089" --rpcaddr 0.0.0.0 \
    --datadir "/node/innosoft_chain" --port "30304" --nodiscover \
    --rpcapi "db,eth,net,web3,personal,web3" --networkid 2017 init \
    /node/genesis.json

geth --identity "node_2" --rpc --rpcport "8089" --rpcaddr 0.0.0.0 \
    --datadir "/node/innosoft_chain" --port "30304" --nodiscover \
    --rpcapi "db,eth,net,web3,personal,web3" --networkid 2017


