// a core function to calculate entitlements from a list of transactions

import { Transaction } from '@prisma/client'
import {} from '@prisma/client'
import _ from 'lodash'

export interface Entitlements {
    subscriptionGroups: SubscriptionGroupEntitlements
    subscriptions: SubscriptionEntitlements
}

export enum SubscriptionState {
    Active = 'Active',
    Expired = 'Expired',
    InGracePeriod = 'InGracePeriod',
    InBillingRetryPeriod = 'InBillingRetryPeriod',
    Revoked = 'Revoked',
}

export function calculateEntitlements(
    transactions: Transaction[]
): Entitlements {
    // find all subscription group ids
    const subscriptionGroupIds = _.compact(
        _.uniq(
            transactions.map((transaction) => transaction.subscriptionGroupId)
        )
    )

    // find all subscription ids
    const subscriptionIds = _.compact(
        _.uniq(transactions.map((transaction) => transaction.subscriptionId))
    )

    // if there are no subscription group ids or subscription ids, return empty entitlements, using lodash
    if (_.isEmpty(subscriptionGroupIds) && _.isEmpty(subscriptionIds)) {
        return {
            subscriptionGroups: {},
            subscriptions: {},
        }
    }

    // sort transactions by purchaseDate, oldest first
    const sortedTransactions = _.orderBy(
        transactions,
        (transaction) => transaction.purchaseDate.getTime(),
        'asc'
    )

    // group transactions by subscription group id
    const transactionsBySubscriptionGroupId = _.groupBy(
        sortedTransactions,
        (transaction) => transaction.subscriptionGroupId
    )

    // group transactions by subscription id
    const transactionsBySubscriptionId = _.groupBy(
        sortedTransactions,
        (transaction) => transaction.subscriptionId
    )

    const subscriptionGroups: SubscriptionGroupEntitlements = {}
    const subscriptions: SubscriptionEntitlements = {}

    // loop through all subscription group ids
    for (const subscriptionGroupId of subscriptionGroupIds) {
        // find all transactions for the subscription group
        const transactionsForSubscriptionGroup =
            transactionsBySubscriptionGroupId[subscriptionGroupId]

        // find the latest transaction for the subscription group
        const latestTransaction = _.last(transactionsForSubscriptionGroup)

        // if there are no transactions for the subscription group, continue to the next subscription group
        if (!latestTransaction) {
            continue
        }

        // if the latest transaction is a refund, continue to the next subscription group
        if (isRefundTransaction(latestTransaction)) {
            continue
        }

        // find the transaction with the latest expiration date for the subscription group
        const latestExpirationDateTransaction = _.maxBy(
            transactionsForSubscriptionGroup,
            (transaction) => transaction.expirationDate?.getTime() ?? 0
        )

        // if the latest expiration date transaction is a refund, continue to the next subscription group
        if (
            latestExpirationDateTransaction &&
            isRefundTransaction(latestTransaction)
        ) {
            continue
        }

        // set the expiration date for the subscription group to be the date of the latest transaction
        subscriptionGroups[subscriptionGroupId] = {
            expirationDate: latestTransaction.purchaseDate,
        }
    }

    return {
        subscriptionGroups,
        subscriptions,
    }
}

type SubscriptionGroupEntitlements = {
    [subscriptionGroupId: string]: {
        expirationDate: Date
    }
}

type SubscriptionEntitlements = {
    [subscriptionId: string]: {
        expirationDate: Date
    }
}

function isRefundTransaction(transaction: Transaction): boolean {
    if (transaction.storeKitTransactionType) {
        return transaction.storeKitTransactionType == 'Refund'
    } else {
        return false
    }
}
