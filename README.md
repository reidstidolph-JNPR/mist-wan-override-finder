# Mist WAN Edge Device Override Audit

This app audits an org to find devices that have deviated from WAN edge templates with device-level overrides.

## Prerequisites

1. Have Docker and `docker-compose` installed.
2. Create a file called `env.json` with properties for `orgId`, `token` (API token), and `envBaseUrl` (base URL for API calls). Example:

```json
{
  "token": "ru5es...kPE5f",
  "orgId": "1ec....f2e",
  "envBaseUrl": "https://api.mist.com/api/v1"
}
```

## Run

To run the script:
```
docker-compose run config-audit
```

Example output:
```
% docker-compose run config-audit
getting sites...
getting WAN edge inventory...
getting device configs...
device config retrieved, processing...
2 of 2 devices with WAN edge site templates have device-level overrides.
details:
 - 'Sunnyvale-Spoke' at site 'Sunnyvale' has overwrites to the 'service_policies' setting
 - 'Las_Vegas-Spoke' at site 'Las Vegas' has overwrites to the 'path_preferences' setting
```