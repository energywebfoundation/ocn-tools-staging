import { JsonRpcProvider } from "@ethersproject/providers"
import { Wallet } from "@ethersproject/wallet"
import { Methods } from "@ew-did-registry/did"
import { DIDDocumentFull, IDIDDocumentFull } from "@ew-did-registry/did-document"
import { abi1056, address1056, Operator } from "@ew-did-registry/did-ethr-resolver"
import { IResolverSettings, ProviderTypes } from "@ew-did-registry/did-resolver-interface"
import { Keys } from "@ew-did-registry/keys"
import { config } from "../../../config/config"
import { IAssetIdentity, IDIDCache } from "../../../types"
import { EvRegistry } from "../contracts/ev-registry"

export class DID {

    /**
     * Creates or retreives a DID/Document for an asset
     * 
     * @param assetID token UID or evse ID
     * @param operatorKey key of asset operator ('controller' of DID)
     * @param db interface with get/set identity cache methods
     */
    public static async init(assetID: string, operatorKeys: Keys, db: IDIDCache, skipRegistry?: boolean): Promise<DID> {
        const did = new DID(assetID, operatorKeys, db, skipRegistry)
        await did.init()
        return did
    }

    /**
     * DID of asset
     */
    public did?: string
    /**
     * DID Document of asset
     */
    public document?: IDIDDocumentFull

    private resolverSettings: IResolverSettings = {
        provider: {
            uriOrInfo: config.prequalification.provider,
            type: ProviderTypes.HTTP
        },
        method: Methods.Erc1056,
        abi: abi1056,
        address: address1056
    }

    constructor(
        private assetID: string,
        private operatorKeys: Keys,
        private db: IDIDCache,
        private skipRegistry?: boolean
    ) { }

    /**
     * Checks if identity has already been created,
     * creates or retrieves did and document
     */
    private async init(): Promise<void> {
        const existent = this.db.getAssetIdentity(this.assetID)
        if (existent) {
            console.log("[ASSET] cached, resolving document")
            await this.getDocument(existent)
        } else {
            console.log("[ASSET] not cached, creating document")
            await this.createDocument()
        }
    }

    /**
     * Resolves an asset's DID using the MSP/CPO as operator
     * 
     * @param asset get DID using asset identity details stored in cache
     */
    private async getDocument(asset: IAssetIdentity): Promise<void> {
        const keys = new Keys({ privateKey: asset.privateKey })
        this.did = `did:${Methods.Erc1056}:${keys.getAddress()}`
        const operator = new Operator(keys, this.resolverSettings)
        this.document = new DIDDocumentFull(this.did, operator)
    }

    /**
     * Creates a DID for asset using MSP/CPO as operator
     */
    private async createDocument(): Promise<void> {
        const keys = new Keys(Keys.generateKeyPair())
        const address = keys.getAddress()
        this.did = `did:${Methods.Erc1056}:${address}`
        const operator = new Operator(keys, this.resolverSettings)
        this.document = new DIDDocumentFull(this.did, operator)
        // send tokens to address so they can create/update their document
        console.log(`[${new Date()}]`, "[DID] minting tokens before did creation", this.did, this.assetID)
        await this.mint(address)
        console.log(`[${new Date()}]`, "[DID] creating did document", this.did, this.assetID)
        await this.document.create()
        // log asset DID creation
        console.log(`[${new Date()}]`, `[DID] Created identity for ${this.assetID}: ${this.did}`)
        // cache identity
        if (!this.skipRegistry) {
            console.log(`[${new Date()}]`, "[EV REGISTRY] adding entry", address, this.assetID)
            await this.saveInEvRegistry(address, this.assetID)
        }
        console.log(`[${new Date()}]`, "[ASSET] cached asset", this.assetID)
        this.db.setAssetIdentity({
            uid: this.assetID,
            did: this.did,
            privateKey: keys.privateKey
        })
    }

    /**
     * Fund asset wallet with minimal EWT to operate DID and document
     * @param assetAddress wallet address of asset
     */
    private async mint(assetAddress: string): Promise<void> {
        const provider = new JsonRpcProvider(this.resolverSettings.provider?.uriOrInfo)
        const wallet = new Wallet(this.operatorKeys.privateKey, provider)
        const valueInEther = 0.001
        console.log(`[${new Date()}]`, "creating tx, to:", assetAddress, "value:", valueInEther * 1e18, "gasPrice:", 1)
        const tx = await wallet.sendTransaction({
            to: assetAddress,
            value: valueInEther * 1e18, // convert to wei
        })
        console.log(`[${new Date()}]`, "sending mint tx", tx.hash)
        await tx.wait()
        console.log(`[${new Date()}]`, "tx confirmed", tx.hash)
        // log remaining balance
        const balance = await wallet.getBalance()
        // get approx. balance for log (ethers bignumber hates big numbers)
        const balanceInEther = (parseInt(balance.toString(), 10) / 1e18).toFixed(3)
        console.log(`[${new Date()}]`, `[DID] Minted ${valueInEther} for ${assetAddress}. Remaining balance: ${balanceInEther}`)
    }

    /**
     * Store device entry in EV Registry smart contract (allows participation in ev dashboard application)
     * @param uid device UID used to identify it on OCN
     * @param keys device keys created for DID
     */
    private async saveInEvRegistry(address: string, uid: string): Promise<void> {
        const registry = new EvRegistry(this.operatorKeys)
        await registry.addDevice(address, uid)
        console.log(`[EV REGISTRY] Saved asset ${this.did}`)
    }

}
