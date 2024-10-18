const { post, get } = require('../util');

describe('custody', () => {
  let accountId;
  let referenceNumber;

  beforeAll(async () => {
    const response = await get('/accounts?limit=1');
    accountId = response.data.accountDetails[0].accountId;
  });
  it('POST getFundCustodyAccountHistory -- invalid account ID', async () => {
    const response = await post('/getFundCustodyAccountHistory', {
      accountId: '01853700',
    });
    expect(response.data).toStrictEqual({
      statusCode: '1400',
      statusDesc: 'Bad request: invalid account ID',
      custodyTransactions: null,
    });
    expect(response.status).toStrictEqual(400);
  });
  it('POST getFundCustodyAccountHistory -- account ID not found', async () => {
    const response = await post('/getFundCustodyAccountHistory', {
      accountId: 'A000000',
    });
    expect(response.data).toStrictEqual({
      statusCode: '1404',
      statusDesc: 'Resource not found: account ID does not exist',
      custodyTransactions: null,
    });
    expect(response.status).toStrictEqual(404);
  });
  it('POST getFundCustodyAccountHistory -- success', async () => {
    const response = await post('/getFundCustodyAccountHistory', {
      accountId,
    });
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      custodyTransactions: expect.arrayContaining([
        {
          accountId,
          tradeId: expect.any(String),
          offeringId: expect.any(String),
          bankName: expect.any(String),
          totalAmount: expect.any(String),
          accountNumber: expect.any(String),
          routingNumber: expect.any(String),
          accountHolderName: expect.any(String),
          referenceNumber: expect.any(String),
          description: expect.any(String),
          status: expect.any(String),
          fundStatus: expect.any(String),
          routingNumberStatus: expect.any(String),
          errors: expect.any(String),
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        },
      ]),
      pagination: {
        totalRecords: expect.any(Number),
        startIndex: 0,
        endIndex: expect.any(Number),
      },
    });
    expect(response.status).toStrictEqual(200);
    referenceNumber = response.data.custodyTransactions[0].referenceNumber;
  });
  it('POST getFundCustodyAccountHistory -- get first record', async () => {
    const response = await post('/getFundCustodyAccountHistory?limit=1', {
      accountId,
    });
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      custodyTransactions: [
        {
          accountId,
          tradeId: expect.any(String),
          offeringId: expect.any(String),
          bankName: expect.any(String),
          totalAmount: expect.any(String),
          accountNumber: expect.any(String),
          routingNumber: expect.any(String),
          accountHolderName: expect.any(String),
          referenceNumber,
          description: expect.any(String),
          status: expect.any(String),
          fundStatus: expect.any(String),
          routingNumberStatus: expect.any(String),
          errors: expect.any(String),
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        },
      ],
      pagination: {
        totalRecords: expect.any(Number),
        startIndex: 0,
        endIndex: 0,
      },
    });
    expect(response.status).toStrictEqual(200);
  });
  it('POST getFundCustodyAccountHistory -- get second record', async () => {
    const response = await post('/getFundCustodyAccountHistory?limit=1&offset=1', {
      accountId,
    });
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      custodyTransactions: [
        {
          accountHolderName: expect.any(String),
          accountId,
          accountNumber: expect.any(String),
          bankName: expect.any(String),
          description: expect.any(String),
          errors: expect.any(String),
          fundStatus: expect.any(String),
          offeringId: expect.any(String),
          referenceNumber: expect.any(String),
          routingNumber: expect.any(String),
          routingNumberStatus: expect.any(String),
          status: expect.any(String),
          totalAmount: expect.any(String),
          tradeId: expect.any(String),
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        },
      ],
      pagination: {
        totalRecords: expect.any(Number),
        startIndex: 1,
        endIndex: 1,
      },
    });
    expect(response.data.custodyTransactions[0].referenceNumber).not.toEqual(referenceNumber);
    expect(response.status).toStrictEqual(200);
  });
  it('POST getFundCustodyAccount -- invalid reference number', async () => {
    const response = await post('/getFundCustodyAccount', {
      accountId,
      referenceNumber: 'kjaowighoapgjawegiaefaw',
    });
    expect(response.data).toStrictEqual({
      statusCode: '1400',
      statusDesc: 'Bad request: invalid reference number',
      custodyTransaction: null,
    });
    expect(response.status).toStrictEqual(400);
  });
  it('POST getFundCustodyAccount -- invalid account ID', async () => {
    const response = await post('/getFundCustodyAccount', {
      accountId: '01853700',
      referenceNumber,
    });
    expect(response.data).toStrictEqual({
      statusCode: '1400',
      statusDesc: 'Bad request: invalid account ID',
      custodyTransaction: null,
    });
    expect(response.status).toStrictEqual(400);
  });
  it('POST getFundCustodyAccount -- account ID not found', async () => {
    const response = await post('/getFundCustodyAccount', {
      accountId: 'A000000',
      referenceNumber,
    });
    expect(response.data).toStrictEqual({
      statusCode: '1404',
      statusDesc: 'Resource not found: account ID does not exist',
      custodyTransaction: null,
    });
    expect(response.status).toStrictEqual(404);
  });
  it('POST getFundCustodyAccount -- reference number does not exist', async () => {
    const response = await post('/getFundCustodyAccount', {
      accountId,
      referenceNumber: 'kjld',
    });
    expect(response.data).toStrictEqual({
      statusCode: '1404',
      statusDesc: 'Resource not found: reference number not found for account',
      custodyTransaction: null,
    });
    expect(response.status).toStrictEqual(404);
  });
  it('POST getFundCustodyAccount -- success', async () => {
    const response = await post('/getFundCustodyAccount', {
      accountId,
      referenceNumber,
    });
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      custodyTransaction: {
        accountId,
        tradeId: expect.any(String),
        offeringId: expect.any(String),
        bankName: expect.any(String),
        totalAmount: expect.any(String),
        accountNumber: expect.any(String),
        routingNumber: expect.any(String),
        accountHolderName: expect.any(String),
        referenceNumber,
        description: expect.any(String),
        status: expect.any(String),
        fundStatus: expect.any(String),
        routingNumberStatus: expect.any(String),
        errors: expect.any(String),
        createdDate: expect.any(String),
        updatedDate: expect.any(String),
      },
    });
    expect(response.status).toStrictEqual(200);
  });
});
