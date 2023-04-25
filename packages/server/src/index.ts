// an express app
import express from 'express'
import { registerAppInstallation } from './controllers'

const app = express()
const port = process.env.PORT || 3694

app.use(express.json())

app.post('/api/v1/storekit-callback')
app.post('/api/v1/google-play-callback')

// register an app installation
app.post('/api/v1/installations', registerAppInstallation)

app.post('/api/v1/installations/:installationId/attributes')

// link installation to an existing customer
app.post('/api/v1/installations/:installationId/link')

app.listen(port, () => {
    console.log(`🚀 Server started on port ${port}. http://localhost:${port}`)
})
