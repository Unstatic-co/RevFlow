import express from 'express'
import expressWS from 'express-ws'
import { Pubsub } from './config'

const app = express()
const port = process.env.PORT || 3694
app.use(express.json())
const wss = expressWS(app)

wss.app.ws('/entitlements/{customerId}', (ws, req) => {
    Pubsub.subscribe('new-entitlements', (msg) => {
        ws.send(msg)
    })
})

app.listen(port, () => {
    console.log(
        `🚀 SDK Server started on port ${port}. http://localhost:${port}`
    )
})
