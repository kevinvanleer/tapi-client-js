const { requestVerification, getVerificationStatus, uploadVerificationDocument } = require('.');

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

describe('accrediation-verification/need more info', () => {
  let partyId;
  let accountId;
  let linkId;
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

  it('uploadVerificationDocument', async () => {
    expect(typeof accountId).toBe('string');
    const fakeFile = {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `${testFileNames.need_info}.pdf`,
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
  it('requestVerification (requestAiVerification) -- TAPI sandbox bug', async () => {
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
  });
  it('getVerificationStatus (getAiRequest) -- pending', async () => {
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
              aiRequestStatus: 'Need More Info',
            }),
          ]),
        }),
      }),
    );
  });
});

describe('accrediation-verification/approved', () => {
  let partyId;
  let accountId;
  let linkId;
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

  it('uploadVerificationDocument', async () => {
    expect(typeof accountId).toBe('string');
    const fakeFile = {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `${testFileNames.approved_all_parties}.pdf`,
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
  it('requestVerification (requestAiVerification) -- TAPI sandbox bug', async () => {
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
  });
  it('getVerificationStatus (getAiRequest) -- pending', async () => {
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
              accreditedStatus: 'Verified Accredited',
              aiMethod: 'Upload',
              aiRequestStatus: 'Approved',
            }),
          ]),
        }),
      }),
    );
  });
});

describe('accrediation-verification/rejected', () => {
  let partyId;
  let accountId;
  let linkId;
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

  it('uploadVerificationDocument', async () => {
    expect(typeof accountId).toBe('string');
    const fakeFile = {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `${testFileNames.rejected}.pdf`,
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
  it('requestVerification (requestAiVerification) -- TAPI sandbox bug', async () => {
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
  });
  it('getVerificationStatus (getAiRequest) -- pending', async () => {
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
              accreditedStatus: 'Not Accredited',
              aiMethod: 'Upload',
              aiRequestStatus: 'Rejected',
            }),
          ]),
        }),
      }),
    );
  });
});
