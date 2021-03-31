import { IEndpoint, IPluggableDB, IVersionDetail } from "@energyweb/ocn-bridge";

export class DatabaseMock implements IPluggableDB {

    private tokenB: string = ""
    private tokenC: string = ""
    private endpoints: IEndpoint[] = []

    public async getTokenB(): Promise<string> {
        return this.tokenB
    }

    public async setTokenB(token: string) {
        this.tokenB = token
    }

    public async getTokenC(): Promise<string> {
        return this.tokenC
    }

    public async setTokenC(token: string) {
        this.tokenC = token
    }

    public async getEndpoint(identifier: string, role: "SENDER" | "RECEIVER"): Promise<string> {
        const found = this.endpoints.find((endpoint) => endpoint.identifier === identifier && endpoint.role == role)
        if (found) {
            return found.url
        }
        throw Error("Endpoint not found.")
    }

    public async saveEndpoints(versionDetail: IVersionDetail) {
        this.endpoints = versionDetail.endpoints
    }

}
