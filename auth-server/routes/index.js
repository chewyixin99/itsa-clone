const express = require('express')
const router = express.Router()

const auth = require('./auth')


router.use('/auth', auth);
router.get('/health', (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now()
    };
    res.send(JSON.stringify(healthcheck));
});



module.exports = router