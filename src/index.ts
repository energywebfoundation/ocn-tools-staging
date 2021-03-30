/*
    Copyright 2019-2020 eMobilify GmbH

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
import { DefaultRegistry, ModuleImplementation, startBridge, stopBridge } from "@energyweb/ocn-bridge"
import { Keys } from "@ew-did-registry/keys"
import * as yargs from "yargs"
import { MockAPI } from "./api/mock-api"
import { config } from "./config/config"
import { locations } from "./data/locations"
import { tokens } from "./data/tokens"
import { Database } from "./database"
import { EvRegistry } from "./ev-registry/models/contracts/ev-registry"
import { DIDFactory, sleep } from "./ev-registry/models/dids/did-factory"
import { PrequalificationClient } from "./ev-registry/prequalification-client"
import { MockMonitorFactory } from "./models/mock-monitor-factory"
import { IAssetIdentity, IDIDCache } from "./types"

const setAgreements = async (services: string[], registry: DefaultRegistry) => {
    for (const service of services) {
        try {
            await registry.permissions.createAgreement(service)
        } catch (err) {
            console.log(`[OCN] service ${service} agreement failed: ${err.message}`)
        }
    }
}

const createAssetDIDs = async (operatorType: "msp" | "cpo", db: IDIDCache) => {
    if (!process.env.OCN_IDENTITY) {
        console.log("[DID] OCN_IDENTITY not set. Cannot create asset DIDs.")
        return
    }
    const key = new Keys({ privateKey: process.env.OCN_IDENTITY })

    // add user to ev registry (needs to be done before devices are added)
    const evRegistry = new EvRegistry(key)
    console.log("[EV REGISTRY] Adding operator")
    await evRegistry.addUser()
    console.log("[EV REGISTRY] Added operator")

    const factory = new DIDFactory(key, db)
    if (operatorType === "msp") {
        console.log("[ASSET] creating", tokens.length, "vehicles")
        for (const token of tokens) {
            try {
                console.log(`[${new Date()}]`, "[ASSET] creating vehicle did", token.uid)
                await factory.createVehicleDID(token)
                // Add sleep to prevent "transaction already in queue" error
                await sleep(config.cpo.assetCreationDelayMS)
                console.log(`[${new Date()}]`, "[ASSET] created vehicle did", token.uid)
            } catch (err) {
                console.log(`[${new Date()}]`, `[ASSET] Failed to create DID for vehicle(${token.uid}): ${err.message}`)
            }
        }
    }
    if (operatorType === "cpo") {
        console.log(`[${new Date()}]`, "[ASSET] creating", locations.length, "charge points")
        for (const location of locations) {
            try {
                console.log(`[${new Date()}]`, "[ASSET] creating charge point dids", location.id)
                await factory.createChargePointDIDs(location)
                console.log(`[${new Date()}]`, "[ASSET] created charge point dids", location.id)
            } catch (err) {
                console.log(`[${new Date()}]`, `[ASSET] Failed to create DIDs for location(${location.id}): ${err.message}`)
            }
        }
    }

}

yargs
    .command("mock", "Start a mock OCPI party server", (context) => {
        context
            .option("cpo", {
                alias: "c",
                boolean: true,
                describe: "Charge Point Operator"
            })
            .option("msp", {
                alias: "m",
                boolean: true,
                describe: "e-mobility service provider"
            })
            .option("register-only", {
                alias: "r",
                boolean: true,
                describe: "register party to OCN then close"
            })
            .help()
    }, async (args) => {

        if (!args.cpo && !args.msp) {
            console.log("Need one of options \"cpo\", \"msp\"")
            process.exit(1)
        }
        const registry = new DefaultRegistry(config.ocn.stage, process.env.OCN_IDENTITY, process.env.OCN_SPENDER)
        const monitorFactory = new MockMonitorFactory()
        const api = new MockAPI(monitorFactory)

        if (args.cpo) {

            console.log("[CORE] Starting CPO server...")

            const database = new Database("cpo.db")

            const cpoBridge = await startBridge({
                port: config.cpo.port,
                publicBridgeURL: config.cpo.publicIP,
                ocnNodeURL: config.ocn.node,
                roles: config.cpo.roles,
                modules: {
                    implementation: ModuleImplementation.CPO
                },
                pluggableAPI: api,
                pluggableDB: database,
                pluggableRegistry: registry,
                logger: true,
                signatures: true,
                signer: process.env.OCN_IDENTITY,
                tokenA: process.env.OCN_TOKEN_A,
            })

            monitorFactory.setRequestService(cpoBridge.requests)

            // set agreements from config
            await setAgreements(config.cpo.services || [], registry)

            console.log("[CORE] CPO server listening for OCPI requests")

            const token = await database.getTokenC()
            console.log(`[CORE] To send requests as the CPO, use Authorization Token ${token}`)

            if (config.cpo.createAssetDIDs) {
                createAssetDIDs("cpo", database)
            }

            const getAssetIdentityByDID = (assetDID: string): IAssetIdentity | undefined => {
                return database.getAssetIdentityByDID(assetDID)
            }
            PrequalificationClient.init({ getAssetIdentityByDID })

            if (args.registerOnly) {
                console.log("[CORE] Shutting down CPO server...")
                await stopBridge(cpoBridge)
            }
        } else if (args.msp) {

            console.log("[CORE] Starting MSP server...")

            const database = new Database("msp.db")

            const mspServer = await startBridge({
                port: config.msp.port,
                publicBridgeURL: config.msp.publicIP,
                ocnNodeURL: config.ocn.node,
                roles: config.msp.roles,
                modules: {
                    implementation: ModuleImplementation.MSP
                },
                pluggableAPI: api,
                pluggableDB: database,
                pluggableRegistry: registry,
                logger: true,
                signatures: true,
                signer: process.env.OCN_IDENTITY,
                tokenA: process.env.OCN_TOKEN_A
            })

            monitorFactory.setRequestService(mspServer.requests)

            // set agreements from config
            await setAgreements(config.msp.services || [], registry)

            console.log("[CORE] MSP server listening for OCPI requests")

            const token = await database.getTokenC()
            console.log(`[CORE] To send requests as the MSP, use Authorization Token ${token}`)

            if (config.msp.createAssetDIDs) {
                createAssetDIDs("msp", database)
            }

            const getAssetIdentityByDID = (assetDID: string): IAssetIdentity | undefined => {
                return database.getAssetIdentityByDID(assetDID)
            }
            PrequalificationClient.init({ getAssetIdentityByDID })

            if (args.registerOnly) {
                console.log("[CORE] Shutting down MSP server...")
                await stopBridge(mspServer)
            }
        }

    })
    .help()
    .parse()
