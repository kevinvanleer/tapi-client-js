const { makeIndividualAccount } = require('./util');
const { tapi, auth } = require('../util');

const createAccount = (user) => tapi.put(
  '/createAccount',
  {
    ...makeIndividualAccount(user),
    KYCstatus: 'pending',
    AMLstatus: 'pending',
    AccreditedStatus: 'pending',
    approvalStatus: 'pending',
  },
);

const updateAccount = (user) => tapi.put(
  '/updateAccount',
  makeIndividualAccount(user),
);

const upsertAccount = (user) => (user.accountId
  ? updateAccount(user)
  : createAccount(user));

const getAllAccounts = () => tapi.post('/getAllAccounts', auth);
const deleteAccount = (accountId) => tapi.post('/deleteAccount', { ...auth, accountId });

module.exports = {
  createAccount,
  updateAccount,
  upsertAccount,
  getAllAccounts,
  deleteAccount,
};
