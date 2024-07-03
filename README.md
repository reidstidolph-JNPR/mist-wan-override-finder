# Mist WAN Edge Device Override Audit

This app audits an org to find devices that have deviated from WAN edge templates with device-level overrides.

## Prerequisites

1. Have Docker and `docker-compose` installed.
2. Create a file called `env.json` with properties for `orgId`, `token` (API token), and `envBaseUrl` (base URL for API calls). Example:

```json
{
  "token": "ru5...E5f",
  "orgId": "1ec....f2e",
  "envBaseUrl": "https://api.mist.com/api/v1"
}
```

## Build and Run

Use 1 of the following 2 options run the script:

### with just Docker

Use this if you only have Docker.

1. Build a docker image:
```
docker build -t config-audit
```
2. Run it:
```
docker run --rm -v ./env.json:/home/node/app/env.json config-audit
```

This creates a one-time container based on the image, and destroys it when finished. 

Alternatively, to create as a persistent container:
```
docker create --name config-audit -v ./env.json:/home/node/app/env.json config-audit
```
Then to run subsequently:
```
docker start -i config-audit
```

### with `docker-compose`

1. Use this is you have Docker + docker-compose.
```
docker-compose run --rm config-audit
```

### Example output:
```
% docker run --rm config-audit
getting sites...
getting WAN edge inventory...
getting device configs...
device config retrieved, processing...
2 of 2 devices with WAN edge site templates have device-level overrides.
details:
 - 'Sunnyvale-Spoke' at site 'Sunnyvale' has overwrites to the 'service_policies' setting
 - 'Las_Vegas-Spoke' at site 'Las Vegas' has overwrites to the 'path_preferences' setting
```

## Mist API Usage

This script does `GET` requests of the following Mist API endpoints:

### Inventory
This is queried to retrieve WAN edge device inventory, and used to determine what site each device is assigned to.
```
/api/v1/orgs/${orgId}/devices/search?type=gateway
```

### Sites
This is queried to retrieve all sites in an org. The script uses this to determine which sites have WAN templates assigned, and resolve site names for user-friendly display.
```
/api/v1/orgs/${orgId}/sites
```
This is queried to retrieve device config for each device belonging to a site with a WAN template attached.
### Device

```
/api/v1/sites/${siteId}/devices/00000000-0000-0000-1000-${deviceMac}
```

## Optional

The script uses a built in list of WAN edge template settings to evaluate each device config for, to determine if it has overrides. It determines that a device has overrides if the device config is found to have a property with a name matching the list, that also has a value set to a non-empty object. The list is based on documented WAN edge template settings (see docs for `/api/v1/docs/Org#gateway-template`). Only settings in this list will be looked for by the scripe.

If you wanted to pass in a custom list of settings, you can do so by adding a `settings` array to your `env.json`. A provided `settings` property in `env.json` will override the default list of settings in the script.

Example `env.json` containg settings:
```
{
  "token": "ru5...E5f",
  "orgId": "1ec...7f2e",
  "envBaseUrl": "https://api.mistsys.com/api/v1",
  "settings": [
    "port_config",
    "oob_ip_config",
    "ip_configs",
    "dhcpd_config",
    "router_id",
    "path_preferences",
    "tunnel_provider_options",
    "tunnel_configs",
    "idp_profiles",
    "service_policies",
    "bgp_config",
    "routing_policies",
    "extra_routes",
    "gateway_matching",
    "additional_config_cmds",
    "ntp_servers",
    "dns_servers"
  ]
}