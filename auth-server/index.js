const { app, init } = require('./app')
// console.log(app)

app.listen(process.env.PORT, async () => {
    init()
    console.log("Server running on port " + process.env.PORT)
})



