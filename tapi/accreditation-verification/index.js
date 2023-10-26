const FormData = require('form-data');
const { Readable } = require('stream');
const { auth, tapi } = require('../util');

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

const getDocumentList = (accountId, documentId) => tapi.post('/getAiDocument', {
  ...auth,
  accountId,
  documentId,
});

const requestVerification = (accountId) => tapi.post('/requestAiVerification', {
  ...auth,
  accountId,
  aiMethod: 'Upload',
});

const updateVerification = (airequestId, aiRequestStatus = 'New Info Added') => tapi.post('/updateAiRequest', {
  ...auth,
  airequestId,
  aiRequestStatus,
});

const getVerificationStatus = (accountId) => tapi.post('/getAiRequest', {
  ...auth,
  accountId,
});

module.exports = {
  getDocumentList,
  requestVerification,
  updateVerification,
  getVerificationStatus,
  uploadVerificationDocument,
};
