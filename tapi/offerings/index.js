const { put, post } = require('../util');

const getOffering = (offeringId) => post(
  '/getOffering',
  { offeringId },
);

const getAllOfferings = () => post(
  '/getAllOffers',
);

const createOffering = (offering) => put(
  '/createOffering',
  { ...offering },
);

const updateOffering = (offering) => post(
  '/updateOffering',
  { ...offering },
);

const deleteOffering = (offeringId) => post(
  '/deleteOffering',
  { offeringId },
);

module.exports = {
  getOffering,
  createOffering,
  updateOffering,
  getAllOfferings,
  deleteOffering,
};
