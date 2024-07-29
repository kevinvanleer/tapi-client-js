# tapi-client-js

NodeJS Javascript Transact API client.

# prerequisites

NodeJS
tapi-db-seeder
Transact API local development environment
Transact API credentials

# installation

```
npm i
```

# setup

Use `tapi-db-seeder` to insert data into the development database. See README in `tapi-db-seeder` repository for further instructions.

Configure environment variables for TAPI authentication. An example file has been provided for local development environments.

```
source .env-tapi-local
```

# command-line-interface

A command line interface is provided to make TAPI requests. For convenience a curl equivalent command is printed before the response.

## Examples

```
npm run tapi get parties
npm run tapi get "parties?limit=1"
```

```
npm run tapi getParties {}
```

```
npm run tapi getParty '{\"partyId\":\"<YOUR_PARTY_ID>\"}'
```

# Tests

## Run all tests

```
npm run test
```

## Run party tests

```
npm run test parties/_
```

## Run create party tests

```
npm run test parties/_ -- --testNamePattern=createParty
```

Daily test results can be found here:

https://transact-api-test-reports.kvlllc.com/
