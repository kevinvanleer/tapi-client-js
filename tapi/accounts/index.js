const { makeIndividualAccount } = require('./util');
const { tapi, auth } = require('../util');

const createAccount = (user) => tapi.put(
  '/createAccount',
  new URLSearchParams({
    ...makeIndividualAccount(user),
    KYCstatus: 'pending',
    AMLstatus: 'pending',
    AccreditedStatus: 'pending',
    approvalStatus: 'pending',
  }),
);

const updateAccount = (user) => tapi.put(
  '/updateAccount',
  new URLSearchParams(makeIndividualAccount(user)),
);

const upsertAccount = (user) => (user.accountId
  ? updateAccount(user)
  : createAccount(user));

const getAllAccounts = () => tapi.post('/getAllAccounts', new URLSearchParams(auth));
const deleteAccount = (accountId) => tapi.post('/deleteAccount', new URLSearchParams({ ...auth, accountId }));

module.exports = {
  createAccount,
  updateAccount,
  upsertAccount,
  getAllAccounts,
  deleteAccount,
};
