const { makeIndividualAccount } = require('./util');
const { put, post } = require('../util');

const createAccount = (user) => put(
  '/createAccount',
  {
    ...makeIndividualAccount(user),
    KYCstatus: 'pending',
    AMLstatus: 'pending',
    AccreditedStatus: 'pending',
    approvalStatus: 'pending',
  },
);

const updateAccount = (user) => put(
  '/updateAccount',
  makeIndividualAccount(user),
);

const upsertAccount = (user) => (user.accountId
  ? updateAccount(user)
  : createAccount(user));

const getAllAccounts = () => post('/getAllAccounts');
const deleteAccount = (accountId) => post('/deleteAccount', { accountId });

module.exports = {
  createAccount,
  updateAccount,
  upsertAccount,
  getAllAccounts,
  deleteAccount,
};
