export interface JobData {
    entitlementRecalculation?: EntitlementRecalculation
}

interface EntitlementRecalculation {
    customerId: string
}
