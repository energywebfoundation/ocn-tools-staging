import { IBridgeConfigurationOptions, startBridge, stopBridge } from "@energyweb/ocn-bridge"
import { assert } from "chai"
import "mocha"
import fetch from "node-fetch"
import { cpoConfig, monitorFactory, mspConfig } from "./index.setup"

describe("Bridge Integration", () => {

    async function shouldLoad(config: IBridgeConfigurationOptions) {
        const server = await startBridge(config)
        monitorFactory.setRequestService(server.requests)

        const result = await fetch(config.publicBridgeURL)
        const text = await result.text()
        assert.equal(text, "OCN Bridge v2.0.0")

        await stopBridge(server)
    }

    it("should run cpo backend", async () => shouldLoad(cpoConfig))

    it("should run msp backend", async () => shouldLoad(mspConfig))

})
