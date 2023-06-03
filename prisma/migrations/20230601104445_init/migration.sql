-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('iOS', 'Android', 'Web');

-- CreateEnum
CREATE TYPE "PushNotificationService" AS ENUM ('APNS', 'FCM');

-- CreateEnum
CREATE TYPE "DurationUnit" AS ENUM ('Day', 'Week', 'Month', 'Year');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('StoreKit', 'Stripe', 'Paddle', 'GooglePlay');

-- CreateEnum
CREATE TYPE "StoreKitTransactionType" AS ENUM ('ConsumtionRequest', 'DidChangeRenewalPref', 'DidChangeRenewalStatus', 'DidFailToRenew', 'DidRenew', 'Expired', 'GracePeriodExpired', 'OfferRedeemed', 'PriceIncrease', 'Refund', 'RefundDeclined', 'RenewalExtended', 'RenewalExtension', 'Revoke', 'Subscribed', 'Test');

-- CreateEnum
CREATE TYPE "StoreKitTransactionSubtype" AS ENUM ('Accepted', 'AutoRenewEnabled', 'AutoRenewDisabled', 'BillingRecovery', 'BillingRetry', 'Downgrade', 'Failure', 'GracePeriod', 'InitialBuy', 'Pending', 'PriceIncrease', 'ProductNotForSale', 'Resubscribe', 'Summary', 'Upgrade', 'Voluntary');

-- CreateEnum
CREATE TYPE "Environemnt" AS ENUM ('Production', 'Sandbox');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAppInstallation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,
    "appId" TEXT NOT NULL,
    "customAttributes" JSONB,
    "deviceType" "DeviceType" NOT NULL,
    "pushNotificationToken" TEXT,
    "pushNotificationService" "PushNotificationService",

    CONSTRAINT "CustomerAppInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storeKitBundleId" TEXT,
    "googlePlayPackageName" TEXT,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "SubscriptionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "storeKitProductId" TEXT,
    "storeKitPriceTier" TEXT,
    "googlePlayProductId" TEXT,
    "googlePlayPriceTier" TEXT,
    "stripeProductId" TEXT,
    "stripePriceValue" TEXT,
    "stripePriceCurrency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionGroupId" TEXT NOT NULL,
    "durationUnit" "DurationUnit" NOT NULL,
    "durationValue" INTEGER NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "source" "TransactionSource" NOT NULL,
    "sourceTransactionId" TEXT NOT NULL,
    "storeKitTransactionType" "StoreKitTransactionType",
    "storeKitTransactionSubtype" "StoreKitTransactionSubtype",
    "rawPayload" JSONB,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "cancellationDate" TIMESTAMP(3),
    "revocationDate" TIMESTAMP(3),
    "environment" "Environemnt" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originalTransactionId" TEXT,
    "appId" TEXT,
    "customerAppInstallationId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionGroupId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_id_key" ON "Subscription"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_key" ON "Transaction"("id");

-- AddForeignKey
ALTER TABLE "CustomerAppInstallation" ADD CONSTRAINT "CustomerAppInstallation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAppInstallation" ADD CONSTRAINT "CustomerAppInstallation_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionGroup" ADD CONSTRAINT "SubscriptionGroup_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscriptionGroupId_fkey" FOREIGN KEY ("subscriptionGroupId") REFERENCES "SubscriptionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_originalTransactionId_fkey" FOREIGN KEY ("originalTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerAppInstallationId_fkey" FOREIGN KEY ("customerAppInstallationId") REFERENCES "CustomerAppInstallation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscriptionGroupId_fkey" FOREIGN KEY ("subscriptionGroupId") REFERENCES "SubscriptionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
