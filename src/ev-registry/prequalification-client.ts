import { NATS_EXCHANGE_TOPIC } from "iam-client-lib"
import { Client } from "nats"
import { IAssetIdentity } from "../types"
import { NatsConnection } from "./factories/nats-connection"
import { Asset } from "./models/asset"

export class PrequalificationClient {

    public static init({ getAssetIdentityByDID }: { getAssetIdentityByDID: (string) => IAssetIdentity | undefined }) {
        const createSubscriptions = (natsConnection: Client) => {
            this.initVehiclePrequalificationListener({ natsClient: natsConnection, getAssetIdentityByDID })
        }
        // tslint:disable-next-line: no-unused-expression
        new NatsConnection({ createSubscriptions })
    }

    private static initVehiclePrequalificationListener({ natsClient, getAssetIdentityByDID }: 
        { natsClient: Client, getAssetIdentityByDID: (string) => IAssetIdentity | undefined }) {
        // Listen for prequalification requests
        const PREQUALIFICATION_REQUEST_TOPIC = "prequalification.exchange"
        natsClient.subscribe(`*.${PREQUALIFICATION_REQUEST_TOPIC}`, async (data) => {
            const json = JSON.parse(data)
            console.log(`[NATS] Received prequalification REQUEST for: ${JSON.stringify(json)}`)
            const assetDID: string = json.did
            const assetID = getAssetIdentityByDID(assetDID)
            console.log(`[NATS] Queried assetID for asset: ${assetDID}`)
            if (!assetID) {
                console.log(`[NATS] No stored assetID for asset: ${assetDID}`)
                return
            }
            const asset = new Asset(assetID)
            console.log(`[NATS] Requesting prequalification for asset: ${assetDID}`)
            await asset.requestPrequalification()
        })

        // Listen for issued prequalification claims
        natsClient.subscribe(`*.${NATS_EXCHANGE_TOPIC}`, async (data) => {
            const message = JSON.parse(data) as IMessage
            console.log(`[NATS] Received message on claims exchange.`)
            if (!message.issuedToken) {
                console.log(`[NATS] Received message does not contained an issued token`)
                return
            }
            console.log(`[NATS] Received ISSUED CLAIM: ${JSON.stringify(message)}`)
            const assetDID: string = message.requester
            const assetID = getAssetIdentityByDID(assetDID)
            console.log(`[NATS] Retrieved assetID for asset: ${assetDID}`)
            if (!assetID) {
                console.log(`[NATS] No stored assetID for asset: ${assetDID}`)
                return
            }
            const asset = new Asset(assetID)
            console.log(`[NATS] Publishing claim for asset: ${assetDID}`)
            await asset.publishPublicClaim(message.issuedToken)
        })
        console.log("[NATS] Listening for asset claim requests and issued claims")
    }
}

// IMessage is taken from iam-client-lib
// (it should probably be published as a shared interface)
interface IMessage {
    id: string
    token: string
    issuedToken?: string
    requester: string
    claimIssuer: string[]
    acceptedBy?: string
}