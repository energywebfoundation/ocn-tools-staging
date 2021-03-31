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
import { IVersionDetail } from "@energyweb/ocn-bridge"
import * as sqlite3 from "better-sqlite3"
import { IAssetIdentity, IDIDCache } from "./types"

export class Database implements IDIDCache {

    private db: sqlite3.Database

    constructor(name: string) {
        this.db = sqlite3.default(name)
        this.db.prepare("CREATE TABLE IF NOT EXISTS auth (id INTEGER UNIQUE, token_b TEXT, token_c TEXT)").run()
        this.db.prepare("CREATE TABLE IF NOT EXISTS endpoints (identifier TEXT, role TEXT, url TEXT)").run()
        this.db.prepare("CREATE TABLE IF NOT EXISTS dids (id INTEGER PRIMARY KEY, uid TEXT, did TEXT, private_key TEXT)").run()

        const exists = this.db.prepare("SELECT id FROM auth").pluck().get()
        if (!exists) {
            this.db.prepare("INSERT INTO auth (id) values (1)").run()
        }
    }

    public async getTokenB(): Promise<string> {
        const token_b = this.db.prepare("SELECT token_b FROM auth WHERE id = 1").pluck().get()
        return token_b || ""
    }

    public async setTokenB(tokenB: string) {
        this.db.prepare("UPDATE auth SET token_b = ? WHERE id = 1").run(tokenB)
    }

    public async getTokenC(): Promise<string> {
        const token_c = this.db.prepare("SELECT token_c FROM auth WHERE id = 1").pluck().get()
        return token_c || ""
    }

    public async setTokenC(tokenC: string) {
        this.db.prepare("UPDATE auth SET token_c = ? WHERE id = 1").run(tokenC)
    }

    public async saveEndpoints(versionDetail: IVersionDetail) {
        for (const endpoint of versionDetail.endpoints) {

            const exists = this.db
                .prepare("SELECT url FROM endpoints WHERE identifier = ? AND role = ?")
                .pluck()
                .get(endpoint.identifier, endpoint.role)

            if (exists) {
                this.db
                    .prepare("UPDATE endpoints SET url = ? WHERE identifier = ? AND role = ?")
                    .run(endpoint.url, endpoint.identifier, endpoint.role)
            } else {
                this.db
                    .prepare("INSERT INTO endpoints (identifier, role, url) VALUES (?,?,?)")
                    .run(endpoint.identifier, endpoint.role, endpoint.url)
            }
        }
    }

    public async getEndpoint(identifier: string, role: string): Promise<string> {
        const url = this.db.prepare("SELECT url FROM endpoints WHERE identifier = ? AND role = ?").pluck().get(identifier, role)
        return url || ""
    }

    public getAssetIdentity(id: string): IAssetIdentity | undefined {
        const asset = this.db.prepare("SELECT * FROM dids WHERE uid = ?").get(id)
        if (!asset) {
            return
        }
        return {
            uid: asset.uid,
            did: asset.did,
            privateKey: asset.private_key
        }
    }

    public getAssetIdentityByDID(did: string): IAssetIdentity | undefined {
        const asset = this.db.prepare("SELECT * FROM dids WHERE did = ?").get(did)
        if (!asset) {
            return
        }
        return {
            uid: asset.uid,
            did: asset.did,
            privateKey: asset.private_key
        }
    }

    public setAssetIdentity(asset: IAssetIdentity): void {
        this.db
            .prepare("INSERT INTO dids (uid, did, private_key) VALUES (?,?,?)")
            .run(asset.uid, asset.did, asset.privateKey)
    }

}
