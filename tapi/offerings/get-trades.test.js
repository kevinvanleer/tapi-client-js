const { accounts, offerings, links, trades } = require('..');
const { getTrades } = require('.');

jest.setTimeout(10000);

describe('offerings/get-trades', () => {
  let createdTradeId;
  let offeringId;
  let accountId;

  beforeAll(async () => {
    const { data: offering } = await offerings.createOffering({
      issuerId: process.env.TAPI_TEST_ISSUER_ID,
      issueName: 'Test issue',
      issueType: 'Equity',
      minAmount: '1',
      targetAmount: '5',
      maxAmount: '10',
      remainingShares: '10',
      unitPrice: '1',
      startDate: '01-01-1970',
      endDate: '01-01-1970',
      offeringText: 'n/a',
      stampingText: 'n/a',
    });
    if (offering.statusCode !== '101') throw offering;
    offeringId = offering.offeringDetails[1][0].offeringId;
    const { data: account } = await accounts.createAccount({
      email: 'testuser@test.com',
      first_name: 'Test',
      last_name: 'User',
      address1: '123 Main St',
      city: 'Test City',
      state: 'Alabama',
      zip_code: 500,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
    });
    if (account.statusCode !== '101') throw account;
    accountId = account.accountDetails[0].accountId;
    await links.linkAccountOwner(accountId, global.partyId);
    const { data } = await trades.createTrade({
      transactionType: 'WIRE',
      transactionUnits: '1',
      offeringId,
      accountId,
    });
    createdTradeId = data.purchaseDetails[1][0].tradeId;
  });

  afterAll(async () => {
    if (createdTradeId) await trades.deleteTrade(createdTradeId, accountId);
    if (accountId) await accounts.deleteAccount(accountId);
    if (offeringId) await offerings.deleteOffering(offeringId);
  });

  it('getTrades (getTradesForOffering) -- no offering ID', async () => {
    const { data } = await getTrades();
    expect(data).toStrictEqual({
      'Error(s)': 'offeringId : u0026nbsp;Numeric values only',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getTrades (getTradesForOffering) -- invalid non-numeric offering ID', async () => {
    const { data } = await getTrades('invalid-offering-id');
    expect(data).toStrictEqual({
      'Error(s)': 'offeringId : u0026nbsp;Numeric values only',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getTrades (getTradesForOffering) -- invalid numeric offering ID', async () => {
    const { data } = await getTrades(123.123);
    expect(data).toStrictEqual({
      statusCode: '138',
      statusDesc: 'Offering ID does not exist.',
    });
  });
  it('getTrades (getTradesForOffering)', async () => {
    const { data } = await getTrades(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      'Offering purchased details': [
        {
          accountId,
          field1: '',
          field2: '',
          field3: '',
          orderId: createdTradeId,
          orderStatus: 'CREATED',
          totalAmount: '1.000000',
          totalShares: '1.000000',
          transactionType: 'WIRE',
          unitPrice: '1.000000',
        },
      ],
    });
  });
  it('getTrades (getTradesForOffering) -- add trades', async () => {
    const {
      data: {
        purchaseDetails: [, [{ tradeId: tradeTwoId }]],
      },
    } = await trades.createTrade({
      transactionType: 'ACH',
      transactionUnits: '2',
      offeringId,
      accountId,
    });
    const {
      data: {
        purchaseDetails: [, [{ tradeId: tradeThreeId }]],
      },
    } = await trades.createTrade({
      transactionType: 'CHECK',
      transactionUnits: '3',
      offeringId,
      accountId,
    });
    const { data } = await getTrades(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      'Offering purchased details': [
        {
          accountId,
          field1: '',
          field2: '',
          field3: '',
          orderId: createdTradeId,
          orderStatus: 'CREATED',
          totalAmount: '1.000000',
          totalShares: '1.000000',
          transactionType: 'WIRE',
          unitPrice: '1.000000',
        },
        {
          accountId,
          field1: '',
          field2: '',
          field3: '',
          orderId: tradeTwoId,
          orderStatus: 'CREATED',
          totalAmount: '2.000000',
          totalShares: '2.000000',
          transactionType: 'ACH',
          unitPrice: '1.000000',
        },
        {
          accountId,
          field1: '',
          field2: '',
          field3: '',
          orderId: tradeThreeId,
          orderStatus: 'CREATED',
          totalAmount: '3.000000',
          totalShares: '3.000000',
          transactionType: 'CHECK',
          unitPrice: '1.000000',
        },
      ],
    });
  });
});
