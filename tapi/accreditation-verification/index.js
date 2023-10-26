const FormData = require('form-data');
const { Readable } = require('stream');
const { tapi, auth, post } = require('../util');

const uploadVerificationDocument = (accountId, file) => {
  const data = new FormData();
  data.append('clientID', auth.clientID);
  data.append('developerAPIKey', auth.developerAPIKey);
  data.append('accountId', accountId);
  data.append('documentTitle', `documentTitle0="${file.originalname}"`);
  data.append('userfile', Readable.from(file.buffer), { filename: file.originalname });

  return tapi.post(
    '/uploadVerificationDocument',
    data,
    {
      timeout: 60000,
      headers: { ...data.getHeaders() },
    },
  );
};

const getDocumentList = (accountId, documentId) => post('/getAiDocument', {
  accountId,
  documentId,
});

const requestVerification = (accountId) => post('/requestAiVerification', {
  accountId,
  aiMethod: 'Upload',
});

const updateVerification = (airequestId, aiRequestStatus = 'New Info Added') => post('/updateAiRequest', {
  airequestId,
  aiRequestStatus,
});

const getVerificationStatus = (accountId) => post('/getAiRequest', {
  accountId,
});

module.exports = {
  getDocumentList,
  requestVerification,
  updateVerification,
  getVerificationStatus,
  uploadVerificationDocument,
};
