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
        node: "http://localhost:8080",
        stage: "local"
    },
    cpo: {
        port: 3000,
        publicIP: "http://localhost:3000",
        roles: [
            {
                party_id: "CPO",
                country_code: "CH",
                role: "CPO",
                business_details: {
                    name: `Test CPO ${uuid.v4()}`
                }
            }
        ],
        services: [],
        createAssetDIDs: false,
        assetCreationDelayMS: 10000
    },
    msp: {
        port: 3001,
        publicIP: "http://localhost:3001",
        roles: [
            {
                party_id: "MSP",
                country_code: "CH",
                role: "EMSP",
                business_details: {
                    name: `Test MSP ${uuid.v4()}`
                }
            }
        ],
        services: [],
        createAssetDIDs: false,
        assetCreationDelayMS: 10000,
        assetCount: 10
    },
    prequalification: {
        prequalificationIssuerRole: "tso.roles.evdashboard.apps.elia.iam.ewc",
        prequalifcationRole: "prequalified.roles.flexmarket.apps.elia.iam.ewc",
        provider: "https://volta-internal-archive.energyweb.org",
        chainId: 73799,
        user_claims_iam: {
            cacheServerUrl: "https://identitycache-dev.energyweb.org/",
        },
        asset_claims_iam: {
            cacheServerUrl: "https://identitycache-dev.energyweb.org/",
            natsServerUrl: "dsb-nats-dev.energyweb.org",
            natsProtocolPort: "4222",
        }
    },
    evRegistry: {
        address: "0x9fbda871d559710256a2502a2517b794b482db40",
        provider: "http://localhost:8544"
    }
}