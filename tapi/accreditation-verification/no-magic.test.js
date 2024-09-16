const {
  getDocumentList,
  requestVerification,
  updateVerification,
  getVerificationStatus,
  uploadVerificationDocument,
} = require('.');

const { parties, accounts, links } = require('..');
const { userToParty } = require('../parties/util');

const testFileNames = {
  need_info: 'Test_Need_Info',
  approved_assets: 'Test_Approved_Assets',
  approved_income: 'Test_Approved_Income',
  approved_all_parties: 'Test_Approved_All',
  rejected: 'Test_Rejected',
  not_magic: 'Not_Magic',
};

jest.setTimeout(20000);
let partyId;
let accountId;
let linkId;
let documentId;
let jpgDocumentId;
let aiRequestId;

beforeAll(async () => {
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
  const { data: party } = await parties.createParty(userToParty(user));
  const [, [partyDetails]] = party.partyDetails;
  partyId = partyDetails.partyId;
  const { data: account } = await accounts.createAccount(user);
  accountId = account.accountDetails[0].accountId;
  const { data: link } = await links.linkAccountOwner(accountId, partyDetails.partyId);
  const [, [linkDetails]] = link.linkDetails;
  linkId = linkDetails.id;
});

afterAll(async () => {
  await parties.deleteParty(partyId);
  await accounts.deleteAccount(accountId);
  await links.deleteLink(linkId);
});

