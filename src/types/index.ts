import { IPluggableDB } from "@energyweb/ocn-bridge"

export interface IMockServerConfig {
    port: number
    publicIP: string
    roles: Array<{
        party_id: string
        country_code: string
        role: string
        business_details: {
            name: string
        }
    }>
    services: string[]
    createAssetDIDs?: boolean
    assetCreationDelayMS: number
}

export interface IMockMSPServerConfig extends IMockServerConfig {
    // set number of generated assets to be created
    assetCount: number
}

export interface IOcnToolsConfig {
    ocn: {
        node: string
        stage: string
    },
    cpo: IMockServerConfig
    msp: IMockMSPServerConfig
    prequalification: {
        prequalificationIssuerRole: string
        prequalifcationRole: string,
        provider: string,
        chainId: number
        user_claims_iam: {
            cacheServerUrl: string
        },
        asset_claims_iam: {
            cacheServerUrl: string
            natsServerUrl: string
            natsProtocolPort: string
        }
    },
    evRegistry?: {
        address: string
        provider: string
    }
}

export interface IAssetIdentity {
    uid: string
    did: string
    privateKey: string
}

export interface IDIDCache extends IPluggableDB {

    /**
     * Resolves DID from asset ID
     *
     * @param assetId unique id of asset (token UID, evse ID)
     */
    getAssetIdentity(assetId: string): IAssetIdentity | undefined

    /**
     * Store asset identity information
     */
    setAssetIdentity(identity: IAssetIdentity): void

}
