const { tapi, auth } = require('../util');

const getIssuer = (issuerId) => tapi.post(
  '/getIssuer',
  { ...auth, issuerId },
);

const getAllIssuers = () => tapi.post(
  '/getAllIssuers',
  auth,
);

const createIssuer = (issuer) => tapi.put(
  '/createIssuer',
  { ...auth, ...issuer },
);

const updateIssuer = (issuer) => tapi.post(
  '/updateIssuer',
  { ...auth, ...issuer },
);

const deleteIssuer = (issuerId) => tapi.post(
  '/deleteIssuer',
  { ...auth, issuerId },
);

module.exports = {
  getIssuer,
  createIssuer,
  updateIssuer,
  getAllIssuers,
  deleteIssuer,
};
