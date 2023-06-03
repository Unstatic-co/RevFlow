import { Request, Response } from 'express'
import { prisma } from '../config'

// a handler that handle app installation registration, and link installation to an existing customer
export interface AppInstallationRegistrationRequest {
    installationId: string
    customerId?: string
}

export interface AppInstallationRegistrationResponse {
    installationId: string
    customerId?: string
}

export interface LinkCustomerToInstallationRequest {
    customerId: string
}

export const registerAppInstallation = async (req: Request, res: Response) => {
    const { installationId, customerId } =
        req.body as AppInstallationRegistrationRequest

    // get appId from headers using X-RevFlow-AppID
    const appId = req.headers['X-RevFlow-AppID'] as string

    // if appId is not provided, return error
    if (!appId) {
        return res.status(400).json({
            error: `App ID is required in header 'X-RevFlow-AppID'`,
        })
    }

    try {
        const installation = await prisma.customerAppInstallation.create({
            data: {
                id: installationId,
                customerId,
                appId: appId,
                deviceType: 'iOS',
            },
        })

        const response: AppInstallationRegistrationResponse = {
            installationId: installation.id,
            customerId: installation.customerId ?? '',
        }

        return res.json(response)
    } catch (error) {
        // // check if prisma error is duplicate key error
        // if (error.code === 'P2002') {
        //     return res.status(400).json({
        //         error: `Installation with ID ${installationId} already exists`,
        //     })
        // } else {
        //     return res.status(400).json({
        //         error: error.message,
        //     })
        // }
    }
}

export const linkCustomerToInstallation = async (
    req: Request,
    res: Response
) => {
    const { customerId } = req.body as LinkCustomerToInstallationRequest

    // get appId from headers using X-RevFlow-AppID
    const appId = req.headers['X-RevFlow-AppID'] as string
}
