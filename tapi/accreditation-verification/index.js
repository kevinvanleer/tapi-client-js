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

const getDocumentList = (accountId, documentId) => tapi.post('/getAiDocument', new URLSearchParams({
  ...auth,
  accountId,
  documentId,
}));

const requestVerification = (accountId) => tapi.post('/requestAiVerification', new URLSearchParams({
  ...auth,
  accountId,
  aiMethod: 'Upload',
}));

const updateVerification = (airequestId, aiRequestStatus = 'New Info Added') => tapi.post('/updateAiRequest', new URLSearchParams({
  ...auth,
  airequestId,
  aiRequestStatus,
}));

const getVerificationStatus = (accountId) => tapi.post('/getAiRequest', new URLSearchParams({
  ...auth,
  accountId,
}));

module.exports = {
  getDocumentList,
  requestVerification,
  updateVerification,
  getVerificationStatus,
  uploadVerificationDocument,
};
