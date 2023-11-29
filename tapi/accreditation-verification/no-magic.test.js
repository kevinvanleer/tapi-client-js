const {
  getDocumentList,
  requestVerification,
  updateVerification,
  getVerificationStatus,
  uploadVerificationDocument,
} = require('.');

const { parties, accounts, links } = require('..');

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
  const { data: party } = await parties.createParty(user);
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
  it('uploadVerificationDocument', async () => {
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
  it('requestVerification', async () => {
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
  it('getVerificationStatus -- pending', async () => {
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
              aiRequestStatus: 'Pending',
            }),
          ]),
        }),
      }),
    );
    documentId = response.data.accreditedDetails.documents[0].documentid;
  });
  it('updateVerification', async () => {
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
  it('getVerificationStatus -- new info', async () => {
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
  });
  it('getDocumentList', async () => {
    expect(typeof accountId).toBe('string');
    expect(typeof documentId).toBe('string');
    const response = await getDocumentList(accountId, documentId);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        document_details: expect.arrayContaining([
          expect.objectContaining({
            documentid: documentId,
            accountId,
            documentTitle: `documentTitle0="${testFileNames.not_magic}.pdf"`,
            documentFileName: expect.anything(),
            documentUrl: expect.anything(),
          }),
        ]),
      }),
    );
  });
});
