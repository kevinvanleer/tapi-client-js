const { convert: convertBase } = require('../util');

const requiredFieldsMapping = [
  ['type', 'types'],
  ['accountId', 'accountId'],
  ['accountHolderName', 'ExtAccountfullname'],
  ['accountName', 'Extnickname'],
  ['routingNumber', 'ExtRoutingnumber'],
  ['accountNumber', 'ExtAccountnumber'],
  ['updatedIpAddress', 'updatedIpAddress'],
];

const createAchAccountMapping = [...requiredFieldsMapping, ['bankName', 'ExtBankname'], ['accountType', 'accountType']];

const externalFundMoveRequiredMapping = [
  ['accountId', 'accountId'],
  ['offeringId', 'offeringId'],
  ['tradeId', 'tradeId'],
  ['accountName', 'NickName'],
  ['amount', 'amount'],
  ['description', 'description'],
  ['checkNumber', 'checkNumber'],
];

const externalFundMoveMapping = externalFundMoveRequiredMapping;

const hasRequiredFields = (user) =>
  requiredFieldsMapping.map((m) => m[0]).reduce((acc, param) => acc && user[param] != null, true);

const filter = (parties, query, archived = false) =>
  parties.partyDetails.filter((party) =>
    Object.entries(query).reduce(
      (pass, [k, v]) => pass && party[k] === v && (party.partystatus.toLowerCase() === 'archived') === archived,
      true,
    ),
  );

const convert = (requestBody, mapping = createAchAccountMapping) => convertBase(requestBody, mapping);

module.exports = {
  hasRequiredFields,
  filter,
  externalFundMoveMapping,
  convert,
};
