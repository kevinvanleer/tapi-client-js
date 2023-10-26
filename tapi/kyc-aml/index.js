const { post } = require('../util');

const performKycAmlBasic = (partyId) => post(
  '/performKycAmlBasic',
  { partyId },
);

const getKycAml = (partyId, type) => post(
  '/getKycAmlResponse',
  { partyId, type },
);
const getKycAmlBasic = (partyId) => getKycAml(partyId, 'Basic');
const getKycAmlEnhanced = (partyId) => getKycAml(partyId, 'Enhanced');
const getAmlOnly = (partyId) => getKycAml(partyId, 'AML Only');

module.exports = {
  performKycAml: performKycAmlBasic,
  getKycAml: getKycAmlBasic,
  getKycAmlBasic,
  getKycAmlEnhanced,
  getAmlOnly,
};
