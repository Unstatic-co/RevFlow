import { redis, prisma } from './config'
import { PubsubEvents } from 'shared-types'

redis.subscribe('new-transactions')

redis.on('message', (channel, message) => {
    if (channel == 'new-transactions') {
        // new transaction, invalidate any cached entitlements in redis
        const newTransaction: PubsubEvents.NewTransaction = JSON.parse(message)

        console.log(
            `New transaction: ${newTransaction.customerAppInstallationId}`
        )
    }
})
