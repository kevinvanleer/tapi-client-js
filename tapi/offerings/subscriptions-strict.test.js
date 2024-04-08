const { accounts, offerings, links, trades } = require('..');
const { getSubscriptions } = require('.');

jest.setTimeout(10000);

describe('offerings/subscriptions', () => {
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

  it('getSubscriptions (getSubscriptionsForOffering) -- no offering ID', async () => {
    const { data } = await getSubscriptions();
    expect(data).toStrictEqual({
      'Error(s)': 'offeringIdu0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getSubscriptions (getSubscriptionsForOffering) -- invalid non-numeric offering ID', async () => {
    const { data } = await getSubscriptions('invalid-offering-id');
    expect(data).toStrictEqual({
      'Error(s)': 'offeringId : u0026nbsp;Numeric values only',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getSubscriptions (getSubscriptionsForOffering) -- invalid numeric offering ID', async () => {
    const { data } = await getSubscriptions(123.123);
    expect(data).toStrictEqual({
      statusCode: '138',
      statusDesc: 'Offering ID does not exist.',
    });
  });
  it('getSubscriptions (getSubscriptionsForOffering) -- empty list', async () => {
    const { data } = await getSubscriptions(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [],
    });
  });
  it('getSubscriptions (getSubscriptionsForOffering) -- one item', async () => {
    const { data } = await getSubscriptions(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [],
    });
  });
});
