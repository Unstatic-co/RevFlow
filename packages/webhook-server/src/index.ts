// an express app
import express from 'express'
import { registerAppInstallation } from './controllers'
import { storekitCallbackHandler } from './store-kit'

const app = express()
const port = process.env.PORT || 3694

app.use(express.json())

app.post('/storekit-callback', storekitCallbackHandler)
app.post('/google-play-callback')

// register an app installation
app.post('/installations', registerAppInstallation)

app.post('/installations/:installationId/attributes')

// link installation to an existing customer
app.post('/installations/:installationId/link')

app.listen(port, () => {
    console.log(`🚀 Server started on port ${port}. http://localhost:${port}`)
})
