const express = require('express')
const router = express.Router()

const auth = require('./auth')
const mail = require('./mail')


router.use('/oauth', auth);
router.use('/mail', mail);
router.get('/health', (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now()
    };
    res.send(JSON.stringify(healthcheck));
});


module.exports = router