const { tapi, auth } = require('../util');

const performKycAmlBasic = (partyId) => tapi.post(
  '/performKycAmlBasic',
  { ...auth, partyId },
);

const getKycAml = (partyId, type) => tapi.post(
  '/getKycAmlResponse',
  { ...auth, partyId, type },
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
