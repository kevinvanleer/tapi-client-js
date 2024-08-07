const FormData = require('form-data');
const { Readable } = require('stream');
const { tapi, auth, put, post, get, serverlessHost } = require('../util');

const createParty = (party) => put('/createParty', party);

const updateParty = (party) => post('/updateParty', party);

const getAllParties = (offset, limit, deleted) => post('/getAllParties', { offset, limit, deleted });
const getPartiesGet = ({ offset, limit, deleted, type }, config) => get('/parties', { offset, limit, deleted, type }, config);
const getPartiesPost = ({ offset, limit, deleted, type }, authOverride) =>
  post('/getParties', { ...authOverride, offset, limit, deleted, type });
const getParty = (partyId) => post('/getParty', { partyId });
const deleteParty = (partyId) => post('/deleteParty', { partyId });

const upsertParty = (user) => (user.partyId ? updateParty(user) : createParty(user));

const getLinkedAccounts = (partyId) => post('/getLinkedAccounts', { partyId }, { baseURL: serverlessHost });

const uploadPartyDocument = (partyId, file) => {
  const data = new FormData();
  data.append('clientID', auth.clientID);
  data.append('developerAPIKey', auth.developerAPIKey);
  data.append('partyId', partyId);
  data.append('file_name', `filename0="${file.originalname}"`);
  data.append('documentTitle', `documentTitle0="${file.originalname}"`);
  data.append('userfile0', Readable.from(file.buffer), { filename: file.originalname });
  return tapi.post('/uploadPartyDocument', data, {
    timeout: 60000,
    headers: { ...data.getHeaders() },
  });
};

const getPartyDocument = (partyId, documentId) => post('/getPartyDocument', { partyId, documentId });

module.exports = {
  createParty,
  updateParty,
  upsertParty,
  getParty,
  getAllParties,
  getParties: getPartiesGet,
  getPartiesGet,
  getPartiesPost,
  getLinkedAccounts,
  deleteParty,
  uploadPartyDocument,
  getPartyDocument,
};
