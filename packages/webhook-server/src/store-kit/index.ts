import { Request, Response } from 'express'
import { prisma } from '../config'
import {
    decodeJWS,
    DecodedNotificationPayload,
    JWSTransactionDecodedPayload,
    NotificationType,
    NotificationSubtype,
} from './helpers'
import {
    App,
    CustomerAppInstallation,
    Subscription,
    Transaction,
    StoreKitTransactionType,
    StoreKitTransactionSubtype,
} from '@prisma/client'

// this is the endpoint that will be called by the storekit
export const storekitCallbackHandler = async (req: Request, res: Response) => {
    // only accept POST requests
    if (req.method !== 'POST') {
        res.status(405).end()
        return
    }

    // get the body of the request
    const body = req.body

    // if body contains signedPayload, then it's a StoreKit2 request
    const signedPayload = body.signedPayload as string | undefined
    if (signedPayload) {
        // We got a StoreKit2 request
        // decode the signedPayload
        const notificationPayload = (await decodeJWS(
            signedPayload
        )) as unknown as DecodedNotificationPayload

        // decode transaction info from the payload
        const decodedTransaction = (await decodeJWS(
            notificationPayload.data.signedTransactionInfo
        )) as unknown as JWSTransactionDecodedPayload

        let customerAppInstallation: CustomerAppInstallation | undefined
        let app: App | undefined
        let subscription: Subscription | undefined

        // if we have an accountToken, then we can get the customerAppInstallation
        if (decodedTransaction.appAccountToken) {
            customerAppInstallation = await installationFromAccountToken(
                decodedTransaction.appAccountToken
            )
        }

        // if we have a bundleId, then we can get the app
        if (notificationPayload.data.bundleId) {
            app = await appFromBundleId(notificationPayload.data.bundleId)
        }

        // if we have a productId, then we can get the subscription
        if (decodedTransaction.productId) {
            subscription = await subscriptionFromProductId(
                decodedTransaction.productId
            )
        }

        // decodedTransaction.purchaseDate is a number unix timestamp, so we need to convert it to a Date
        const purchaseDate = new Date(decodedTransaction.purchaseDate)
        console.log(`Decoded transaction: ${purchaseDate}`)

        const createdAt = new Date(notificationPayload.signedDate)
        let revocationDate: Date | null = null
        let expiresDate: Date | null = null

        if (decodedTransaction.revocationDate) {
            revocationDate = new Date(decodedTransaction.revocationDate)
        }

        if (decodedTransaction.expiresDate) {
            expiresDate = new Date(decodedTransaction.expiresDate)
        }

        try {
            // add the transaction to the database
            await prisma.transaction.create({
                data: {
                    id: decodedTransaction.transactionId,
                    source: 'StoreKit',
                    sourceTransactionId: '',
                    storeKitTransactionType:
                        transactionTypeFromNotificationType(
                            notificationPayload.notificationType
                        ),
                    storeKitTransactionSubtype: notificationPayload.subtype
                        ? transactionSubtypeFromNotificationSubtype(
                              notificationPayload.subtype
                          )
                        : null,
                    rawPayload: decodedTransaction as any,
                    purchaseDate: purchaseDate,
                    expirationDate: expiresDate,
                    cancellationDate: null,
                    revocationDate: revocationDate,
                    environment: decodedTransaction.environment,
                    quantity: decodedTransaction.quantity,
                    createdAt: createdAt,
                    updatedAt: createdAt,
                    originalTransactionId:
                        decodedTransaction.originalTransactionId,
                    appId: app?.id ?? null,
                    customerAppInstallationId:
                        customerAppInstallation?.id ?? null,
                    subscriptionId: subscription?.id ?? null,
                    subscriptionGroupId:
                        subscription?.subscriptionGroupId ?? null,
                },
            })
            res.status(200).end()
        } catch (error) {
            console.log(`Error while adding transaction to database: ${error}`)
            res.status(500).end()
        }
    } else {
        // We got a StoreKit1 request
    }
}

async function installationFromAccountToken(
    accountToken: string
): Promise<CustomerAppInstallation | undefined> {
    return undefined
}

async function appFromBundleId(bundleId: string): Promise<App | undefined> {
    return undefined
}

async function subscriptionFromProductId(
    productId: string
): Promise<Subscription | undefined> {
    return undefined
}

function transactionTypeFromNotificationType(
    notificationType: NotificationType
): StoreKitTransactionType {
    switch (notificationType) {
        case NotificationType.ConsumptionRequest:
            return StoreKitTransactionType.ConsumtionRequest
        case NotificationType.DidChangeRenewalPref:
            return StoreKitTransactionType.DidChangeRenewalPref
        case NotificationType.DidChangeRenewalStatus:
            return StoreKitTransactionType.DidChangeRenewalStatus
        case NotificationType.DidFailToRenew:
            return StoreKitTransactionType.DidFailToRenew
        case NotificationType.DidRenew:
            return StoreKitTransactionType.DidRenew
        case NotificationType.Expired:
            return StoreKitTransactionType.Expired
        case NotificationType.GracePeriodExpired:
            return StoreKitTransactionType.GracePeriodExpired
        case NotificationType.OfferRedeemed:
            return StoreKitTransactionType.OfferRedeemed
        case NotificationType.PriceIncrease:
            return StoreKitTransactionType.PriceIncrease
        case NotificationType.Refund:
            return StoreKitTransactionType.Refund
        case NotificationType.RefundDeclined:
            return StoreKitTransactionType.RefundDeclined
        case NotificationType.RenewalExtended:
            return StoreKitTransactionType.RenewalExtended
        case NotificationType.Revoke:
            return StoreKitTransactionType.Revoke
        case NotificationType.Subscribed:
            return StoreKitTransactionType.Subscribed
    }
}

function transactionSubtypeFromNotificationSubtype(
    notificationSubtype: NotificationSubtype
): StoreKitTransactionSubtype {
    switch (notificationSubtype) {
        case NotificationSubtype.InitialBuy:
            return StoreKitTransactionSubtype.InitialBuy
        case NotificationSubtype.Resubscribe:
            return StoreKitTransactionSubtype.Resubscribe
        case NotificationSubtype.Downgrade:
            return StoreKitTransactionSubtype.Downgrade
        case NotificationSubtype.Upgrade:
            return StoreKitTransactionSubtype.Upgrade
        case NotificationSubtype.AutoRenewEnabled:
            return StoreKitTransactionSubtype.AutoRenewEnabled
        case NotificationSubtype.AutoRenewDisabled:
            return StoreKitTransactionSubtype.AutoRenewDisabled
        case NotificationSubtype.Voluntary:
            return StoreKitTransactionSubtype.Voluntary
        case NotificationSubtype.BillingRetry:
            return StoreKitTransactionSubtype.BillingRetry
        case NotificationSubtype.PriceIncrease:
            return StoreKitTransactionSubtype.PriceIncrease
        case NotificationSubtype.GracePeriod:
            return StoreKitTransactionSubtype.GracePeriod
        case NotificationSubtype.BillingRecovery:
            return StoreKitTransactionSubtype.BillingRecovery
        case NotificationSubtype.Pending:
            return StoreKitTransactionSubtype.Pending
        case NotificationSubtype.Accepted:
            return StoreKitTransactionSubtype.Accepted
    }
}
