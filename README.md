# tapi-client-js

NodeJS Javascript Transact API client.

# prerequisites

NodeJS

# installation


```
npm i
```

# command-line-interface

A command line interface is provided to make TAPI requests. For convenience a curl equivalent command is printed before the response.

## Examples

```
npm run tapi getAllParties {}
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
