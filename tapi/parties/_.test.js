const { omit } = require('lodash');
const FormData = require('form-data');
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
const { tapi, auth } = require('../util');

jest.setTimeout(120000);

describe('parties', () => {
  let createdPartyId;
  let completePartyId;
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
  const validDate = '1976-04-11';
  const completeParty = {
    AMLdate: validDate,
    AMLstatus: 'APPROVED',
    associatedPerson: 'no',
    avgAnnIncome: '123456',
    avgHouseholdIncome: '234567',
    currentAnnIncome: '112233',
    currentHouseholdIncome: '223344',
    dob: '01-01-1970',
    domicile: 'U.S. citizen',
    emailAddress: 'testuser@test.com',
    emailAddress2: 'email2@test.com',
    empAddress1: 'employer address 1',
    empAddress2: 'employer address 2',
    empCity: 'employer city',
    empCountry: 'employer country',
    empName: 'employer name',
    empState: 'employer state',
    empStatus: 'employer status',
    empZip: 'employer zip',
    esignStatus: 'NOTSIGNED',
    field1: 'field 1 entry',
    field2: 'field 2 entry',
    field3: 'field 3 entry',
    firstName: 'Test',
    householdNetworth: '12345678',
    invest_to: '1',
    KYCstatus: 'APPROVED',
    lastName: 'User',
    middleInitial: 'Z',
    notes: 'notes entry',
    occupation: 'test-occupation',
    phone: '5555555555',
    phone2: '6666666666',
    primAddress1: '123 Main St',
    primAddress2: 'primary address 2',
    primCity: 'primary city',
    primCountry: 'USA',
    primState: 'AL',
    primZip: '00500',
    socialSecurityNumber: '123456789',
    tags: 'some tags',
  };
  beforeAll(async () => {
    const { data } = await getParties({});
    if (data.pagination.totalRecords < 100) {
      await Promise.all(Array.from([...Array(100)], (x) => x + 1).map(() => createParty(userToParty(validUser))));
    }
  });
  it('createParty', async () => {
    expect(hasRequiredPartyFields(validUser)).toBe(true);
    const { data } = await createParty(userToParty(validUser));
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [partyDetails]] = data.partyDetails;
    expect(partyDetails).toStrictEqual(
      expect.objectContaining({
        partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
        AMLstatus: null,
        KYCstatus: null,
      }),
    );
    createdPartyId = partyDetails.partyId;
  });
  it('createParty -- form data', async () => {
    expect(hasRequiredPartyFields(validUser)).toBe(true);
    const body = new FormData();
    Object.entries(userToParty(validUser)).forEach(([key, value]) => body.append(key, value));
    body.append('clientID', auth.clientID);
    body.append('developerAPIKey', auth.developerAPIKey);
    const res = await tapi.put('/createParty', body, { headers: { ...body.getHeaders() } });
    expect(res.status).toEqual(404);
    expect(res.data.statusCode).toEqual('103');
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
    const { data } = await createParty(userToParty(user));
    expect(data.statusCode).toEqual('106');
  });
  it('createParty -- invalid state code', async () => {
    const party = userToParty({
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
    party.primState = 'ZZ';
    const { data } = await createParty(party);
    expect(data.statusCode).toEqual('101');
  });
  it('createParty -- invalid state name', async () => {
    const party = userToParty({
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
    party.primState = 'Invalid';
    const { data } = await createParty(party);
    expect(data.statusCode).toEqual('101');
  });
  it('createParty -- valid state name', async () => {
    const party = userToParty({
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
    party.primState = 'Alabama';
    const { data } = await createParty(party);
    expect(data.statusCode).toEqual('101');
  });
  it('createParty -- valid armed forces', async () => {
    const party = userToParty({
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
    party.primState = 'AA';
    const { data } = await createParty(party);
    expect(data.statusCode).toEqual('101');
  });
  it('createParty -- invalid non-US', async () => {
    const party = userToParty({
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
    party.primState = 'non-US';
    const { data } = await createParty(party);
    expect(data.statusCode).toEqual('101');
  });
  it('createParty -- invalid Non-U.S', async () => {
    const party = userToParty({
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
    party.primState = 'Non-U.S';
    const { data } = await createParty(party);
    expect(data.statusCode).toEqual('101');
  });
  it('createParty -- invalid non-us', async () => {
    const party = userToParty({
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
    party.primState = 'non-us';
    const { data } = await createParty(party);
    expect(data.statusCode).toEqual('101');
  });
  it('createParty -- NOUS', async () => {
    const party = userToParty({
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
    party.primState = 'NOUS';
    const { data } = await createParty(party);
    expect(data.statusCode).toEqual('101');
  });
  it('createParty -- populate all fields', async () => {
    const { data } = await createParty(completeParty);
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [partyDetails]] = data.partyDetails;
    expect(partyDetails).toStrictEqual(
      expect.objectContaining({
        partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
        AMLstatus: 'APPROVED',
        KYCstatus: 'APPROVED',
      }),
    );
    completePartyId = partyDetails.partyId;
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
  it('getParty -- form data', async () => {
    const body = new FormData();
    body.append('clientID', auth.clientID);
    body.append('developerAPIKey', auth.developerAPIKey);
    body.append('partyId', global.partyId);
    const { data } = await tapi.post('/getParty', body, { headers: { ...body.getHeaders() } });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        partyDetails: [
          expect.objectContaining({
            ...userToParty({ ...validUser, partyId: global.partyId }),
          }),
        ],
      }),
    );
  });
  it('getParty -- all fields populated', async () => {
    const completePartyResponse = omit(
      {
        ...completeParty,
        kycStatus: completeParty.KYCstatus,
        amlStatus: completeParty.AMLstatus,
        amlDate: completeParty.AMLdate,
        documentKey: '',
        createdDate: expect.any(String),
        updatedDate: expect.any(String),
        partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
      },
      ['AMLstatus', 'KYCstatus', 'AMLdate'],
    );
    const { data } = await getParty(completePartyId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        partyDetails: [completePartyResponse],
      }),
    );
  });
  it('updateParty', async () => {
    const user = {
      partyId: createdPartyId,
      city: 'Best City',
    };
    const { data } = await updateParty(userToParty(user));
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
            partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
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

  it('getParties -- invalid client ID', async () => {
    const getRes = await getParties(
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
    const postRes = await getPartiesPost({}, { clientID: 'invalid-client-id' });
    expect(postRes.status).toStrictEqual(401);
    expect(postRes.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '103',
      }),
    );
  });
  it('getParties -- invalid API key', async () => {
    const { data } = await getPartiesPost({}, { developerAPIKey: 'invalid-api-key' });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '103',
      }),
    );
    const { data: get } = await getParties(
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.TAPI_CLIENT_ID}:invalid`,
        },
      },
    );
    expect(get).toStrictEqual(
      expect.objectContaining({
        statusCode: '103',
      }),
    );
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
        statusDesc: 'Request parameter out of accepted range: limit 10000 is not between 1 and 500',
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
            partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
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
            partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
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
            partyId: expect.stringMatching(/^E[0-9]{6,8}$/),
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
    expect(parties.every((p) => p.emailAddress !== 'otheruser@test.com')).toBe(true);

    const expectedParty = {
      partyId: createdPartyId,
      createdDate: expect.any(String),
      dob: '01-01-1970',
      domicile: 'U.S. citizen',
      emailAddress: 'testuser@test.com',
      esignStatus: 'NOTSIGNED',
      firstName: 'Test',
      lastName: 'User',
      partystatus: 'Active',
      primAddress1: '123 Main St',
      primCity: expect.any(String),
      primCountry: 'USA',
      primState: 'AL',
      primZip: '00500',
      updatedDate: expect.any(String),
    };

    const myParty = parties.find((p) => p.partyId === createdPartyId);
    expect(myParty).toStrictEqual(expect.objectContaining(expectedParty));

    expect(parties).toStrictEqual(expect.arrayContaining([expect.objectContaining(expectedParty)]));
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
    expect(parties.every((p) => p.emailAddress !== 'otheruser@test.com')).toBe(true);

    expect(parties).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
          createdDate: expect.any(String),
          dob: '01-01-1970',
          domicile: 'U.S. citizen',
          emailAddress: 'testuser@test.com',
          esignStatus: 'NOTSIGNED',
          firstName: 'Test',
          lastName: 'User',
          partystatus: 'Active',
          primAddress1: '123 Main St',
          primCity: expect.any(String),
          primCountry: 'USA',
          primState: 'AL',
          primZip: '00500',
          updatedDate: expect.any(String),
        }),
        expect.objectContaining({
          partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
          createdDate: expect.any(String),
          dob: '01-01-1970',
          domicile: 'U.S. citizen',
          emailAddress: 'testuser@test.com',
          esignStatus: 'NOTSIGNED',
          firstName: 'Test',
          lastName: 'User',
          partystatus: 'Archived',
          primAddress1: '123 Main St',
          primCity: expect.any(String),
          primCountry: 'USA',
          primState: 'AL',
          primZip: '00500',
          updatedDate: expect.any(String),
        }),
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
    expect(parties.every((p) => p.emailAddress !== 'otheruser@test.com')).toBe(true);

    expect(parties).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
          createdDate: expect.any(String),
          dob: '01-01-1970',
          domicile: 'U.S. citizen',
          emailAddress: 'testuser@test.com',
          esignStatus: 'NOTSIGNED',
          firstName: 'Test',
          lastName: 'User',
          partystatus: 'Active',
          primAddress1: '123 Main St',
          primCity: expect.any(String),
          primCountry: 'USA',
          primState: 'AL',
          primZip: '00500',
          updatedDate: expect.any(String),
        }),
        expect.objectContaining({
          partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
          createdDate: expect.any(String),
          dob: '01-01-1970',
          domicile: 'U.S. citizen',
          emailAddress: 'testuser@test.com',
          esignStatus: 'NOTSIGNED',
          firstName: 'Test',
          lastName: 'User',
          partystatus: 'Archived',
          primAddress1: '123 Main St',
          primCity: expect.any(String),
          primCountry: 'USA',
          primState: 'AL',
          primZip: '00500',
          updatedDate: expect.any(String),
        }),
      ]),
    );
  });
  it.skip('getAllParties -- default', async () => {
    const { data } = await getAllParties();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^P[0-9]{6,8}$/),
            createdDate: expect.any(String),
            dob: '01-01-1970',
            domicile: 'U.S. citizen',
            emailAddress: 'testuser@test.com',
            esignStatus: 'NOTSIGNED',
            firstName: 'Test',
            lastName: 'User',
            partystatus: expect.any(String),
            primAddress1: '123 Main St',
            primCity: expect.any(String),
            primCountry: 'USA',
            primState: 'AL',
            primZip: '00500',
            updatedDate: expect.any(String),
          }),
          expect.objectContaining({
            partyId: expect.stringMatching(/^[PE][0-9]{6,8}$/),
            partystatus: 'Archived',
          }),
          expect.objectContaining({
            partyId: expect.stringMatching(/^E[0-9]{6,8}$/),
            createdDate: expect.any(String),
            emailAddress: expect.any(String),
            esignStatus: 'NOTSIGNED',
            partystatus: expect.any(String),
            primAddress1: expect.any(String),
            primCity: expect.any(String),
            primCountry: 'USA',
            primState: expect.any(String),
            primZip: expect.any(String),
            updatedDate: expect.any(String),
          }),
        ]),
      }),
    );
  });
  it('getAllParties -- with pagination', async () => {
    const { data } = await getAllParties(0, 10);
    expect(data.partyDetails).toHaveLength(10);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^[PE][0-9]{6,8}$/),
            createdDate: expect.any(String),
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
