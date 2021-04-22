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
        node: "https://test-ocn.emobilify.com",
        stage: "volta"
    },
    cpo: {
        port: 3000,
        publicIP: "https://dev-ev-dashboard-cpo.energyweb.org",
        roles: [
            {
                party_id: "KZA",
                country_code: "PL",
                role: "CPO",
                business_details: {
                    name: `Test CPO ${uuid.v4()}`
                }
            }
        ],
        services: [],
        assetCreationDelayMS: 10000,
        createAssetDIDs: false
    },
    msp: {
        port: 3001,
        publicIP: "https://dev-ev-dashboard-msp.energyweb.org",
        roles: [
            {
                party_id: "KZB",
                country_code: "PL",
                role: "EMSP",
                business_details: {
                    name: `Test MSP ${uuid.v4()}`
                }
            }
        ],
        services: [],
        createAssetDIDs: false,
        assetCreationDelayMS: 10000,
        assetCount: 200
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
            natsServerUrl: "identityevents-dev-nats.energyweb.org",
            natsProtocolPort: "4222",
        }
    },
    evRegistry: {
        address: "0x8d80504617eB17816b91610Fb2a0274Dc70f193f",
        provider: "https://volta-internal-archive.energyweb.org"
    }
}
