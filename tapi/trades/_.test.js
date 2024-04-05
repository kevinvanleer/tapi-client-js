const { createTrade, editTrade, getAllTrades, getTrade, getTradeStatus, deleteTrade } = require('.');

const { accounts, offerings, links } = require('..');

let offeringId;
let accountId;

jest.setTimeout(10000);

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
  const user = {
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
  };
  const { data: account } = await accounts.createAccount(user);
  if (account.statusCode !== '101') throw account;
  accountId = account.accountDetails[0].accountId;
  await links.linkAccountOwner(accountId, global.partyId);
});

afterAll(async () => {
  if (offeringId) await offerings.deleteOffering(offeringId);
  if (accountId) await accounts.deleteAccount(accountId);
});

describe('trades', () => {
  const trade = {
    transactionType: 'WIRE',
    transactionUnits: '1',
  };

  let createdTradeId;

  it('createTrade -- invalid', async () => {
    const { data } = await createTrade(trade);
    expect(data.statusDesc).not.toEqual('Ok');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '106',
      }),
    );
  });
  it('createTrade -- valid', async () => {
    const validTrade = {
      ...trade,
      offeringId,
      accountId,
    };

    const { data } = await createTrade(validTrade);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        purchaseDetails: expect.arrayContaining([
          true,
          expect.arrayContaining([
            expect.objectContaining({
              tradeId: expect.stringMatching(/[0-9]+/),
              transactionStatus: 'CREATED',
            }),
          ]),
        ]),
      }),
    );
    createdTradeId = data.purchaseDetails[1][0].tradeId;
    expect(createdTradeId).toMatch(/[0-9]+/);
  });
  it('editTrade -- no account ID', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const updatedTrade = {
      offeringId,
      tradeId: createdTradeId,
      shares: '2',
    };
    const { data } = await editTrade(updatedTrade);
    expect(data).toStrictEqual({
      statusCode: '190',
      statusDesc: 'Trade status should be in CREATED',
    });
  });
  it('editTrade -- no trade ID', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const updatedTrade = {
      offeringId,
      accountId,
      shares: '2',
    };
    const { data } = await editTrade(updatedTrade);
    expect(data).toStrictEqual({
      statusCode: '190',
      statusDesc: 'Trade status should be in CREATED',
    });
  });
  it('editTrade -- invalid trade ID', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const updatedTrade = {
      offeringId,
      accountId,
      tradeId: 'invalid-trade-id',
      shares: '2',
    };
    const { data } = await editTrade(updatedTrade);
    expect(data).toStrictEqual({
      statusCode: '190',
      statusDesc: 'Trade status should be in CREATED',
    });
  });
  it('editTrade -- valid', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const updatedTrade = {
      offeringId,
      accountId,
      tradeId: createdTradeId,
      shares: '2',
    };
    const { data } = await editTrade(updatedTrade);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        TradeFinancialDetails: expect.objectContaining({
          tradeId: createdTradeId,
        }),
      }),
    );
  });
  it('getTrade -- no ID', async () => {
    const { data } = await getTrade();
    expect(data).toStrictEqual({
      'Error(s)': 'accountId MISSING',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getTrade -- invalid ID nonnumeric', async () => {
    const { data } = await getTrade('invalid-trade-id');
    expect(data).toStrictEqual({
      'Error(s)': 'accountId MISSING',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getTrade -- invalid ID numeric', async () => {
    const { data } = await getTrade(123.4123);
    expect(data).toStrictEqual({
      'Error(s)': 'accountId MISSING',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getTrade -- success', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const { data } = await getTrade(createdTradeId, accountId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            orderId: createdTradeId,
            orderStatus: 'CREATED',
          }),
        ]),
      }),
    );
  });
  it('getTradeStatus -- invalid trade ID', async () => {
    const { data } = await getTradeStatus('invalid-trade-id');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '189',
      }),
    );
  });
  it('getTradeStatus -- does not exist', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const { data } = await getTradeStatus(createdTradeId + 1);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '189',
      }),
    );
  });
  it('getTradeStatus -- success', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const { data } = await getTradeStatus(createdTradeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        tradeDetails: expect.arrayContaining([
          expect.objectContaining({
            orderId: createdTradeId,
            orderStatus: 'CREATED',
          }),
        ]),
      }),
    );
  });
  it('getAllTrades', async () => {
    const { data } = await getAllTrades();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        TradeFinancialDetails: expect.arrayContaining([
          expect.objectContaining({
            orderId: createdTradeId,
            orderStatus: 'CREATED',
          }),
        ]),
      }),
    );
  });
  it('deleteTrade -- no ID', async () => {
    const { data } = await deleteTrade();
    expect(data).toStrictEqual({
      'Error(s)': '<br />tradeIdu0026nbsp;u0026nbsp; : Missing<br />accountIdu0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('deleteTrade -- invalid ID nonnumeric', async () => {
    const { data } = await deleteTrade('invalid-trade-id');
    expect(data).toStrictEqual({
      'Error(s)': '<br />accountIdu0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('deleteTrade -- invalid ID numeric', async () => {
    const { data } = await deleteTrade(123.4123);
    expect(data).toStrictEqual({
      'Error(s)': '<br />accountIdu0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('deleteTrade -- success', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const { data } = await deleteTrade(createdTradeId, accountId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
      }),
    );
  });
  it('getTrade -- canceled', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const { data } = await getTrade(createdTradeId, accountId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            orderId: createdTradeId,
            orderStatus: 'CANCELED',
          }),
        ]),
      }),
    );
  });
});
