const { tapi, auth } = require('../util');

const getOffering = (offeringId) => tapi.post(
  '/getOffering',
  { ...auth, offeringId },
);

const getAllOfferings = () => tapi.post(
  '/getAllOffers',
  { ...auth },
);

const createOffering = (offering) => tapi.put(
  '/createOffering',
  { ...auth, ...offering },
);

const updateOffering = (offering) => tapi.post(
  '/updateOffering',
  { ...auth, ...offering },
);

const deleteOffering = (offeringId) => tapi.post(
  '/deleteOffering',
  { ...auth, offeringId },
);

module.exports = {
  getOffering,
  createOffering,
  updateOffering,
  getAllOfferings,
  deleteOffering,
};
