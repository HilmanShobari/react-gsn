import { PaymasterType } from '@opengsn/common'

// a JSON array of deployed GSN networks. read paymaster addresses.
// (yarn deploy also reads the forwarder address)
import gsnDeployedNetworks from './gsn-networks.json'

// generated by "hardhat deploy" in this project
import ctfNetworks from './ctf-networks.json'

import { networksMetaInfo } from './networksMetaInfo'

export interface PaymasterDetails {
  name?: string
  address?: string
  dappOwner?: string
  paymasterType: PaymasterType
  debugUseType: boolean
}

interface NetworkType {
  name: string
  explorer?: string
  paymasters: PaymasterDetails[]
  ctf: string
  relayLookupWindowBlocks?: number
  relayRegistrationLookupBlocks?: number
  pastEventsQueryMaxPageSize?: number
}

function getLocalNetwork (): { paymaster: PaymasterDetails, ctf: string } | undefined {
  console.log('==reading localnet dir=', __dirname)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const paymasterAddress = require('../../../../build/gsn/Paymaster.json').address
    const paymaster: PaymasterDetails = {
      address: paymasterAddress,
      name: 'Accept Everything Paymaster',
      paymasterType: PaymasterType.AcceptEverythingPaymaster,
      debugUseType: false
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // const ctf = require('../../../ctf-eth/deployments/development/CaptureTheFlag.json').address
    const ctf = require('../../../ctf-eth/deployments/development/PermitSignatureGSN.json').address
    return { paymaster, ctf }
  } catch (e) {
    console.warn('No local network:', (e as Error).message)
  }
}

function getNetworksInfo (networks: string[]): { [chainId: string]: NetworkType } {
  return networks.reduce((set, chainId) => {
    console.log('network.reduce', chainId)
    let ctf: string
    let paymasters: PaymasterDetails[] = []
    if (chainId.match(/1337/) != null) {
      const localnet = getLocalNetwork()
      if (localnet == null) {
        // no local network..
        return set
      }
      paymasters = [localnet.paymaster]
      ctf = localnet.ctf
    } else {
      const entry = (gsnDeployedNetworks as any)[chainId]?.[0].contracts.paymasters
      for (const paymasterInfo of entry) {
        paymasters.push(paymasterInfo)
      }
      if (paymasters.length === 0) {
        throw new Error(`GSN (Paymaster) not deployed on ${chainId}`)
      }
      ctf = (ctfNetworks as any)[chainId][0].contracts?.CaptureTheFlag.address
      if (ctf == null) {
        throw new Error(`CaptureTheFlag not deployed on ${chainId}`)
      }
    }

    const metaItems = networksMetaInfo[chainId]
    if (metaItems == null) {
      throw new Error(`CTF deployed on ${chainId} but no networksMetaInfo`)
    }
    const { name, explorer } = metaItems
    const networkInfo: NetworkType = {
      name,
      explorer,
      ctf,
      paymasters
    }
    return {
      [chainId]: networkInfo,
      ...set
    }
  }, {})
}

// build a list from the CTF deployments.
// make sure we have GSN deployed on that network, too.
const ctfNetworkIds = Object.keys(ctfNetworks)
console.log('ctf networks=', ctfNetworkIds)
export const networks: { [chain: number]: NetworkType } =
  getNetworksInfo(['31337', '1337', ...ctfNetworkIds])

console.log('===exported networks=', networks)
