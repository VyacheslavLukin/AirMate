const config = require('../config.js')
const web3 = require('./web3')
const tx = require('ethereumjs-tx')
const lightwallet = require('eth-lightwallet')
const txutils = lightwallet.txutils;

// const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.url))
var addressSystemAccount = config.ethereum.systemAccount.address;
var nonce;
var contract = new web3.eth.Contract(config.ethereum.interface, config.ethereum.addressContract);

async function init (){
    nonce = await  web3.eth.getTransactionCount(addressSystemAccount);
}

async function sendRaw (regionId,timestamp,hashblock) {
    var txOptions = await gettxOptions(regionId,timestamp,hashblock);
    var rawTx = txutils.functionTx(config.ethereum.interface, 'saveData', [regionId,timestamp,hashblock],txOptions)
    var privateKey = new Buffer(config.ethereum.systemAccount.privateKey, 'hex')
    var transaction = new tx(rawTx)
    transaction.sign(privateKey)
    var serializedTx = transaction.serialize().toString('hex')
    web3.eth.sendSignedTransaction(
        '0x' + serializedTx, function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log("result transaction "+result)
            }
        })
}

async function gettxOptions(regionId,timestamp,hashblock) {
    var price = await web3.eth.getGasPrice();
    var gas = await contract.methods.saveData(regionId,timestamp,hashblock).estimateGas({});
    // var nonce = await web3.eth.getTransactionCount(addressSystemAccount);

    console.log("price "+price+" gas "+gas+" nonce "+nonce);

    var txOptions = {
        nonce: nonce,
        gasLimit: web3.utils.toHex(gas),
        gasPrice: web3.utils.toHex(price*2),
        // gasLimit:web3.utils.toHex(85898),
        // gasPrice:web3.utils.toHex( 35527257414),
        to: config.ethereum.addressContract
    }
    nonce++;
    return txOptions;
}
const senderTransaction = {
    init:init,
    sendRaw: sendRaw
};

module.exports = senderTransaction;