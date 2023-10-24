const { tapi, auth } = require('../util');

const getIssuer = (issuerId) => tapi.post(
  '/getIssuer',
  new URLSearchParams({ ...auth, issuerId }),
);

const getAllIssuers = () => tapi.post(
  '/getAllIssuers',
  new URLSearchParams({ ...auth }),
);

const createIssuer = (issuer) => tapi.put(
  '/createIssuer',
  new URLSearchParams({ ...auth, ...issuer }),
);

const updateIssuer = (issuer) => tapi.post(
  '/updateIssuer',
  new URLSearchParams({ ...auth, ...issuer }),
);

const deleteIssuer = (issuerId) => tapi.post(
  '/deleteIssuer',
  new URLSearchParams({ ...auth, issuerId }),
);

module.exports = {
  getIssuer,
  createIssuer,
  updateIssuer,
  getAllIssuers,
  deleteIssuer,
};
