import { Queue, RedisOptions } from 'bullmq'
import Redis from 'ioredis'
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

const redisConnection: RedisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
}

export const redis = new Redis(redisConnection)
export const workQueue = new Queue('workQueue', {
    connection: redis,
})
