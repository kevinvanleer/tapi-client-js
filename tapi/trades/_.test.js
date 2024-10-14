const {
  createTrade,
  editTrade,
  getAllTrades,
  getTrade,
  updateTradeStatus,
  getTradeStatus,
  deleteTrade,
  uploadTradeDocument,
  getTradeDocument,
  getTrades,
  getTradesPost,
} = require('.');

const { accounts, offerings, links } = require('..');

let offeringId;
let accountId;
const trade = {
  transactionType: 'WIRE',
  transactionUnits: '1',
};
let validTrade = {
  ...trade,
};

jest.setTimeout(30000);

beforeAll(async () => {
  const { data: offering } = await offerings.createOffering({
    issuerId: global.issuerId,
    issueName: 'Test issue',
    issueType: 'Equity',
    minAmount: '1',
    targetAmount: '5',
    maxAmount: '10000',
    remainingShares: '10000',
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
  validTrade = { ...trade, accountId, offeringId };

  const { data } = await getTrades({});
  if (data.statusCode === '239' || data.pagination.totalRecords < 100) {
    await Promise.all(Array.from([...Array(100)], (x) => x + 1).map(() => createTrade(validTrade)));
  } else if (data.statusCode !== '101') throw data;

  const { data: testTrade } = await createTrade(validTrade);
  if (testTrade.statusCode !== '101') throw testTrade;
});

afterAll(async () => {
  if (offeringId) await offerings.deleteOffering(offeringId);
  if (accountId) await accounts.deleteAccount(accountId);
});

describe('trades', () => {
  const host = process.env.TAPI_HOST.replace('http://', 'https://');
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
            accountId,
            id: expect.stringMatching(/[0-9]+/),
            offeringId: expect.stringMatching(/[0-9]+/),
            orderId: expect.stringMatching(/[0-9]+/),
            escrowId: null,
            partyId: global.partyId,
            party_type: 'IndivACParty',
            transactionType: 'WIRE',
            totalAmount: '2.000000',
            totalShares: '2.000000',
            orderStatus: 'CREATED',
            createdDate: expect.any(String),
            errors: '',
            documentKey: '',
            esignStatus: 'NOTSIGNED',
            users: '',
            field1: '',
            field2: '',
            field3: '',
            RRApprovalStatus: 'Pending',
            RRName: null,
            RRApprovalDate: null,
            PrincipalApprovalStatus: 'Pending',
            PrincipalName: null,
            PrincipalDate: null,
            archived_status: '0',
            closeId: expect.anything(),
            eligibleToClose: 'no',
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
    const { data } = await getTradeStatus(createdTradeId + 1e6);
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
  it('updateTradeStatus -- funded', async () => {
    const { data } = await updateTradeStatus(createdTradeId, accountId, 'FUNDED');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        tradeDetails: expect.arrayContaining([expect.objectContaining({ orderStatus: 'FUNDED' })]),
      }),
    );
  });
  it('updateTradeStatus -- unwind pending', async () => {
    const { data } = await updateTradeStatus(createdTradeId, accountId, 'UNWIND PENDING');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        tradeDetails: expect.arrayContaining([expect.objectContaining({ orderStatus: 'UNWIND PENDING' })]),
      }),
    );
  });
  it('updateTradeStatus -- unwind_pending', async () => {
    const { data } = await updateTradeStatus(createdTradeId, accountId, 'UNWIND_PENDING');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        tradeDetails: expect.arrayContaining([expect.objectContaining({ orderStatus: 'UNWIND_PENDING' })]),
      }),
    );
  });
  it('updateTradeStatus -- unwind settled', async () => {
    const { data } = await updateTradeStatus(createdTradeId, accountId, 'UNWIND SETTLED');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        tradeDetails: expect.arrayContaining([expect.objectContaining({ orderStatus: 'UNWIND SETTLED' })]),
      }),
    );
  });
  it('updateTradeStatus -- unwind_settled', async () => {
    const { data } = await updateTradeStatus(createdTradeId, accountId, 'UNWIND_SETTLED');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        tradeDetails: expect.arrayContaining([expect.objectContaining({ orderStatus: 'UNWIND_SETTLED' })]),
      }),
    );
  });
  it.skip('getAllTrades', async () => {
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
  it('getTrades -- default', async () => {
    const { data } = await getTrades({});
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        trades: expect.arrayContaining([
          expect.objectContaining({
            tradeId: expect.stringMatching(/^[0-9]+$/),
          }),
        ]),
      }),
    );
    expect(data.trades).toHaveLength(10);
  });
  it('getTrades -- XSS', async () => {
    const response = await getTrades({ filter: ['<script>alert("Hello!")</script>'] });
    expect(response.status).toStrictEqual(400);
  });
  it('getTrades -- SQL injection', async () => {
    const response = await getTrades({ filter: ['SELECT * FROM transact_party'] });
    expect(response.status).toStrictEqual(400);
  });
  it('getTrades -- invalid client ID', async () => {
    const getRes = await getTrades(
      {},
      {
        headers: {
          Authorization: `Bearer invalid:${process.env.TAPI_API_KEY}`,
        },
      },
    );
    expect(getRes.status).toStrictEqual(401);
    expect(getRes.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '103',
      }),
    );
    const postRes = await getTradesPost({}, { clientID: 'invalid-client-id' });
    expect(postRes.status).toStrictEqual(401);
    expect(postRes.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '103',
      }),
    );
  });
  it('getTrades -- invalid API key', async () => {
    const postRes = await getTradesPost({}, { developerAPIKey: 'invalid-api-key' });
    expect(postRes.status).toStrictEqual(401);
    expect(postRes.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '103',
      }),
    );
    const getRes = await getTrades(
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.TAPI_CLIENT_ID}:invalid`,
        },
      },
    );
    expect(getRes.status).toStrictEqual(401);
    expect(getRes.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '103',
      }),
    );
  });
  it('getTrades -- offset NaN', async () => {
    const { data } = await getTrades({ offset: 'start', limit: 10 });
    expect(data.trades).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1422',
        trades: [],
      }),
    );
  });
  it('getTrades -- limit NaN', async () => {
    const { data } = await getTrades({ offset: 0, limit: 'none' });
    expect(data.trades).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1422',
        trades: [],
      }),
    );
  });
  it('getTrades -- offset out of range high', async () => {
    const { data } = await getTrades({ offset: 1e7, limit: 10 });
    expect(data.trades).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        trades: [],
      }),
    );
  });
  it('getTrades -- offset out of range low', async () => {
    const { data } = await getTrades({ offset: -1, limit: 10 });
    expect(data.trades).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        trades: [],
      }),
    );
  });
  it('getTrades -- limit out of range high', async () => {
    const { data } = await getTrades({ offset: 10, limit: 10000 });
    expect(data.trades).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        trades: [],
      }),
    );
  });
  it('getTrades -- limit out of range low', async () => {
    const { data } = await getTrades({ offset: 10, limit: 0 });
    expect(data.trades).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        trades: [],
      }),
    );
  });
  it('getTrades -- offset:1,limit:2', async () => {
    const { data } = await getTrades({ offset: 1, limit: 2 });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        trades: expect.arrayContaining([
          expect.objectContaining({
            tradeId: expect.stringMatching(/^[0-9]+$/),
          }),
        ]),
        pagination: expect.objectContaining({
          totalRecords: expect.any(Number),
          startIndex: 1,
          endIndex: 3,
        }),
      }),
    );
    expect(data.trades).toHaveLength(2);
  });
  it('getTrades -- filter by offering', async () => {
    const { data } = await getTrades({ filter: [`offeringId:${offeringId}`] });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        trades: expect.arrayContaining([
          expect.objectContaining({
            tradeId: expect.stringMatching(/^[0-9]+$/),
            offeringId,
          }),
        ]),
        pagination: expect.objectContaining({
          totalRecords: expect.any(Number),
          startIndex: expect.any(Number),
          endIndex: expect.any(Number),
        }),
      }),
    );
    expect(data.trades.every((t) => t.offeringId === offeringId)).toBe(true);
    expect(data.trades.length).toBeGreaterThan(0);
  });
  it('getTrades -- filter by offering and account', async () => {
    const { data } = await getTrades({ filter: [`offeringId:${offeringId}`, `accountId:${accountId}`] });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        trades: expect.arrayContaining([
          expect.objectContaining({
            tradeId: expect.stringMatching(/^[0-9]+$/),
            offeringId,
            accountId,
          }),
        ]),
        pagination: expect.objectContaining({
          totalRecords: expect.any(Number),
          startIndex: expect.any(Number),
          endIndex: expect.any(Number),
        }),
      }),
    );
    expect(data.trades.every((t) => t.offeringId === offeringId && t.accountId === accountId)).toBe(true);
    expect(data.trades.length).toBeGreaterThan(0);
  });
  it('getTrades -- get last trades', async () => {
    const limit = 50;
    let offset = 0;

    const newTrade = (await createTrade(validTrade)).data.purchaseDetails[1][0];

    const { data } = await getTrades({ offset, limit });
    let { trades } = data;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) => getTrades({ offset: offset + i * limit, limit })),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      trades = trades.concat(r.data.trades);
    });

    expect(trades).toHaveLength(data.pagination.totalRecords - offset + limit);
    expect(trades.every((t) => t.emailAddress !== 'otheruser@test.com')).toBe(true);

    expect(trades).toStrictEqual(expect.arrayContaining([expect.objectContaining({ tradeId: newTrade.tradeId })]));
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
      'Error(s)': '<br />tradeIdu0026nbsp;u0026nbsp; : Missing<br />accountIdu0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('deleteTrade -- invalid ID numeric', async () => {
    const { data } = await deleteTrade(123.4123);
    expect(data).toStrictEqual({
      'Error(s)': '<br />tradeIdu0026nbsp;u0026nbsp; : Missing<br />accountIdu0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('deleteTrade -- no accountId', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const { data } = await deleteTrade(createdTradeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        'Error(s)': '<br />accountIdu0026nbsp;u0026nbsp; : Missing',
        statusCode: '106',
        statusDesc: 'Data/parameter missing',
      }),
    );
  });
  it('deleteTrade -- wrong status', async () => {
    expect(createdTradeId).toMatch(/[0-9]+/);
    const { data } = await deleteTrade(createdTradeId, accountId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '190',
        statusDesc: 'Trade status should be in CREATED',
      }),
    );
  });
  let deleteTradeId;
  it('deleteTrade -- success', async () => {
    const { tradeId } = (await createTrade(validTrade)).data.purchaseDetails[1][0];
    expect(tradeId).toMatch(/[0-9]+/);
    const { data } = await deleteTrade(tradeId, accountId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
      }),
    );
    deleteTradeId = tradeId;
  });
  it('getTrade -- canceled', async () => {
    expect(deleteTradeId).toMatch(/[0-9]+/);
    const { data } = await getTrade(deleteTradeId, accountId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            orderId: deleteTradeId,
            orderStatus: 'CANCELED',
          }),
        ]),
      }),
    );
  });
  it('getTrades -- get last trades w/ deleted', async () => {
    const limit = 50;
    let offset = 0;

    const { data } = await getTrades({ offset, limit, deleted: true });
    let { trades } = data;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) => getTrades({ offset: offset + i * limit, limit, deleted: true })),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      trades = trades.concat(r.data.trades);
    });

    expect(trades).toHaveLength(data.pagination.totalRecords - offset + limit);

    expect(trades).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tradeId: expect.stringMatching(/^[0-9]+$/),
          archived: '0',
        }),
        expect.objectContaining({
          tradeId: expect.stringMatching(/^[0-9]+$/),
          archived: '1',
        }),
      ]),
    );
  });
  it('getTrades -- POST get last trades w/ deleted', async () => {
    const limit = 50;
    let offset = 0;

    const { data } = await getTradesPost({ offset, limit, deleted: true });
    let { trades } = data;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) =>
        getTradesPost({ offset: offset + i * limit, limit, deleted: true }),
      ),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      trades = trades.concat(r.data.trades);
    });

    expect(trades).toHaveLength(data.pagination.totalRecords - offset + limit);
    expect(trades.every((p) => p.emailAddress !== 'otheruser@test.com')).toBe(true);

    expect(trades).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tradeId: expect.stringMatching(/^[0-9]+$/),
          archived: '0',
        }),
        expect.objectContaining({
          tradeId: expect.stringMatching(/^[0-9]+$/),
          archived: '1',
        }),
      ]),
    );
  });
  it('uploadTradeDocument', async () => {
    const { data } = await uploadTradeDocument(createdTradeId, {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `test-document-0.pdf`,
    });
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: 'Document has been uploaded Successfully',
    });
  });
  it('getTradeDocument', async () => {
    const { data } = await getTradeDocument(createdTradeId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: expect.arrayContaining([
        {
          archive_status: '0',
          virtualStatus: 'ACTIVE',
          createdDate: expect.any(String),
          tradeId: createdTradeId,
          documentFileReferenceCode: expect.stringMatching(/^[\d]+$/),
          id: expect.stringMatching(/^[\d]+$/),
          documentid: expect.stringMatching(/^[\w]{4,5}$/),
          documentFileName: expect.stringMatching(/^[\w]+\.pdf$/),
          documentTitle: 'test-document-0.pdf',
          documentUrl: expect.stringMatching(new RegExp(`^${host}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`)),
        },
      ]),
    });
  });
});
