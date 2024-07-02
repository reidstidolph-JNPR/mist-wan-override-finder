'use strict'
// modules
const rest = require('axios')

// import org details from env.json
const apiToken = require('./env.json').token
const orgId = require('./env.json').orgId
const envBaseUrl = require('./env.json').envBaseUrl
const restReqConfig = { headers: { Authorization: `Token ${apiToken}` } }

// template config keys
// each value in this array represents a template setting
// that will be evaluated in device config, to determine if it is overidden
const templateConfigParams = [
  'port_config',
  'oob_ip_config',
  'ip_configs',
  'dhcpd_config',
  'router_id',
  'path_preferences',
  'tunnel_provider_options',
  'tunnel_configs',
  'idp_profiles',
  'service_policies',
  'bgp_config',
  'routing_policies',
  'extra_routes',
  'gateway_matching',
  'additional_config_cmds',
  'ntp_servers',
  'dns_servers'
]

// retrieve sites
async function getSites(){

  try {
    // get sites
    let sitesArray = await rest.get(`${envBaseUrl}/orgs/${orgId}/sites`, restReqConfig)
    let sites = {}

    // transform array of sites objects into a object keyed by siteId
    // for easy access to site parameters without further iteration
    for (const site of sitesArray.data) {

      if (!sites[site.id]) {
        sites[site.id] = site
      }
    }
    
    // returns a single sites object, keyed by siteId
    return sites

  } catch (error) {

    console.error(error)
    //bail out
    process.exit(1)
  }

}

// retrieve inventory
async function getInventory() {

  try {
    // get device inventory
    let inventory = await rest.get(`${envBaseUrl}/orgs/${orgId}/devices/search?type=gateway`, restReqConfig)
    return inventory.data.results

  } catch (error) {

    console.error(error)
    //bail out
    process.exit(1)
  }

}

// retrieve device
async function getDevice(siteId, deviceMac) {

  try {
    // get device
    let device = await rest.get(`${envBaseUrl}/sites/${siteId}/devices/00000000-0000-0000-1000-${deviceMac}`, restReqConfig)
    return device.data

  } catch (error) {

    console.error(error)
    //bail out
    process.exit(1)
  }

}

// main script flow control
async function main() {

  // array for storing device configs
  let deviceConfigs = []

  // get sites from the org
  console.log('getting sites...')
  let sites = await getSites()

  // get org SSR inventory array
  console.log('getting WAN edge inventory...')
  let inventory = await getInventory()

  // get each device from inventory and evaluate for overrides from template
  console.log('getting device configs...')
  for (const device of inventory) {

    if (
      // only take node0 device mac for clustered devices
      (device.mac === device.node0_mac || !device.node0_mac) && 
      // only take devices with assigned WAN template
      sites[device.site_id].gatewaytemplate_id !== null
    ) {
      let result = await getDevice(device.site_id, device.mac)
      // add selected device config to devices array
      deviceConfigs.push(result)
    }
  }

  console.log('device config retrieved, processing...')

  let results = {
    deviceCount : deviceConfigs.length,
    overrideDeviceCount : 0,
    logs : []
  }

  // evaluate each device for overrides from site template
  for (const device of deviceConfigs) {

    let deviceHasOverride = false
    
    templateConfigParams.forEach((setting) => {

      if (device[setting] && Object.keys(device[setting]).length > 0 ) {
        // console.log(`'${device.name}' at site '${sites[device.site_id].name}' has overwrites to the '${setting}' setting.`)
        results.logs.push(`'${device.name}' at site '${sites[device.site_id].name}' has overwrites to the '${setting}' setting`)
        deviceHasOverride = true
        //console.log(device)
      }
    })

    if (deviceHasOverride) { results.overrideDeviceCount++ }

  }

  console.log(`${results.overrideDeviceCount} of ${results.deviceCount} devices with WAN edge site templates have device-level overrides.`)
  console.log('details:')
  for (const log in results.logs) {
    console.log(` - ${results.logs[log]}`)
  }
}

main()