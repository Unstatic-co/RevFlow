// an express app
import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prismaClient = new PrismaClient()

app.use(express.json())

app.post('/api/v1/storekit-callback')
app.post('/api/v1/google-play-callback')

// sign in with an external user, if no external user provided, return an annoymous user id.
app.post('/api/v1/auth/sign-in')

// link an external user to an existing user
app.post('/api/v1/appUsers/:appUserId/link')

// set attributes like name, email, etc.
app.post('/api/v1/appUsers/:appUserId/attributes')
