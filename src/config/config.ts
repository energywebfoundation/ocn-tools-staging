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
import * as uuid from "uuid"
import { IOcnToolsConfig } from "../types"

export const config: IOcnToolsConfig = {
    ocn: {
        node: process.env.OCN_NODE_URL || "https://test-ocn.emobilify.com",
        stage: process.env.OCN_STAGE  || "volta"
    },
    cpo: {
        port: parseInt(process.env.CPO_PORT || "3000", 10),
        publicIP: process.env.CPO_PUBLIC_IP || "https://dev-ev-dashboard-cpo.energyweb.org",
        roles: [
            {
                party_id: process.env.CPO_PARTY_ID || "KZA",
                country_code: process.env.CPO_COUNTRY_CODE || "PL",
                role: "CPO",
                business_details: {
                    name: process.env.CPO_NAME || `Test CPO ${uuid.v4()}`
                }
            }
        ],
        services: [],
        assetCreationDelayMS: parseInt(process.env.CPO_ASSET_CREATION_DELAY || "10000", 10),
        createAssetDIDs: false
    },
    msp: {
        port: parseInt(process.env.MSP_PORT || "3001", 10),
        publicIP: process.env.MSP_PUBLIC_IP || "https://dev-ev-dashboard-msp.energyweb.org",
        roles: [
            {
                party_id: process.env.MSP_PARTY_ID || "KZB",
                country_code: process.env.MSP_COUNTRY_CODE || "PL",
                role: "EMSP",
                business_details: {
                    name: process.env.MSP_NAME || `Test MSP ${uuid.v4()}`
                }
            }
        ],
        services: [],
        createAssetDIDs: false,
        assetCreationDelayMS: parseInt(process.env.MSP_ASSET_CREATION_DELAY || "10000", 10),
        assetCount: parseInt(process.env.MSP_ASSET_COUNT || "200", 10),
    },
    prequalification: {
        prequalificationIssuerRole: process.env.PREQUALIFICATION_ISSUER_ROLE ?? "tso.roles.evdashboard.apps.elia.iam.ewc",
        prequalifcationRole: process.env.PREQUALIFICATION_ROLE ?? "prequalified.roles.flexmarket.apps.elia.iam.ewc",
        provider: process.env.EWC_RPC_URL ?? "https://volta-internal-archive.energyweb.org",
        chainId: 73799,
        user_claims_iam: {
            cacheServerUrl: process.env.USER_CACHE_SERVER_URL ?? "https://identitycache-dev.energyweb.org/",
        },
        asset_claims_iam: {
            cacheServerUrl: process.env.ASSET_CACHE_SERVER_URL ?? "https://identitycache-dev.energyweb.org/",
            natsServerUrl: process.env.NATS_SERVER_URL ?? "identityevents-dev-nats.energyweb.org",
            natsProtocolPort: process.env.NATS_PROTOCOL_PORT ?? "4222",
        }
    },
    evRegistry: {
        address: process.env.EV_REGISTRY_ADDRESS || "0x8d80504617eB17816b91610Fb2a0274Dc70f193f",
        provider: process.env.EV_REGISTRY_PROVIDER || "https://volta-internal-archive.energyweb.org"
    }
}
