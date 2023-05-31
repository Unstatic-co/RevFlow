import { Worker } from 'bullmq'
import { JobData } from 'shared-types'
import { redis } from './config'

// setup a worker to process jobs from the workQueue, this is a bullmq worker
// https://docs.bullmq.io/guide/queues

const worker = new Worker<JobData>(
    'default',
    async (job) => {
        job.data.entitlementRecalculation?.customerId
    },
    {
        concurrency: 20,
        autorun: false,
        connection: redis,
    }
)

// start the worker
worker.on('ready', () => {
    worker
        .run()
        .then(() => {
            console.log(`🚀 Job Worker started.`)
        })
        .catch((err) => {
            console.log(`🚀 Job Worker failed to start. ${err}`)
        })
})

// stop the worker before process termination
process.on('SIGTERM', () => {
    worker.close().then(() => {
        console.log('🚀 Job Worker closed due to received termination request')
        process.exit(0)
    })
})
