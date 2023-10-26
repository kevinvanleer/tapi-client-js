const { put, post } = require('../util');

const getIssuer = (issuerId) => post(
  '/getIssuer',
  { issuerId },
);

const getAllIssuers = () => post(
  '/getAllIssuers',
);

const createIssuer = (issuer) => put(
  '/createIssuer',
  { ...issuer },
);

const updateIssuer = (issuer) => post(
  '/updateIssuer',
  { ...issuer },
);

const deleteIssuer = (issuerId) => post(
  '/deleteIssuer',
  { issuerId },
);

module.exports = {
  getIssuer,
  createIssuer,
  updateIssuer,
  getAllIssuers,
  deleteIssuer,
};
