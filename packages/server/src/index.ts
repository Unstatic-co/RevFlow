// an express app
import express from 'express'

const app = express()

app.post('/callback/storekit')
app.post('/callback/google-play')

app.post('/users/register')
app.get('/users/entitlements')
