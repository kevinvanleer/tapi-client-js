const parties = require('./parties');
const accounts = require('./accounts');
const links = require('./links');
const kycAml = require('./kyc-aml');
const accreditationVerification = require('./accreditation-verification');
const offerings = require('./offerings');
const trades = require('./trades');
const issuers = require('./issuers');

module.exports = {
  parties,
  accounts,
  accreditationVerification,
  links,
  kycAml,
  offerings,
  trades,
  issuers,
};
