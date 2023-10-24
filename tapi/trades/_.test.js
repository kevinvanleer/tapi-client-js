const {
  createTrade,
  editTrade,
  getAllTrades,
  getTrade,
  deleteTrade,
} = require('.');

const {
  parties, accounts, offerings, links, issuers,
} = require('..');

let offeringId;
let accountId;
let partyId;

jest.setTimeout(10000);

const getIssuerId = async () => {
  const { data } = await issuers.createIssuer({
    issuerName: 'Test issuer',
    firstName: 'IssuerFirstName',
    lastName: 'IssuerLastName',
    email: 'issuer@email.com',
  });
  return data.issuerDetails[1][0].issuerId;
};

beforeAll(async () => {
  const { data: offering } = await offerings.createOffering({
    issuerId: await getIssuerId(),
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
  const { data: party } = await parties.createParty(user);
  const [, [partyDetails]] = party.partyDetails;
  partyId = partyDetails.partyId;
  const { data: account } = await accounts.createAccount(user);
  accountId = account.accountDetails[0].accountId;
  await links.linkAccountOwner(accountId, partyDetails.partyId);
});

afterAll(() => {
  if (offeringId) offerings.deleteOffering(offeringId);
  if (accountId) accounts.deleteAccount(accountId);
  if (partyId) parties.deleteParty(partyId);
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
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '106',
    }));
  });
  it('createTrade -- valid', async () => {
    const validTrade = {
      ...trade,
      offeringId,
      accountId,
    };

    const { data } = await createTrade(validTrade);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
      purchaseDetails: expect.arrayContaining([
        true,
        expect.arrayContaining([
          expect.objectContaining({
            tradeId: expect.stringMatching(/[0-9]+/),
            transactionStatus: 'CREATED',
          })])]),
    }));
    createdTradeId = data.purchaseDetails[1][0].tradeId;
    expect(createdTradeId).toMatch(/[0-9]+/);
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
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
      TradeFinancialDetails: expect.objectContaining({
        tradeId: createdTradeId,
      }),
    }));
  });
  it('getTrade -- success', async () => {
    const { data } = await getTrade(createdTradeId, accountId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
      partyDetails: expect.arrayContaining([
        expect.objectContaining({
          orderId: createdTradeId,
          orderStatus: 'CREATED',
        })]),
    }));
  });
  it('getAllTrades', async () => {
    const { data } = await getAllTrades();
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
      TradeFinancialDetails: expect.arrayContaining([
        expect.objectContaining({
          orderId: createdTradeId,
          orderStatus: 'CREATED',
        })]),
    }));
  });
  it('deleteTrade -- success', async () => {
    const { data } = await deleteTrade(createdTradeId, accountId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
    }));
  });
  it('getTrade -- canceled', async () => {
    const { data } = await getTrade(createdTradeId, accountId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
      partyDetails: expect.arrayContaining([
        expect.objectContaining({
          orderId: createdTradeId,
          orderStatus: 'CANCELED',
        })]),
    }));
  });
});
