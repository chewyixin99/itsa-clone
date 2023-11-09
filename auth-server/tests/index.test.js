const request = require("supertest")
const { app, init } = require("../app")
const db = require("../models");

jest.setTimeout(10000)

beforeAll(async () => {
    await init()
})

afterAll(async () => {
    await db.sequelize.close()
})
describe("get /health", () => {
    describe("when called", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).get("/health")
            expect(response.statusCode).toBe(200)
        })
    })
})