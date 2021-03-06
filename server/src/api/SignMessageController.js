import { Router } from 'express'
import db from '../models'
import Web3Util from '../helpers/web3'
const config = require('config')

const SignMessageController = Router()

SignMessageController.post('/verifySignedMess', async (req, res, next) => {
    try {
        const web3 = await Web3Util.getWeb3()
        const signedMessage = req.body.message || ''
        const signature = req.body.signature || ''
        const hash = req.body.hash || ''

        const acc = await db.Account.findOne({ hash: hash })

        if (!acc) {
            return res.status(404).send()
        }
        const result = await web3.eth.accounts.recover(signedMessage, signature)

        if (acc.contractCreation === result.toLowerCase()) {
            res.send('OK')
        } else {
            res.send({
                error: {
                    message: 'Not match'
                }
            })
        }
    } catch (e) {
        console.trace(e)
        console.log(e)
        return res.status(500).send()
    }
})

SignMessageController.post('/verifyScanedMess', async (req, res, next) => {
    try {
        const hash = req.body.hash || ''
        const messId = req.body.messId || ''

        const acc = await db.Account.findOne({ hash: hash })

        if (!acc) {
            return res.status(404).send()
        }
        const signature = await db.Signature.findOne({ signedAddress: acc.contractCreation })
        // let result = await web3.eth.accounts.recover(signedMessage, signature)

        if (signature && acc.contractCreation === signature.signedAddress.toLowerCase() &&
            messId === signature.signedAddressId) {
            res.send('OK')
        } else {
            res.send({
                error: {
                    message: 'Not match'
                }
            })
        }
    } catch (e) {
        console.trace(e)
        console.log(e)
        return res.status(500).send()
    }
})

SignMessageController.post('/generateSignMess', async (req, res, next) => {
    try {
        const web3 = await Web3Util.getWeb3()
        const address = req.body.address || ''

        const message = '[Tomoscan ' + (new Date().toLocaleString().replace(/['"]+/g, '')) + ']' +
            ' I, hereby verify that the information provided is accurate and ' +
            'I am the owner/creator of the token contract address ' +
            '[' + address + ']'

        const id = await web3.utils.soliditySha3(message + (new Date()).getTime() + Math.random().toString())
        res.send({
            message,
            url: `${config.get('BASE_URL')}api/signMessage/verify?id=`,
            id
        })
    } catch (e) {
        console.trace(e)
        console.log(e)
        return res.status(500).send()
    }
})

SignMessageController.post('/signMessage/verify', async (req, res, next) => {
    try {
        const web3 = await Web3Util.getWeb3()
        const message = req.body.message || ''
        const signature = req.body.signature.toLowerCase() || ''
        const id = req.query.id || ''

        const signedAddress = await web3.eth.accounts.recover(message, signature).toLowerCase()

        // Store id, address, msg, signature
        let sign = await db.Signature.findOne({ signedAddress: signedAddress })
        if (!sign) {
            sign = {}
        }
        sign.signedAddressId = id
        sign.message = message
        sign.signature = signature

        await db.Signature.findOneAndUpdate({ signedAddress: signedAddress }, sign, { upsert: true, new: true })

        res.send('Done')
    } catch (e) {
        console.trace(e)
        console.log(e)
        return res.status(404).send(e)
    }
})

export default SignMessageController
