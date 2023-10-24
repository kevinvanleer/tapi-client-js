const { tapi, auth } = require('../util');

const getOffering = (offeringId) => tapi.post(
  '/getOffering',
  new URLSearchParams({ ...auth, offeringId }),
);

const getAllOfferings = () => tapi.post(
  '/getAllOffers',
  new URLSearchParams({ ...auth }),
);

const createOffering = (offering) => tapi.put(
  '/createOffering',
  new URLSearchParams({ ...auth, ...offering }),
);

const updateOffering = (offering) => tapi.post(
  '/updateOffering',
  new URLSearchParams({ ...auth, ...offering }),
);

const deleteOffering = (offeringId) => tapi.post(
  '/deleteOffering',
  new URLSearchParams({ ...auth, offeringId }),
);

module.exports = {
  getOffering,
  createOffering,
  updateOffering,
  getAllOfferings,
  deleteOffering,
};
