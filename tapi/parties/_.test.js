const {
  createParty,
  updateParty,
  getParty,
  getParties,
  getPartiesPost,
  getAllParties,
  deleteParty,
  uploadPartyDocument,
  getPartyDocument,
} = require('.');
const { userToParty, hasRequiredPartyFields } = require('./util');

jest.setTimeout(120000);

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
  beforeAll(async () => {
    const { data } = await getParties({});
    if (data.pagination.totalRecords < 100) {
      await Promise.all(Array.from([...Array(100)], (x) => x + 1).map(() => createParty(validUser)));
    }
  });
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

  it('getParties -- default', async () => {
    const { data } = await getParties({});
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^P[0-9]{7,8}$/),
            amlDate: null,
            amlStatus: null,
            associatedPerson: null,
            avgAnnIncome: null,
            avgHouseholdIncome: null,
            createdDate: expect.any(String),
            currentAnnIncome: null,
            currentHouseholdIncome: null,
            primAddress1: expect.any(String),
            primCity: expect.any(String),
            primCountry: expect.any(String),
            primState: expect.any(String),
            primZip: expect.any(String),
            updatedDate: expect.any(String),
          }),
        ]),
      }),
    );
    expect(data.partyDetails).toHaveLength(10);
  });

  it('getParties -- offset NaN', async () => {
    const { data } = await getParties({ offset: 'start', limit: 10 });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1422',
        partyDetails: [],
      }),
    );
  });
  it('getParties -- limit NaN', async () => {
    const { data } = await getParties({ offset: 0, limit: 'none' });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1422',
        partyDetails: [],
      }),
    );
  });
  it('getParties -- offset out of range high', async () => {
    const { data } = await getParties({ offset: 1e7, limit: 10 });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        partyDetails: [],
      }),
    );
  });
  it('getParties -- offset out of range low', async () => {
    const { data } = await getParties({ offset: -1, limit: 10 });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        partyDetails: [],
      }),
    );
  });
  it('getParties -- limit out of range high', async () => {
    const { data } = await getParties({ offset: 10, limit: 10000 });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        partyDetails: [],
      }),
    );
  });
  it('getParties -- limit out of range low', async () => {
    const { data } = await getParties({ offset: 10, limit: 0 });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        partyDetails: [],
      }),
    );
  });
  it('getParties -- invalid type', async () => {
    const { data } = await getParties({ type: 'invalid' });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1422',
        partyDetails: [],
      }),
    );
  });

  it('getParties -- offset:1,limit:2', async () => {
    const { data } = await getParties({ offset: 1, limit: 2 });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^P[0-9]{7,8}$/),
            amlDate: null,
            amlStatus: null,
            associatedPerson: null,
            avgAnnIncome: null,
            avgHouseholdIncome: null,
            createdDate: expect.any(String),
            currentAnnIncome: null,
            currentHouseholdIncome: null,
            primAddress1: expect.any(String),
            primCity: expect.any(String),
            primCountry: expect.any(String),
            primState: expect.any(String),
            primZip: expect.any(String),
            updatedDate: expect.any(String),
          }),
        ]),
        pagination: expect.objectContaining({
          totalRecords: expect.any(Number),
          startIndex: 1,
          endIndex: 3,
        }),
      }),
    );
    expect(data.partyDetails).toHaveLength(2);
  });
  it('getParties -- offset:1,limit:2,type:individual', async () => {
    const { data } = await getParties({ offset: 1, limit: 2, type: 'individual' });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^P[0-9]{7,8}$/),
            amlDate: null,
            amlStatus: null,
            associatedPerson: null,
            avgAnnIncome: null,
            avgHouseholdIncome: null,
            createdDate: expect.any(String),
            currentAnnIncome: null,
            currentHouseholdIncome: null,
            primAddress1: expect.any(String),
            primCity: expect.any(String),
            primCountry: expect.any(String),
            primState: expect.any(String),
            primZip: expect.any(String),
            updatedDate: expect.any(String),
          }),
        ]),
        pagination: expect.objectContaining({
          totalRecords: expect.any(Number),
          startIndex: 1,
          endIndex: 3,
        }),
      }),
    );
    expect(data.partyDetails).toHaveLength(2);
  });
  it('getParties -- offset:1,limit:2,type:entity', async () => {
    const { data } = await getParties({ offset: 1, limit: 2, type: 'entity' });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        entityDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^E[0-9]{7,8}$/),
            createdDate: expect.any(String),
            updatedDate: expect.any(String),
            primAddress1: expect.any(String),
            primCity: expect.any(String),
            primCountry: expect.any(String),
            primState: expect.any(String),
            primZip: expect.any(String),
          }),
        ]),
        pagination: expect.objectContaining({
          totalRecords: expect.any(Number),
          startIndex: 1,
          endIndex: 3,
        }),
      }),
    );
    expect(data.entityDetails).toHaveLength(2);
  });
  it('getParties -- get last parties', async () => {
    const limit = 50;
    let offset = 0;

    const { data } = await getParties({ offset, limit });
    let parties = data.partyDetails;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) => getParties({ offset: offset + i * limit, limit })),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      parties = parties.concat(r.data.partyDetails);
    });

    expect(parties).toHaveLength(data.pagination.totalRecords - offset + limit);

    expect(parties).toStrictEqual(
      expect.arrayContaining([
        {
          partyId: createdPartyId,
          amlDate: null,
          amlStatus: null,
          associatedPerson: null,
          avgAnnIncome: null,
          avgHouseholdIncome: null,
          createdDate: expect.any(String),
          currentAnnIncome: null,
          currentHouseholdIncome: null,
          dob: '01-01-1970',
          documentKey: '',
          domicile: 'U.S. citizen',
          emailAddress: 'testuser@test.com',
          emailAddress2: '',
          empAddress1: '',
          empAddress2: '',
          empCity: '',
          empCountry: '',
          empName: '',
          empState: '',
          empStatus: null,
          empZip: null,
          esignStatus: 'NOTSIGNED',
          field1: '',
          field2: '',
          field3: '',
          firstName: 'Test',
          householdNetworth: null,
          invest_to: null,
          kycStatus: null,
          lastName: 'User',
          middleInitial: null,
          notes: '',
          occupation: '',
          partystatus: 'Active',
          phone: null,
          phone2: null,
          primAddress1: '123 Main St',
          primAddress2: '',
          primCity: expect.any(String),
          primCountry: 'USA',
          primState: 'AL',
          primZip: '00500',
          socialSecurityNumber: '',
          tags: '',
          updatedDate: expect.any(String),
        },
      ]),
    );
  });
  it('getParties -- get last parties w/ deleted', async () => {
    const limit = 50;
    let offset = 0;

    const { data } = await getParties({ offset, limit, deleted: true });
    let parties = data.partyDetails;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) => getParties({ offset: offset + i * limit, limit, deleted: true })),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      parties = parties.concat(r.data.partyDetails);
    });

    expect(parties).toHaveLength(data.pagination.totalRecords - offset + limit);

    expect(parties).toStrictEqual(
      expect.arrayContaining([
        {
          partyId: expect.stringMatching(/^P[0-9]{7,8}$/),
          amlDate: null,
          amlStatus: null,
          associatedPerson: null,
          avgAnnIncome: null,
          avgHouseholdIncome: null,
          createdDate: expect.any(String),
          currentAnnIncome: null,
          currentHouseholdIncome: null,
          dob: '01-01-1970',
          documentKey: '',
          domicile: 'U.S. citizen',
          emailAddress: 'testuser@test.com',
          emailAddress2: '',
          empAddress1: '',
          empAddress2: '',
          empCity: '',
          empCountry: '',
          empName: '',
          empState: '',
          empStatus: null,
          empZip: null,
          esignStatus: 'NOTSIGNED',
          field1: '',
          field2: '',
          field3: '',
          firstName: 'Test',
          householdNetworth: null,
          invest_to: null,
          kycStatus: null,
          lastName: 'User',
          middleInitial: null,
          notes: '',
          occupation: '',
          partystatus: 'Active',
          phone: null,
          phone2: null,
          primAddress1: '123 Main St',
          primAddress2: '',
          primCity: expect.any(String),
          primCountry: 'USA',
          primState: 'AL',
          primZip: '00500',
          socialSecurityNumber: '',
          tags: '',
          updatedDate: expect.any(String),
        },
        {
          partyId: expect.stringMatching(/^P[0-9]{7,8}$/),
          amlDate: null,
          amlStatus: null,
          associatedPerson: null,
          avgAnnIncome: null,
          avgHouseholdIncome: null,
          createdDate: expect.any(String),
          currentAnnIncome: null,
          currentHouseholdIncome: null,
          dob: '01-01-1970',
          documentKey: '',
          domicile: 'U.S. citizen',
          emailAddress: 'testuser@test.com',
          emailAddress2: '',
          empAddress1: '',
          empAddress2: '',
          empCity: '',
          empCountry: '',
          empName: '',
          empState: '',
          empStatus: null,
          empZip: null,
          esignStatus: 'NOTSIGNED',
          field1: '',
          field2: '',
          field3: '',
          firstName: 'Test',
          householdNetworth: null,
          invest_to: null,
          kycStatus: null,
          lastName: 'User',
          middleInitial: null,
          notes: '',
          occupation: '',
          partystatus: 'Archived',
          phone: null,
          phone2: null,
          primAddress1: '123 Main St',
          primAddress2: '',
          primCity: expect.any(String),
          primCountry: 'USA',
          primState: 'AL',
          primZip: '00500',
          socialSecurityNumber: '',
          tags: '',
          updatedDate: expect.any(String),
        },
      ]),
    );
  });
  it('getParties -- POST get last parties w/ deleted', async () => {
    const limit = 50;
    let offset = 0;

    const { data } = await getPartiesPost({ offset, limit, deleted: true });
    let parties = data.partyDetails;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) =>
        getPartiesPost({ offset: offset + i * limit, limit, deleted: true }),
      ),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      parties = parties.concat(r.data.partyDetails);
    });

    expect(parties).toHaveLength(data.pagination.totalRecords - offset + limit);

    expect(parties).toStrictEqual(
      expect.arrayContaining([
        {
          partyId: expect.stringMatching(/^P[0-9]{7,8}$/),
          amlDate: null,
          amlStatus: null,
          associatedPerson: null,
          avgAnnIncome: null,
          avgHouseholdIncome: null,
          createdDate: expect.any(String),
          currentAnnIncome: null,
          currentHouseholdIncome: null,
          dob: '01-01-1970',
          documentKey: '',
          domicile: 'U.S. citizen',
          emailAddress: 'testuser@test.com',
          emailAddress2: '',
          empAddress1: '',
          empAddress2: '',
          empCity: '',
          empCountry: '',
          empName: '',
          empState: '',
          empStatus: null,
          empZip: null,
          esignStatus: 'NOTSIGNED',
          field1: '',
          field2: '',
          field3: '',
          firstName: 'Test',
          householdNetworth: null,
          invest_to: null,
          kycStatus: null,
          lastName: 'User',
          middleInitial: null,
          notes: '',
          occupation: '',
          partystatus: 'Active',
          phone: null,
          phone2: null,
          primAddress1: '123 Main St',
          primAddress2: '',
          primCity: expect.any(String),
          primCountry: 'USA',
          primState: 'AL',
          primZip: '00500',
          socialSecurityNumber: '',
          tags: '',
          updatedDate: expect.any(String),
        },
        {
          partyId: expect.stringMatching(/^P[0-9]{7,8}$/),
          amlDate: null,
          amlStatus: null,
          associatedPerson: null,
          avgAnnIncome: null,
          avgHouseholdIncome: null,
          createdDate: expect.any(String),
          currentAnnIncome: null,
          currentHouseholdIncome: null,
          dob: '01-01-1970',
          documentKey: '',
          domicile: 'U.S. citizen',
          emailAddress: 'testuser@test.com',
          emailAddress2: '',
          empAddress1: '',
          empAddress2: '',
          empCity: '',
          empCountry: '',
          empName: '',
          empState: '',
          empStatus: null,
          empZip: null,
          esignStatus: 'NOTSIGNED',
          field1: '',
          field2: '',
          field3: '',
          firstName: 'Test',
          householdNetworth: null,
          invest_to: null,
          kycStatus: null,
          lastName: 'User',
          middleInitial: null,
          notes: '',
          occupation: '',
          partystatus: 'Archived',
          phone: null,
          phone2: null,
          primAddress1: '123 Main St',
          primAddress2: '',
          primCity: expect.any(String),
          primCountry: 'USA',
          primState: 'AL',
          primZip: '00500',
          socialSecurityNumber: '',
          tags: '',
          updatedDate: expect.any(String),
        },
      ]),
    );
  });
  it('getAllParties -- default', async () => {
    const { data } = await getAllParties();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        partyDetails: expect.arrayContaining([
          {
            partyId: expect.stringMatching(/^P[0-9]{7,8}$/),
            amlDate: null,
            amlStatus: null,
            associatedPerson: null,
            avgAnnIncome: null,
            avgHouseholdIncome: null,
            createdDate: expect.any(String),
            currentAnnIncome: null,
            currentHouseholdIncome: null,
            dob: '01-01-1970',
            documentKey: '',
            domicile: 'U.S. citizen',
            emailAddress: 'testuser@test.com',
            emailAddress2: '',
            empAddress1: '',
            empAddress2: '',
            empCity: '',
            empCountry: '',
            empName: '',
            empState: '',
            empStatus: null,
            empZip: null,
            esignStatus: 'NOTSIGNED',
            field1: '',
            field2: '',
            field3: '',
            firstName: 'Test',
            householdNetworth: null,
            invest_to: null,
            kycStatus: null,
            lastName: 'User',
            middleInitial: null,
            notes: '',
            occupation: '',
            partystatus: expect.any(String),
            phone: null,
            phone2: null,
            primAddress1: '123 Main St',
            primAddress2: '',
            primCity: expect.any(String),
            primCountry: 'USA',
            primState: 'AL',
            primZip: '00500',
            socialSecurityNumber: '',
            tags: '',
            updatedDate: expect.any(String),
          },
          expect.objectContaining({
            partyId: expect.stringMatching(/^[PE][0-9]{7,8}$/),
            partystatus: 'Archived',
          }),
          expect.objectContaining({
            partyId: expect.stringMatching(/^E[0-9]{7,8}$/),
            createdDate: expect.any(String),
            formationDate: expect.any(String),
            emailAddress: 'testuser@test.com',
            esignStatus: 'NOTSIGNED',
            partystatus: expect.any(String),
            primAddress1: '123 Main St',
            primCity: expect.any(String),
            primCountry: 'USA',
            primState: 'AL',
            primZip: '00500',
            updatedDate: expect.any(String),
          }),
        ]),
      }),
    );
  });
  it('getAllParties -- with pagination', async () => {
    const { data } = await getAllParties(0, 10);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^[PE][0-9]{7,8}$/),
            amlDate: null,
            amlStatus: null,
            associatedPerson: null,
            avgAnnIncome: null,
            avgHouseholdIncome: null,
            createdDate: expect.any(String),
            currentAnnIncome: null,
            currentHouseholdIncome: null,
            primAddress1: expect.any(String),
            primCity: expect.any(String),
            primCountry: expect.any(String),
            primState: expect.any(String),
            primZip: expect.any(String),
            updatedDate: expect.any(String),
          }),
        ]),
      }),
    );
    expect(data.partyDetails).toHaveLength(10);
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
