const { makeIndividualAccount } = require('./util');
const { get, put, post } = require('../util');

const createAccount = (user) =>
  put('/createAccount', {
    ...makeIndividualAccount(user),
    KYCstatus: 'pending',
    AMLstatus: 'pending',
    AccreditedStatus: 'pending',
    approvalStatus: 'pending',
  });

const updateAccount = (user) => put('/updateAccount', makeIndividualAccount(user));

const upsertAccount = (user) => (user.accountId ? updateAccount(user) : createAccount(user));

const getAccountsGet = ({ offset, limit, deleted }) => get('/accounts', { offset, limit, deleted });
const getAccountsPost = ({ offset, limit, deleted }) => post('/getAccounts', { offset, limit, deleted });
const getAllAccounts = () => post('/getAllAccounts');
const getAccount = (accountId) => post('/getAccount', { accountId });
const deleteAccount = (accountId) => post('/deleteAccount', { accountId });

module.exports = {
  createAccount,
  updateAccount,
  upsertAccount,
  getAccount,
  getAccounts: getAccountsGet,
  getAccountsGet,
  getAccountsPost,
  getAllAccounts,
  deleteAccount,
};