describe('tapi/accreditation-verification', () => {
  it('uploadVerificationDocument -- no account ID', async () => {
    expect(typeof accountId).toBe('string');
    const fakeFile = {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `${testFileNames.not_magic}.pdf`,
    };
    const response = await uploadVerificationDocument('', fakeFile);
    expect(response.data).toStrictEqual({
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
      'Error(s)': '<br />accountIdu0026nbsp;u0026nbsp; : Missing',
    });
  });
  it('uploadVerificationDocument -- invalid account ID', async () => {
    expect(typeof accountId).toBe('string');
    const fakeFile = {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `${testFileNames.not_magic}.pdf`,
    };
    const response = await uploadVerificationDocument('invalid-accounot-id', fakeFile);
    expect(response.data).toStrictEqual({
      statusCode: '148',
      statusDesc: 'Account is not exist/active.',
    });
  });
  it('uploadVerificationDocument -- file too small', async () => {
    expect(typeof accountId).toBe('string');
    const fakeFile = {
      buffer: Buffer.from('a'.repeat(1e2)),
      originalname: `${testFileNames.not_magic}.pdf`,
    };
    const response = await uploadVerificationDocument(accountId, fakeFile);
    expect(response.data).toStrictEqual({
      'Error(s)': 'Document File Size Must Be Greater Than 1 kb',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('uploadVerificationDocument -- pdf', async () => {
    expect(typeof accountId).toBe('string');
    const fakeFile = {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `${testFileNames.not_magic}.pdf`,
    };
    const response = await uploadVerificationDocument(accountId, fakeFile);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        document_details: 'Document has been uploaded Successfully',
      }),
    );
  });
  it('uploadVerificationDocument -- jpg', async () => {
    expect(typeof accountId).toBe('string');
    const fakeFile = {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `${testFileNames.not_magic}.jpg`,
    };
    const response = await uploadVerificationDocument(accountId, fakeFile);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        document_details: 'Document has been uploaded Successfully',
      }),
    );
  });
  it('requestVerification (requestAiVerification) -- no account ID', async () => {
    const response = await requestVerification();
    expect(response.data).toStrictEqual({
      'Error(s)': '<br />accountIdu0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('requestVerification (requestAiVerification) -- invalid account ID', async () => {
    expect(typeof accountId).toBe('string');
    const response = await requestVerification('invalid-account-id');
    expect(response.data).toStrictEqual({
      statusCode: '148',
      statusDesc: 'Account is not exist/active.',
    });
  });
  it('requestVerification (requestAiVerification)', async () => {
    expect(typeof accountId).toBe('string');
    const response = await requestVerification(accountId);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        accreditedDetails: [
          {
            accountId,
            airequestId: expect.anything(),
            accreditedStatus: 'pending',
            aiRequestStatus: 'Pending',
          },
        ],
      }),
    );
    aiRequestId = response.data.accreditedDetails.at(0).airequestId;
  });
  it('getVerificationStatus (getAiRequest) -- no account ID', async () => {
    const response = await getVerificationStatus();
    expect(response.data).toStrictEqual({
      'Error(s)': '<br />accountId u0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getVerificationStatus (getAiRequest) -- invalid account ID', async () => {
    expect(typeof accountId).toBe('string');
    const response = await getVerificationStatus('invalid-account-id');
    expect(response.data).toStrictEqual({
      statusCode: '148',
      statusDesc: 'Account is not exist/active.',
    });
  });
  it('updateVerification (updateAiRequest) -- no request ID', async () => {
    const response = await updateVerification();
    expect(response.data).toStrictEqual({
      statusDesc: 'Data/parameter missing',
      'Error(s)': '<br />airequestIdu0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
    });
  });
  it('updateVerification (updateAiRequest) -- invalid request ID', async () => {
    const response = await updateVerification('invalid-request-id');
    expect(response.data).toStrictEqual({
      statusCode: '152',
      statusDesc: 'Request Id not exits.',
    });
  });
  it('updateVerification (updateAiRequest)', async () => {
    expect(typeof aiRequestId).toBe('string');
    const response = await updateVerification(aiRequestId);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        accreditedDetails: [
          {
            accountId,
            airequestId: aiRequestId,
            accreditedStatus: 'pending',
            aiRequestStatus: 'New Info Added',
          },
        ],
      }),
    );
  });
  it('getVerificationStatus (getAiRequest) -- new info', async () => {
    expect(typeof accountId).toBe('string');
    const response = await getVerificationStatus(accountId);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        accreditedDetails: expect.objectContaining({
          documents: expect.arrayContaining([
            expect.objectContaining({
              id: expect.anything(),
              documentid: expect.anything(),
            }),
          ]),
          request: expect.arrayContaining([
            expect.objectContaining({
              accountId,
              accreditedStatus: 'pending',
              aiMethod: 'Upload',
              aiRequestStatus: 'New Info Added',
            }),
          ]),
        }),
      }),
    );
    documentId = response.data.accreditedDetails.documents[0].documentid;
    jpgDocumentId = response.data.accreditedDetails.documents[1].documentid;
  });
  it('getDocumentList (getAiDocument) -- no account ID, no document ID', async () => {
    const { data } = await getDocumentList();
    expect(data).toStrictEqual({
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
      'Error(s)': '<br />accountId :u0026nbsp;u0026nbsp; : Missing',
    });
  });
  it('getDocumentList (getAiDocument) -- no account ID', async () => {
    const { data } = await getDocumentList(undefined, documentId);
    expect(data).toStrictEqual({
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
      'Error(s)': '<br />accountId :u0026nbsp;u0026nbsp; : Missing',
    });
  });
  it('getDocumentList (getAiDocument) -- invalid account ID', async () => {
    const { data } = await getDocumentList('invalid-account-id');
    expect(data).toStrictEqual({
      statusCode: '148',
      statusDesc: 'Account is not exist/active.',
    });
  });
  it('getDocumentList (getAiDocument) -- no document ID', async () => {
    expect(typeof accountId).toBe('string');
    const response = await getDocumentList(accountId);
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          documentid: documentId,
          accountId,
          documentTitle: `documentTitle0="${testFileNames.not_magic}.pdf"`,
          documentFileName: expect.stringMatching(/^[a-zA-Z0-9]*.pdf$/),
          documentUrl: expect.any(String),
          createdDate: expect.any(String),
          documentFileReferenceCode: expect.stringMatching(/^[0-9]{12}$/),
          id: expect.stringMatching(/^[0-9]{6}$/),
        },
        {
          documentid: jpgDocumentId,
          accountId,
          documentTitle: `documentTitle0="${testFileNames.not_magic}.jpg"`,
          documentFileName: expect.stringMatching(/^[a-zA-Z0-9]*.jpg$/),
          documentUrl: expect.any(String),
          createdDate: expect.any(String),
          documentFileReferenceCode: expect.stringMatching(/^[0-9]{12}$/),
          id: expect.stringMatching(/^[0-9]{6}$/),
        },
      ],
    });
  });
  it('getDocumentList (getAiDocument) -- invalid document ID', async () => {
    expect(typeof accountId).toBe('string');
    const response = await getDocumentList(accountId, 'invalid-document-id');
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '233',
        statusDesc: 'No AI document found for this account',
      }),
    );
  });
  it('getDocumentList (getAiDocument)', async () => {
    expect(typeof accountId).toBe('string');
    expect(typeof documentId).toBe('string');
    const response = await getDocumentList(accountId, documentId);
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          documentid: documentId,
          accountId,
          documentTitle: `documentTitle0="${testFileNames.not_magic}.pdf"`,
          documentFileName: expect.stringMatching(/^[a-zA-Z0-9]*.pdf$/),
          documentUrl: expect.any(String),
          createdDate: expect.any(String),
          documentFileReferenceCode: expect.stringMatching(/^[0-9]{12}$/),
          id: expect.stringMatching(/^[0-9]{6}$/),
        },
      ],
    });
  });
});
