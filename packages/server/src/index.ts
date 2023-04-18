// an express app
import express from 'express'

const app = express()

app.post('/api/v1/storekit-callback')
app.post('/api/v1/google-play-callback')

// Register a profile
app.post('/api/v1/profiles')

// Register an user
app.post('/api/v1/users')

// assign a profile to a user
app.post('/api/v1/users/:userId/profiles')
