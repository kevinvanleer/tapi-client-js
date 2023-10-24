const { userToParty } = require('./util');
const { tapi, auth } = require('../util');

const createParty = (user) => tapi.put(
  '/createParty',
  new URLSearchParams(userToParty(user)),
);

const updateParty = (user) => tapi.post(
  '/updateParty',
  new URLSearchParams(userToParty(user)),
);

const getAllParties = () => tapi.post(
  '/getAllParties',
  new URLSearchParams(auth),
);
const deleteParty = (partyId) => tapi.post(
  '/deleteParty',
  new URLSearchParams({ ...auth, partyId }),
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
