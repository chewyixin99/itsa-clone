const { app, init } = require('./app')
const { config } = require('./models/setup')
// console.log(app)
const start = async () => {
    await init()
    app.listen(process.env.PORT, async () => {
        console.log("Server running on port " + process.env.PORT)
    })
}

start()


