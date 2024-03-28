const { userToParty } = require('./util');
const { put, post } = require('../util');

const createParty = (user) => put('/createParty', userToParty(user));

const updateParty = (user) => post('/updateParty', userToParty(user));

const getAllParties = () => post('/getAllParties');
const getParty = (partyId) => post('/getParty', { partyId });
const deleteParty = (partyId) => post('/deleteParty', { partyId });

const upsertParty = (user) => (user.partyId ? updateParty(user) : createParty(user));

module.exports = {
  createParty,
  updateParty,
  upsertParty,
  getParty,
  getAllParties,
  deleteParty,
};
