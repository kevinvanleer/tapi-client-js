const { createEntity, updateEntity, getEntity, getEntities, getEntitiesPost, deleteEntity } = require('.');

jest.setTimeout(20000);

describe('entities', () => {
  let createdEntityId;
  it('createEntity', async () => {
    const entity = {
      domicile: 'U.S. citizen',
      entityName: 'Entity Name',
      entityType: 'revocable trust',
      entityDesc: 'Entity Description',
      ein: '152152',
      primCountry: 'USA',
      primAddress1: 'PEACHTREE PLACE',
      primAddress2: 'PEACHTREE PLACE',
      primCity: 'Atlanta',
      primState: 'GA',
      primZip: '30318',
      emailAddress: 'johnsmith@gmail.com',
      emailAddress2: 'johnsmith@norcapsecurities.com',
      phone: '1234567890',
      phone2: '2147483647',
      totalAssets: '3',
      ownersAI: 'no',
      KYCstatus: 'Pending',
      AMLstatus: 'Pending',
      AMLdate: '02-15-2016',
      tags: 'Tags',
      notes: 'Notes Added',
    };
    const { data } = await createEntity(entity);
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [entityDetails]] = data.entityDetails;
    expect(entityDetails).toStrictEqual(
      expect.objectContaining({
        partyId: expect.stringMatching(/^E[0-9]{7,8}$/),
      }),
    );
    createdEntityId = entityDetails.partyId;
  });
  it('createEntity -- missing required field (zip)', async () => {
    const entity = {
      domicile: 'U.S. citizen',
      entityName: 'Entity Name',
      entityType: 'revocable trust',
      entityDesc: 'Entity Description',
      ein: '152152',
      primCountry: 'USA',
      primAddress1: 'PEACHTREE PLACE',
      primAddress2: 'PEACHTREE PLACE',
      primCity: 'Atlanta',
      primState: 'GA',
      emailAddress: 'johnsmith@gmail.com',
      emailAddress2: 'johnsmith@norcapsecurities.com',
      phone: '1234567890',
      phone2: '2147483647',
      totalAssets: '3',
      ownersAI: 'no',
      KYCstatus: 'Pending',
      AMLstatus: 'Pending',
      AMLdate: '02-15-2016',
      tags: 'Tags',
      notes: 'Notes Added',
    };
    const { data } = await createEntity(entity);
    expect(data.statusCode).toEqual('106');
  });
  it('updateEntity', async () => {
    const user = {
      partyId: createdEntityId,
      primCity: 'Best City',
    };
    const { data } = await updateEntity(user);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusDesc: 'Ok',
        statusCode: '101',
      }),
    );
    const [, [entityDetails]] = data.entityDetails;
    expect(entityDetails).toStrictEqual(
      expect.objectContaining({
        partyId: createdEntityId,
        AMLstatus: 'Pending',
        KYCstatus: 'Pending',
      }),
    );
  });

  it('getEntity', async () => {
    const { data } = await getEntity(createdEntityId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        entityDetails: expect.anything(),
      }),
    );
    const { entityDetails } = data;
    expect(entityDetails).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          partyId: createdEntityId,
          AMLstatus: 'Pending',
          KYCstatus: 'Pending',
        }),
      ]),
    );
  });
  it('getEntities -- default', async () => {
    const { data } = await getEntities({});
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^E[0-9]{7,8}$/),
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
    expect(data.partyDetails).toHaveLength(10);
  });

  it('getEntities -- offset NaN', async () => {
    const { data } = await getEntities({ offset: 'start', limit: 10 });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '240',
        partyDetails: [],
      }),
    );
  });
  it('getEntities -- limit NaN', async () => {
    const { data } = await getEntities({ offset: 0, limit: 'none' });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '240',
        partyDetails: [],
      }),
    );
  });
  it('getEntities -- offset out of range high', async () => {
    const { data } = await getEntities({ offset: 1e7, limit: 10 });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        partyDetails: [],
      }),
    );
  });
  it('getEntities -- offset out of range low', async () => {
    const { data } = await getEntities({ offset: -1, limit: 10 });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        partyDetails: [],
      }),
    );
  });
  it('getEntities -- limit out of range high', async () => {
    const { data } = await getEntities({ offset: 10, limit: 10000 });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        partyDetails: [],
      }),
    );
  });
  it('getEntities -- limit out of range low', async () => {
    const { data } = await getEntities({ offset: 10, limit: 0 });
    expect(data.partyDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        partyDetails: [],
      }),
    );
  });

  it('getEntities -- offset:1,limit:2', async () => {
    const { data } = await getEntities({ offset: 1, limit: 2 });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        partyDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^E[0-9]{7,8}$/),
            createdDate: expect.any(String),
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
  it('getEntities -- get all parties', async () => {
    const limit = 50;
    const offset = 0;

    const { data } = await getEntities({ offset, limit });
    let parties = data.partyDetails;

    if (data.pagination.totalRecords <= limit) {
      jest.fail('There is not more than one page of data');
    }

    const responses = await Promise.all(
      Array.from([...Array(Math.ceil(data.pagination.totalRecords / limit - 1))], (x) => x + 1).map((_, i) =>
        getEntities({ offset: (i + 1) * limit, limit }),
      ),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      parties = parties.concat(r.data.partyDetails);
    });

    expect(parties).toHaveLength(data.pagination.totalRecords);

    expect(parties).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          partyId: expect.stringMatching(/^E[0-9]{7,8}$/),
          createdDate: expect.any(String),
          primAddress1: expect.any(String),
          primCity: expect.any(String),
          primCountry: expect.any(String),
          primState: expect.any(String),
          primZip: expect.any(String),
          updatedDate: expect.any(String),
        }),
      ]),
    );
  });
  it('getEntities -- get all parties w/ deleted', async () => {
    const limit = 50;
    const offset = 0;

    const { data } = await getEntities({ offset, limit, deleted: true });
    let parties = data.partyDetails;

    if (data.pagination.totalRecords <= limit) {
      jest.fail('There is not more than one page of data');
    }

    const responses = await Promise.all(
      Array.from([...Array(Math.ceil(data.pagination.totalRecords / limit - 1))], (x) => x + 1).map((_, i) =>
        getEntities({ offset: (i + 1) * limit, limit, deleted: true }),
      ),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      parties = parties.concat(r.data.partyDetails);
    });

    expect(parties).toHaveLength(data.pagination.totalRecords);

    expect(parties).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          partyId: createdEntityId,
          partystatus: 'Active',
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        }),
        expect.objectContaining({
          partyId: expect.stringMatching(/^E[0-9]{7,8}$/),
          partystatus: 'Archived',
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        }),
      ]),
    );
  });
  it('getEntities -- POST get all parties w/ deleted', async () => {
    const limit = 50;
    const offset = 0;

    const { data } = await getEntitiesPost({ offset, limit, deleted: true });
    let parties = data.partyDetails;

    if (data.pagination.totalRecords <= limit) {
      jest.fail('There is not more than one page of data');
    }

    const responses = await Promise.all(
      Array.from([...Array(Math.ceil(data.pagination.totalRecords / limit - 1))], (x) => x + 1).map((_, i) =>
        getEntities({ offset: (i + 1) * limit, limit, deleted: true }),
      ),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      parties = parties.concat(r.data.partyDetails);
    });

    expect(parties).toHaveLength(data.pagination.totalRecords);

    expect(parties).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          partyId: createdEntityId,
          partystatus: 'Active',
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        }),
        expect.objectContaining({
          partyId: expect.stringMatching(/^E[0-9]{7,8}$/),
          partystatus: 'Archived',
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        }),
      ]),
    );
  });
  it('deleteEntity -- does not exist', async () => {
    const { data } = await deleteEntity('fake-entity-id');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '198',
      }),
    );
  });
  it('deleteEntity -- success', async () => {
    const { data } = await deleteEntity(createdEntityId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
      }),
    );
  });
});
