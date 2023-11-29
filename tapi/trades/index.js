const { post, put } = require('../util');

const getTrade = (tradeId, accountId) => post('/getTrade', { tradeId, accountId });

const getAllTrades = () => post('/getAllTrades');

const createTrade = (trade) => post('/createTrade', trade);

const editTrade = (trade) => put('/editTrade', trade);

const deleteTrade = (tradeId, accountId) => post('/deleteTrade', { tradeId, accountId });

const cancelTrade = (tradeId, details) => post('/cancelInvestment', { tradeId, ...details });

const getPaymentInfo = (tradeId) => post('/getPaymentInfo', { tradeId });

module.exports = {
  getTrade,
  createTrade,
  editTrade,
  getAllTrades,
  deleteTrade,
  cancelTrade,
  getPaymentInfo,
};
