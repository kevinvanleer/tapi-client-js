const { accounts, offerings, links, trades } = require('..');
const { addDocuments, getDocuments } = require('.');

jest.setTimeout(10000);

describe('offerings/documents-strict', () => {
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

  it('getDocuments (getDocumentsForOffering) -- no offering ID', async () => {
    const { data } = await getDocuments();
    expect(data).toStrictEqual({
      'Error(s)': 'offeringIdu0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getDocuments (getDocumentsForOffering) -- invalid non-numeric offering ID', async () => {
    const { data } = await getDocuments('invalid-offering-id');
    expect(data).toStrictEqual({
      'Error(s)': 'offeringId : u0026nbsp;Numeric values only',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getDocuments (getDocumentsForOffering) -- invalid numeric offering ID', async () => {
    const { data } = await getDocuments(123.123);
    expect(data).toStrictEqual({
      statusCode: '138',
      statusDesc: 'Offering ID does not exist.',
    });
  });
  it('getDocuments (getDocumentsForOffering) -- empty list', async () => {
    const { data } = await getDocuments(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [],
    });
  });
  it('addDocuments (addDocumentsForOffering)', async () => {
    const { data } = await addDocuments(offeringId, {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `test-document-0.pdf`,
    });
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          offeringId,
          documentFileReferenceCode: '0000000',
          documentId: expect.stringMatching(/^[0-9]{4,5}$/),
          documentName: expect.stringMatching(/^[a-zA-Z0-9]*.pdf$/),
          documentURL: expect.stringMatching(
            /^https:\/\/api-sandboxdash.norcapsecurities.com\/admin_v3\/Upload_documentation\/uploadDocument\/[a-zA-Z0-9]*$/,
          ),
        },
      ],
    });
  });
  it('getDocuments (getDocumentsForOffering) -- one item', async () => {
    const { data } = await getDocuments(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          createdDate: expect.any(String),
          documentFileReferenceCode: '0000000',
          documentId: expect.stringMatching(/^[0-9]{4,5}$/),
          documentName: expect.stringMatching(/^[a-zA-Z0-9]*.pdf$/),
          documentTitle: 'test-document-0.pdf',
          templateName: null,
          documentURL: expect.stringMatching(
            /^https:\/\/api-sandboxdash.norcapsecurities.com\/admin_v3\/Upload_documentation\/uploadDocument\/[a-zA-Z0-9]*$/,
          ),
        },
      ],
    });
  });
  it('getDocuments (getDocumentsForOffering) -- three items', async () => {
    const { data: doc1 } = await addDocuments(offeringId, {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `test-document-1.pdf`,
    });
    const { data: doc2 } = await addDocuments(offeringId, {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `test-document-2.pdf`,
    });
    const { data } = await getDocuments(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          createdDate: expect.any(String),
          documentFileReferenceCode: '0000000',
          documentId: expect.stringMatching(/^[0-9]{4,5}$/),
          documentName: expect.stringMatching(/^[a-zA-Z0-9]*.pdf$/),
          documentTitle: 'test-document-0.pdf',
          templateName: null,
          documentURL: expect.stringMatching(
            /^https:\/\/api-sandboxdash.norcapsecurities.com\/admin_v3\/Upload_documentation\/uploadDocument\/[a-zA-Z0-9]*$/,
          ),
          url: expect.stringMatching(
            /^https:\/\/api-sandboxdash.norcapsecurities.com\/admin_v3\/Upload_documentation\/uploadDocument\/[a-zA-Z0-9]*$/,
          ),
        },
        {
          createdDate: expect.any(String),
          documentFileReferenceCode: '0000000',
          documentId: doc1.document_details[0].documentId,
          documentName: doc1.document_details[0].documentName,
          documentTitle: 'test-document-1.pdf',
          templateName: null,
          documentURL: doc1.document_details[0].documentURL,
          url: doc1.document_details[0].documentURL,
        },
        {
          createdDate: expect.any(String),
          documentFileReferenceCode: '0000000',
          documentId: doc2.document_details[0].documentId,
          documentName: doc2.document_details[0].documentName,
          documentTitle: 'test-document-2.pdf',
          templateName: null,
          documentURL: doc1.document_details[0].documentURL,
          url: doc2.document_details[0].documentURL,
        },
      ],
    });
  });
});
