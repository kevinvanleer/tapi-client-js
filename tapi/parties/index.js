const { userToParty } = require('./util');
const { tapi, auth } = require('../util');

const createParty = (user) => tapi.put(
  '/createParty',
  userToParty(user),
);

const updateParty = (user) => tapi.post(
  '/updateParty',
  userToParty(user),
);

const getAllParties = () => tapi.post(
  '/getAllParties',
  auth,
);
const deleteParty = (partyId) => tapi.post(
  '/deleteParty',
  { ...auth, partyId },
);

const upsertParty = (user) => (user.partyId
  ? updateParty(user)
  : createParty(user));

module.exports = {
  createParty,
  updateParty,
  upsertParty,
  getAllParties,
  deleteParty,
};
