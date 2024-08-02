const FormData = require('form-data');
const { Readable } = require('stream');

const { tapi, auth, post, put, get } = require('../util');

const getTrade = (tradeId, accountId) => post('/getTrade', { tradeId, accountId });

const getAllTrades = () => post('/getAllTrades');

const getTradesGet = ({ offset, limit, deleted, filter }) => get('/trades', { offset, limit, deleted, filter });
const getTradesPost = ({ offset, limit, deleted, filter }) => post('/getTrades', { offset, limit, deleted, filter });

const createTrade = (trade) => post('/createTrade', trade);

const editTrade = (trade) => put('/editTrade', trade);

const deleteTrade = (tradeId, accountId) => post('/deleteTrade', { tradeId, accountId });

const cancelTrade = (tradeId, details) => post('/cancelInvestment', { tradeId, ...details });

const getPaymentInfo = (tradeId) => post('/getPaymentInfo', { tradeId });

const updateTradeStatus = (tradeId, accountId, orderStatus) => post('/updateTradeStatus', { tradeId, accountId, orderStatus });

const getTradeStatus = (tradeId) => post('/getTradeStatus', { tradeId });

const getTradeDocument = (tradeId) => post('/getTradeDocument', { tradeId });

const uploadTradeDocument = (tradeId, file) => {
  const data = new FormData();
  data.append('clientID', auth.clientID);
  data.append('developerAPIKey', auth.developerAPIKey);
  data.append('tradeId', tradeId);
  data.append('documentTitle', `documentTitle0="${file.originalname}"`);
  data.append('file_name', `filename0="${file.originalname}"`);
  data.append('userfile0', Readable.from(file.buffer), { filename: file.originalname });

  return tapi.post('/uploadTradeDocument', data, {
    timeout: 60000,
    headers: { ...data.getHeaders() },
  });
};

module.exports = {
  getTrade,
  createTrade,
  editTrade,
  getAllTrades,
  getTrades: getTradesGet,
  getTradesGet,
  getTradesPost,
  deleteTrade,
  cancelTrade,
  getPaymentInfo,
  updateTradeStatus,
  getTradeStatus,
  uploadTradeDocument,
  getTradeDocument,
};
