import { PrismaClient } from '@prisma/client'
import { Queue, RedisOptions } from 'bullmq'
import Redis from 'ioredis'
import { NodeRedisPubSub } from 'node-redis-pubsub'

export const prisma = new PrismaClient()

// create a redis connection for queue. Using ioredis
// redis connection can come from environment variables,
// if no environment variables provided, use default redis connection like localhost:6379
const redisConnection: RedisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
}

export const redis = new Redis(redisConnection)
export const workQueue = new Queue('workQueue', {
    connection: redis,
})

export const Pubsub = new NodeRedisPubSub({
    connection: redisConnection,
})
