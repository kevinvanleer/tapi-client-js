const { convert, externalFundMoveMapping } = require('./util');
const { post } = require('../util');

const createAchAccount = (fields) => post('/createExternalAccount', convert(fields));
const deleteAchAccount = (fields) => post('/deleteExternalAccount', convert(fields));
const fundTrade = (fields) => post('/externalFundMove', convert(fields, externalFundMoveMapping));
const fundCustodyAccount = (fields) => post('/fundCustodyAccount', convert(fields, externalFundMoveMapping));
const getAchPendingId = (fields) => post('/getAchPendingId', convert(fields));
const getAchAccount = (fields) => post('/getExternalAccount', convert(fields));
const getAchTransfer = (fields) =>
  post('/getExternalFundMove', {
    accountId: fields.accountId,
    RefNum: fields.referenceNumber ?? fields.refNum ?? fields.RefNum,
  });
const getAchTransferHistory = (fields) => post('/getExternalFundMoveHistory', fields);
const getAchTransferInfo = (fields) =>
  post('/getExternalFundMoveInfo', {
    accountId: fields.accountId,
    RefNum: fields.referenceNumber ?? fields.refNum ?? fields.RefNum,
  });
const createPlaidAccount = (fields) => post('/linkExternalAccount', convert(fields));
const voidAchTransfer = (fields) =>
  post('/requestForVoidACH', {
    RefNum: fields.referenceNumber ?? fields.refNum ?? fields.RefNum,
  });
const voidCustodyAchTransfer = (fields) => post('/requestForVoidCustodyACH', convert(fields));
const updateAchAccount = (fields) => post('/updateExternalAccount', convert(fields));
const updatePlaidAccount = (fields) => post('/updateLinkExternalAccount', convert(fields));
const validateAbaRoutingNumber = (fields) => post('/validateABARoutingNumber', convert(fields));

module.exports = {
  createAchAccount,
  deleteAchAccount,
  fundTrade,
  fundCustodyAccount,
  getAchPendingId,
  getAchAccount,
  getAchTransfer,
  getAchTransferHistory,
  getAchTransferInfo,
  createPlaidAccount,
  voidAchTransfer,
  voidCustodyAchTransfer,
  updateAchAccount,
  updatePlaidAccount,
  validateAbaRoutingNumber,
};
