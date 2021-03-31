import { Keys } from "@ew-did-registry/keys"
import * as sqlite3 from "better-sqlite3"
import { assert } from "chai"

import { locations } from "../../src/data/locations"
import { tokens } from "../../src/data/tokens"
import { Database } from "../../src/database"
import { DIDFactory } from "../../src/ev-registry/models/dids/did-factory"
import { IDIDCache } from "../../src/types"

// tests require volta transactions (set high to be on safer side)
const timeout = 2 * 60 * 1000

describe("DID Creation", () => {

    // Should be funded on volta (this is the key of the eMSP/CPO)
    // address: '0xf3DCA18f8d3b0b093d7c723D3C322632F8cC14C5'
    const operatorKey = new Keys({
        privateKey: "0x2902d5e4a9c8d22ab338a46d0fb96bb0ecc6321fcfc7c8aff2544127cec9c637"
    })

    let db: IDIDCache
    let assetIdentityFactory: DIDFactory

    before(() => {
        db = new Database("test.db")
        assetIdentityFactory = new DIDFactory(operatorKey, db, true)
    })

    after(() => {
        const conn = sqlite3.default("test.db")
        conn.prepare("DROP TABLE dids").run()
    })

    it("should create vehicle DID", async () => {
        const vehicle = tokens[0]

        // test asset DID is created
        const asset = await assetIdentityFactory.createVehicleDID(vehicle)
        assert.isString(asset.did)
        assert.equal(asset.did, asset.document?.did)

        // test asset DID is resolved once created
        const resolved = await assetIdentityFactory.createVehicleDID(vehicle)
        assert.isString(resolved.did)
        assert.equal(resolved.did, resolved.document?.did)
        assert.equal(asset.did, resolved.did)
    }).timeout(timeout)

    it("should create charge point DIDs", async () => {
        const chargePoint = locations[0]

        // test assets are created (evses within location)
        const assets = await assetIdentityFactory.createChargePointDIDs(chargePoint)
        for (const asset of assets) {
            assert.isString(asset.did)
            assert.equal(asset.did, asset.document?.did)
        }

        // test assets are resolved once created
        const resolvedAssets = await assetIdentityFactory.createChargePointDIDs(chargePoint)
        for (const [i, resolved] of resolvedAssets.entries()) {
            assert.isString(resolved.did)
            assert.equal(resolved.did, resolved.document?.did)
            assert.equal(assets[i].did, resolved.did)
        }

    }).timeout(timeout)

})
