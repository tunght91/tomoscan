'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TokenTx = new Schema({
    address: { type: String, index: true },
    blockHash: String,
    blockNumber: Number,
    transactionHash: { type: String, index: true },
    transactionIndex: Number,
    from: { type: String, index: true },
    to: { type: String, index: true },
    data: String,
    value: String,
    valueNumber: Number,
    input: String,
    block: { type: Schema.Types.ObjectId, ref: 'Block' }
}, {
    timestamps: true,
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true },
    versionKey: false
})

module.exports = mongoose.model('TokenTx', TokenTx)
