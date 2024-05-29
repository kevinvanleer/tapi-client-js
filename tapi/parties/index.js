const FormData = require('form-data');
const { Readable } = require('stream');
const { userToParty } = require('./util');
const { tapi, auth, put, post, get, serverlessHost } = require('../util');

const createParty = (user) => put('/createParty', userToParty(user));

const updateParty = (user) => post('/updateParty', userToParty(user));

const getAllParties = (offset, limit, deleted) => post('/getAllParties', { offset, limit, deleted });
const getPartiesGet = ({ offset, limit, deleted, type }) => get('/parties', { offset, limit, deleted, type });
const getPartiesPost = ({ offset, limit, deleted, type }) => post('/getParties', { offset, limit, deleted, type });
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
