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

import { IConnector, ILocation, IOcpiParty, IStartSession, ITariff, RequestService } from "@energyweb/ocn-bridge"
import { MockMonitor } from "./mock-monitor"

export class MockMonitorFactory {
    private requestService?: RequestService

    public create(id: string, request: IStartSession, recipient: IOcpiParty, location: ILocation, connector: IConnector, tariff?: ITariff): MockMonitor {
        if (!this.requestService) {
            throw Error("Unable to create MockMonitor instance: RequestService not set.")
        }
        return new MockMonitor(id, request, recipient, location, connector, this.requestService, tariff)
    }

    public setRequestService(requestService: RequestService) {
        this.requestService = requestService
    }

}
