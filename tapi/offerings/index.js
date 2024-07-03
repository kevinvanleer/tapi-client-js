const FormData = require('form-data');
const { Readable } = require('stream');

const { tapi, auth, put, post } = require('../util');

const getOffering = (offeringId) => post('/getOffering', { offeringId });

const getAllOfferings = () => post('/getAllOffers');

const createOffering = (offering) => put('/createOffering', { ...offering });

const updateOffering = (offering) => post('/updateOffering', { ...offering });

const deleteOffering = (offeringId) => post('/deleteOffering', { offeringId });

const getTrades = (offeringId) => post('/getTradesForOffering', { offeringId });
const addSubscriptions = (offeringId, fileName) =>
  post('/addSubscriptionsForOffering', { offeringId, file_name: `templatename0=${fileName}` });
const getSubscriptions = (offeringId) => post('/getSubscriptionsForOffering', { offeringId });
const getDocuments = (offeringId) => post('/getDocumentsForOffering', { offeringId });

const addDocuments = (offeringId, file) => {
  const data = new FormData();
  data.append('clientID', auth.clientID);
  data.append('developerAPIKey', auth.developerAPIKey);
  data.append('offeringId', offeringId);
  data.append('documentTitle', `documentTitle0="${file.originalname}"`);
  data.append('documentFileReferenceCode', '0000000');
  data.append('file_name', `filename0="${file.originalname}"`);
  data.append('userfile0', Readable.from(file.buffer), { filename: file.originalname });

  return tapi.post('/addDocumentsForOffering', data, {
    timeout: 60000,
    headers: { ...data.getHeaders() },
  });
};

const updateDocument = (offeringId, file) => {
  const data = new FormData();
  data.append('clientID', auth.clientID);
  data.append('developerAPIKey', auth.developerAPIKey);
  data.append('offeringId', offeringId);
  data.append('documentTitle', `${file.originalname}`);
  data.append('documentFileReferenceCode', '0000000');
  data.append('file_name', `${file.originalname}`);
  data.append('userfile0', Readable.from(file.buffer), { filename: file.originalname });

  return tapi.post('/addDocumentsForOffering', data, {
    timeout: 60000,
    headers: { ...data.getHeaders() },
  });
};

const updateDocumentMetadata = ({ documentId, documentTitle, documentFileReferenceCode, offeringId }) =>
  post('/updateOfferingDocument', {
    documentId,
    documentTitle,
    documentFileReferenceCode,
    offeringId,
  });

module.exports = {
  getOffering,
  createOffering,
  updateOffering,
  getAllOfferings,
  getTrades,
  addSubscriptions,
  getSubscriptions,
  addDocuments,
  updateDocument,
  updateDocumentMetadata,
  getDocuments,
  deleteOffering,
};
