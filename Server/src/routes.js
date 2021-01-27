const express = require('express')
const router = express.Router()
const cors = require('cors');
const controller = require('./controllers/actions.js')

router.all('*', cors());

router.post('/postAd', controller.postAd)

module.exports = router