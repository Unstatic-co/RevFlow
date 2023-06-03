// an express app
import express from 'express'
import { registerAppInstallation } from './controllers'
import { storekitCallbackHandler } from './store-kit'
import { prisma, redis } from './config'
import { PubsubEvents } from 'shared-types'
import { Transaction } from '@prisma/client'

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

    // register middleware for new transactions, then send it to pubsub
    prisma.$use(async (params, next) => {
        const result = await next(params)
        if (params.model == 'Transaction' && params.action == 'create') {
            const transaction: Transaction = params.args.data
            const newTransactionEvent: PubsubEvents.NewTransaction = {
                transactionId: transaction.id,
                customerAppInstallationId:
                    transaction.customerAppInstallationId,
            }

            console.info(`New transaction: ${transaction.id} sent to pubsub`)

            await redis.publish(
                'new-transactions',
                JSON.stringify(newTransactionEvent)
            )
        }
        return result
    })
})
