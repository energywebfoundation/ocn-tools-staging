import { ILocation, IToken } from "@energyweb/ocn-bridge"
import { Keys } from "@ew-did-registry/keys"
import { config } from "../../../config/config"
import { IDIDCache } from "../../../types"
import { DID } from "./did"

/**
 * Creates a DID of a certain asset type
 */
export class DIDFactory {

    /**
     *
     * @param operatorKey key used to 'control' the DID (asset operator)
     * @param db local DID cache for tracking which assets have DIDs
     */
    constructor(private operatorKey: Keys, private db: IDIDCache, private skipRegistry?: boolean) { }

    /**
     * Create (or resolve) a vehicle's DID
     *
     * @param token an MSP token representing a vehicle
     */
    public async createVehicleDID(token: IToken): Promise<DID> {
        return DID.init(token.uid, this.operatorKey, this.db, this.skipRegistry)
    }

    /**
     * Create (or resolve) a charge point's DID
     *
     * @param location a CPO location representing n evses
     */
    public async createChargePointDIDs(location: ILocation): Promise<DID[]> {
        const evses = location.evses
        if (!evses) {
            return []
        }
        const dids: DID[] = []
        for (const evse of evses) {
            if (evse.evse_id) {
                const did = await DID.init(evse.evse_id, this.operatorKey, this.db, this.skipRegistry)
                // Add sleep to prevent "transaction already in queue" error
                await sleep(config.cpo.assetCreationDelayMS)
                dids.push(did)
            }
        }

        return dids
    }

}

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}