import { Keys } from '@ew-did-registry/keys'
import { DIDFactory } from '../src/models/dids/did-factory'
import { tokens } from '../src/data/tokens'
import { IDIDCache } from '../src/types'

const PRIVKEY = process.env.PRIVKEY

const UID_LIST = [
    // '30311759',
    '96591248',
    '99981516',
    '84172013',
    '14103302',
    '14200242',
]

// need to remove the interface inheritence
const didCache: IDIDCache = {
    getAssetIdentity: () => undefined,
    setAssetIdentity: console.log
}

const main = async () => {
    const keys = new Keys({privateKey: PRIVKEY})
    const factory = new DIDFactory(keys, didCache)
    for (const uid of UID_LIST) {
        const token = tokens.find(token => token.uid === uid)
        if (!token) {
            continue
        }
        console.log('creating for', token.uid)
        await factory.createVehicleDID(token)
    }

}

main()

/**
 * 
creating for 96591248
[DID] Minted 0.001 for 0x0f7a57fdEDfbeF0d9516039954F68CEE6EFDb2D9. Remaining balance: 0.986
[DID] Created identity for 96591248: did:ethr:0x0f7a57fdEDfbeF0d9516039954F68CEE6EFDb2D9
[EV REGISTRY] Saved asset did:ethr:0x0f7a57fdEDfbeF0d9516039954F68CEE6EFDb2D9
{
  uid: '96591248',
  did: 'did:ethr:0x0f7a57fdEDfbeF0d9516039954F68CEE6EFDb2D9',
  privateKey: 'b4d84afe3fa35b645ccacc1ef70f15c0581b2270ec29d1c3f18e7b452936b5e6'
}
creating for 99981516
[DID] Minted 0.001 for 0x09BEbDFC45DFb278e4293aCB4f4F4c257D1c7952. Remaining balance: 0.985
[DID] Created identity for 99981516: did:ethr:0x09BEbDFC45DFb278e4293aCB4f4F4c257D1c7952
[EV REGISTRY] Saved asset did:ethr:0x09BEbDFC45DFb278e4293aCB4f4F4c257D1c7952
{
  uid: '99981516',
  did: 'did:ethr:0x09BEbDFC45DFb278e4293aCB4f4F4c257D1c7952',
  privateKey: '63a447aac2cfa13fe14a55359c175f4368f275e353a12d653501059f29635727'
}
creating for 84172013
[DID] Minted 0.001 for 0xC0f584945aA88Cc4098Daa5115208e88630e5a59. Remaining balance: 0.984
[DID] Created identity for 84172013: did:ethr:0xC0f584945aA88Cc4098Daa5115208e88630e5a59
[EV REGISTRY] Saved asset did:ethr:0xC0f584945aA88Cc4098Daa5115208e88630e5a59
{
  uid: '84172013',
  did: 'did:ethr:0xC0f584945aA88Cc4098Daa5115208e88630e5a59',
  privateKey: 'a512b9c480a44d19370fa85d1870198d7e721cee392c3de607ea8a8903e02a46'
}
creating for 14103302
[DID] Minted 0.001 for 0x0fd6C42b82C8783c70D59a41962aaa45651C46f5. Remaining balance: 0.983
[DID] Created identity for 14103302: did:ethr:0x0fd6C42b82C8783c70D59a41962aaa45651C46f5
[EV REGISTRY] Saved asset did:ethr:0x0fd6C42b82C8783c70D59a41962aaa45651C46f5
{
  uid: '14103302',
  did: 'did:ethr:0x0fd6C42b82C8783c70D59a41962aaa45651C46f5',
  privateKey: '7fd5d88e6886c640339c7885f56d27872e6276a852fb67bc792856071ff5e2c5'
}
creating for 14200242
[DID] Minted 0.001 for 0x49E679e082E555f0c90f97c4f6cF99A898c276B8. Remaining balance: 0.982
[DID] Created identity for 14200242: did:ethr:0x49E679e082E555f0c90f97c4f6cF99A898c276B8
[EV REGISTRY] Saved asset did:ethr:0x49E679e082E555f0c90f97c4f6cF99A898c276B8
{
  uid: '14200242',
  did: 'did:ethr:0x49E679e082E555f0c90f97c4f6cF99A898c276B8',
  privateKey: 'c8e2131c1ecee36e90bd0ef07c476961a29c25d462ad91fa780a111df76f1afc'
}
 * 
 */