const { accounts, offerings, links, trades } = require('..');
const { addDocuments, getDocuments, updateDocumentMetadata, updateDocument } = require('.');

jest.setTimeout(10000);

describe('offerings/documents', () => {
  const testRefCode = '0000000';
  let createdTradeId;
  let offeringId;
  let accountId;
  let subjectDocumentId;

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
    expect(data.statusCode).toStrictEqual('404');
  });
  it('getDocuments (getDocumentsForOffering) -- invalid non-numeric offering ID', async () => {
    const { data } = await getDocuments('invalid-offering-id');
    expect(data.statusCode).toStrictEqual('404');
  });
  it('getDocuments (getDocumentsForOffering) -- invalid numeric offering ID', async () => {
    const { data } = await getDocuments(123.123);
    expect(data).toStrictEqual({
      statusCode: '404',
      statusDesc: 'error in opening document',
    });
  });
  it('getDocuments (getDocumentsForOffering) -- empty list', async () => {
    const { data } = await getDocuments(offeringId);
    expect(data).toStrictEqual({
      statusCode: '404',
      statusDesc: 'error in opening document',
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
          documentReferenceCode: testRefCode,
          documentId: expect.stringMatching(/^[0-9]{4,5}$/),
          documentURL: expect.stringMatching(
            new RegExp(`^${process.env.TAPI_HOST}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`),
          ),
        },
      ],
    });
    subjectDocumentId = data.document_details[0].documentId;
  });
  it('getDocuments (getDocumentsForOffering) -- one item', async () => {
    const { data } = await getDocuments(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          createdDate: expect.any(String),
          documentFileReferenceCode: testRefCode,
          documentId: expect.stringMatching(/^[0-9]{4,5}$/),
          documentName: expect.stringMatching(/^[a-zA-Z0-9]*.pdf$/),
          documentTitle: 'test-document-0.pdf',
          templateName: null,
          url: expect.stringMatching(
            new RegExp(`^${process.env.TAPI_HOST}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`),
          ),
        },
      ],
    });

    // const resp = await fetch(data.document_details[0].url);
    // expect(resp.status).toStrictEqual(200);
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
          documentFileReferenceCode: testRefCode,
          documentId: expect.stringMatching(/^[0-9]{4,5}$/),
          documentName: expect.stringMatching(/^[a-zA-Z0-9]*.pdf$/),
          documentTitle: 'test-document-0.pdf',
          templateName: null,
          url: expect.stringMatching(
            new RegExp(`^${process.env.TAPI_HOST}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`),
          ),
        },
        {
          createdDate: expect.any(String),
          documentFileReferenceCode: testRefCode,
          documentId: doc1.document_details[0].documentId,
          documentName: expect.stringMatching(/^[a-zA-Z0-9]*.pdf$/),
          documentTitle: 'test-document-1.pdf',
          templateName: null,
          url: expect.stringMatching(
            new RegExp(`^${process.env.TAPI_HOST}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`),
          ),
        },
        {
          createdDate: expect.any(String),
          documentFileReferenceCode: testRefCode,
          documentId: doc2.document_details[0].documentId,
          documentName: expect.stringMatching(/^[a-zA-Z0-9]*.pdf$/),
          documentTitle: 'test-document-2.pdf',
          templateName: null,
          url: expect.stringMatching(
            new RegExp(`^${process.env.TAPI_HOST}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`),
          ),
        },
      ],
    });
  });
  it('updateDocumentMetadata (updateOfferingDocument) -- invalid document ID', async () => {
    expect(subjectDocumentId).toStrictEqual(expect.stringMatching(/^[0-9]{4,5}$/));
    const resp = await updateDocumentMetadata({
      documentId: 'invalid-document-id',
      documentTitle: 'Updated Document Title',
      documentFileReferenceCode: 'Updated File Reference Code',
      offeringId,
    });
    expect(resp.data.statusCode).toStrictEqual('106');
  });
  it('updateDocumentMetadata (updateOfferingDocument) -- success', async () => {
    expect(subjectDocumentId).toStrictEqual(expect.stringMatching(/^[0-9]{4,5}$/));
    const resp = await updateDocumentMetadata({
      documentId: subjectDocumentId,
      documentTitle: 'Updated Document Title',
      // documentFileReferenceCode: 'Updated File Reference Code',
      documentFileReferenceCode: testRefCode,
      offeringId,
    });
    expect(resp.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          // createdDate: expect.any(String),
          // documentFileReferenceCode: 'Updated File Reference Code',
          // documentFileReferenceCode: testRefCode,
          documentId: subjectDocumentId,
          // documentName: expect.stringMatching(/^[a-zA-Z0-9]*.pdf$/),
          documentTitle: 'Updated Document Title',
          documentURL: expect.stringMatching(
            new RegExp(`^${process.env.TAPI_HOST}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`),
          ),
          offeringId,
        },
      ],
    });
  });
});
