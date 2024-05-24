const { createParty, updateParty, getParty, getAllParties, deleteParty, uploadPartyDocument, getPartyDocument } = require('.');
const { userToParty, hasRequiredPartyFields } = require('./util');

jest.setTimeout(20000);

describe('parties', () => {
  let createdPartyId;
  const validUser = {
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
  it('createParty', async () => {
    expect(hasRequiredPartyFields(validUser)).toBe(true);
    const { data } = await createParty(validUser);
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [partyDetails]] = data.partyDetails;
    expect(partyDetails).toStrictEqual(
      expect.objectContaining({
        partyId: expect.stringMatching(/^P[0-9]{7,8}$/),
        AMLstatus: null,
        KYCstatus: null,
      }),
    );
    createdPartyId = partyDetails.partyId;
  });
  it('createParty -- missing required field (email)', async () => {
    const user = {
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
    expect(hasRequiredPartyFields(user)).toBe(false);
    const { data } = await createParty(user);
    expect(data.statusCode).toEqual('106');
  });
  it('getParty -- invalid ID', async () => {
    const { data } = await getParty('invalid-party-id');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '198',
      }),
    );
  });
  it('getParty -- does not exist', async () => {
    const { data } = await getParty('P0000000');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '198',
      }),
    );
  });
  it('getParty', async () => {
    const { data } = await getParty(createdPartyId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        partyDetails: [
          expect.objectContaining({
            ...userToParty({ ...validUser, partyId: createdPartyId }),
          }),
        ],
      }),
    );
  });
  it('updateParty', async () => {
    const user = {
      partyId: createdPartyId,
      city: 'Best City',
    };
    const { data } = await updateParty(user);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusDesc: 'Ok',
        statusCode: '101',
        partyDetails: [
          true,
          [
            expect.objectContaining({
              partyId: createdPartyId,
              AMLstatus: null,
              KYCstatus: null,
            }),
          ],
        ],
      }),
    );
  });

  let documentId;
  it('uploadPartyDocument', async () => {
    expect(typeof createdPartyId).toBe('string');
    const fakeFile = {
      buffer: Buffer.from('a'.repeat(1e3)),
      originalname: `test-party-file.pdf`,
    };
    const response = await uploadPartyDocument(createdPartyId, fakeFile);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        document_details: 'Document has been uploaded Successfully',
      }),
    );
    documentId = response.data.document_details[0].documentId;
  });

  it('getPartyDocument -- no document ID', async () => {
    const response = await getPartyDocument(createdPartyId);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        partyDocumentDetails: expect.arrayContaining([
          expect.objectContaining({
            createdDate: expect.any(String),
            documentFileName: expect.any(String),
            documentFileReferenceCode: expect.any(String),
            documentTitle: expect.any(String),
            documentUrl: expect.any(String),
            documentid: expect.any(String),
            id: expect.any(String),
            partyid: createdPartyId,
          }),
        ]),
      }),
    );
  });

  it('getPartyDocument', async () => {
    const response = await getPartyDocument(createdPartyId, documentId);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        partyDocumentDetails: expect.arrayContaining([
          expect.objectContaining({
            createdDate: expect.any(String),
            documentFileName: expect.any(String),
            documentFileReferenceCode: expect.any(String),
            documentTitle: expect.any(String),
            documentUrl: expect.any(String),
            documentid: expect.any(String),
            id: expect.any(String),
            partyid: createdPartyId,
          }),
        ]),
      }),
    );
  });

  it('getAllParties', async () => {
    const { data } = await getAllParties();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        partyDetails: expect.anything(),
      }),
    );
  });
  it('deleteParty -- does not exist', async () => {
    const { data } = await deleteParty('fake-party-id');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '198',
      }),
    );
  });
  it('deleteParty -- success', async () => {
    const { data } = await deleteParty(createdPartyId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
      }),
    );
  });
});
