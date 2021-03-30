import { arrayify, Signature, splitSignature } from "@ethersproject/bytes"
import { Contract } from "@ethersproject/contracts"
import { JsonRpcProvider } from "@ethersproject/providers"
import { Wallet } from "@ethersproject/wallet"
import { Keys } from "@ew-did-registry/keys"
import { soliditySha3 } from "web3-utils"
import { config } from "../../../config/config"
import abi from "./ev-registry.abi"

export class EvRegistry {

    private readonly contract: Contract

    constructor(operatorKeys: Keys) {
        if (!config.evRegistry) {
            throw Error("EV Registry contract address not set in config.")
        }
        console.log('[EV REGISTRY] connecting to provider', config.evRegistry?.provider)
        const provider = new JsonRpcProvider(config.evRegistry?.provider)
        const signer = new Wallet(operatorKeys.privateKey, provider)
        console.log('[EV REGISTRY] connecting to contract', config.evRegistry.address)
        this.contract = new Contract(config.evRegistry.address, abi, signer)
    }

    /**
     * Check for existence of user
     */
    public async userExists(): Promise<boolean> {
        const user = await this.contract.signer.getAddress()
        const exists = await this.contract.getAllUserAddresses()
        return exists.includes(user)
    }

    /**
     * Check for existence of device
     */
    public async deviceExists(address: string): Promise<boolean> {
        const exists = await this.contract.getAllDeviceAddresses()
        return exists.includes(address)
    }

    /**
     * Adds user (MSP/CPO, represented by wallet) to registry contract 
     */
    public async addUser(): Promise<void> {
        if (await this.userExists()) {
            console.log('[EV REGISTRY] user already exists')
            return
        }
        console.log('[EV REGISTRY] user does not exist')
        const user = await this.contract.signer.getAddress()
        const { r, s, v } = await this.getSignature(user)
        await this.contract.addUser(user, v, r, s)
    }

    /**
     * Adds asset (vehicle/charge point, represented by wallet) to registry contract
     */
    public async addDevice(address: string, uid: string): Promise<void> {
        if (await this.deviceExists(address)) {
            console.log('[EV REGISTRY] device already exists', address, uid)
            return
        }
        console.log(`[${new Date()}]`, '[EV REGISTRY] device does not exist', address, uid)
        const user = await this.contract.signer.getAddress()
        // convert uid to buffer so vehicle ID isn't parsed as an integer 
        const { r, v, s } = await this.getSignature(address, Buffer.from(uid), user)
        await this.contract.addDevice(address, uid, user, v, r, s)
    }

    /**
     * EV Registry contract allows for transaction relaying but requires the
     * operator to add devices (i.e. can't be signed by device)
     * 
     * @param params arbitrary number of parameters that will be signed
     */
    private async getSignature(...params: any[]): Promise<Signature> {
        const hash = soliditySha3(...params)
        const hashBytes = arrayify(hash as string)
        const signature = await this.contract.signer.signMessage(hashBytes)
        return splitSignature(signature)
    }

} 
