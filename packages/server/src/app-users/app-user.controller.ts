import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

interface IdentifyRequestBody {
    externalUserId?: string
}

interface IdentifyRequestResponse {
    userId: string
}

// a nodejs controller to handle user profile requests
export class AppUserController {
    constructor(readonly prisma: PrismaClient) {
        this.prisma = prisma
    }

    async identifyUser(req: Request, res: Response) {
        try {
            const body = req.body as IdentifyRequestBody
            const appId = this.appIdFromReq(req)
            const isAppExists = await this.isAppExists(appId)

            if (!isAppExists) {
                throw new Error(`App ${appId} does not exist`)
            }

            if (body.externalUserId) {
                // if external user id provided, check if it exists in the database
                const user = await this.prisma.appUser.findFirst({
                    where: {
                        appId: appId,
                        externalUserId: body.externalUserId,
                    },
                })

                if (user) {
                    // if external user id exists, return the user id
                    const response: IdentifyRequestResponse = {
                        userId: user.id,
                    }
                    return res.json(response)
                }
            }

            // if no external user id provided, return an anonymous user id
            const user = await this.prisma.appUser.create({
                data: {
                    appId: appId,
                    externalUserId: null,
                },
            })

            const response: IdentifyRequestResponse = {
                userId: user.id,
            }

            return res.json(response)
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    private appIdFromReq(req: Request): string {
        const appId = req.headers['X-RevFlow-App-Id']
        if (!appId) {
            throw new Error('X-RevFlow-App-Id header is missing')
        }

        return appId as string
    }

    private async isAppExists(appId: string): Promise<boolean> {
        const app = await this.prisma.app.findFirst({
            where: {
                id: appId,
            },
        })

        return !!app
    }
}
