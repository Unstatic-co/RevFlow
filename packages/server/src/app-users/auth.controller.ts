import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

interface SignInRequestBody {
    externalUserId?: string
}

interface SignInRequestResponse {
    appUserId: string
    externalUserId?: string
}

export class AuthController {
    constructor(readonly prisma: PrismaClient, readonly appId: string) {
        this.prisma = prisma
        this.appId = appId
    }

    async signIn(req: Request, res: Response) {
        // body is a SignInRequestBody
        const body = req.body as SignInRequestBody

        // if external user id provided, check if it exists in the database
        if (body.externalUserId) {
            const user = await this.prisma.appUser.findFirst({
                where: {
                    appId: this.appId,
                    externalUserId: body.externalUserId,
                },
            })

            if (user) {
                // if external user id exists, return the user id
                const response: SignInRequestResponse = {
                    appUserId: user.id,
                    externalUserId: body.externalUserId,
                }
                return res.json(response)
            } else {
                // if external user id does not exist, create a new user
                const user = await this.prisma.appUser.create({
                    data: {
                        appId: this.appId,
                        externalUserId: body.externalUserId,
                    },
                })

                const response: SignInRequestResponse = {
                    appUserId: user.id,
                    externalUserId: body.externalUserId,
                }

                return res.json(response)
            }
        } else {
            // if no external user id provided, create new user for this sign in request
            // return an anonymous user id
            const user = await this.prisma.appUser.create({
                data: {
                    appId: this.appId,
                    externalUserId: null,
                },
            })

            const response: SignInRequestResponse = {
                appUserId: user.id,
            }

            return res.json(response)
        }
    }
}
