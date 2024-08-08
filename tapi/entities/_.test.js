const { createEntity, updateEntity, getEntity, getEntities, getEntitiesPost, deleteEntity } = require('.');

jest.setTimeout(20000);

describe('entities', () => {
  let createdEntityId;
  beforeAll(async () => {
    const { data } = await getEntities({});
    if (data.pagination.totalRecords < 100) {
      await Promise.all(
        Array.from([...Array(100)], (x) => x + 1).map(() =>
          createEntity({
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
          }),
        ),
      );
    }
  });
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
        partyId: expect.stringMatching(/^E[0-9]{6,8}$/),
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
        entityDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^E[0-9]{6,8}$/),
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
    expect(data.entityDetails).toHaveLength(10);
  });
  it('getEntities -- invalid client ID', async () => {
    const getRes = await getEntities(
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
    const postRes = await getEntitiesPost({}, { clientID: 'invalid-client-id' });
    expect(postRes.status).toStrictEqual(401);
    expect(postRes.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '103',
      }),
    );
  });
  it('getEntities -- invalid API key', async () => {
    const { data } = await getEntitiesPost({}, { developerAPIKey: 'invalid-api-key' });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '103',
      }),
    );
    const { data: get } = await getEntities(
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
  it('getEntities -- offset NaN', async () => {
    const { data } = await getEntities({ offset: 'start', limit: 10 });
    expect(data.entityDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1422',
        entityDetails: [],
      }),
    );
  });
  it('getEntities -- limit NaN', async () => {
    const { data } = await getEntities({ offset: 0, limit: 'none' });
    expect(data.entityDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1422',
        entityDetails: [],
      }),
    );
  });
  it('getEntities -- offset out of range high', async () => {
    const { data } = await getEntities({ offset: 1e7, limit: 10 });
    expect(data.entityDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        entityDetails: [],
      }),
    );
  });
  it('getEntities -- offset out of range low', async () => {
    const { data } = await getEntities({ offset: -1, limit: 10 });
    expect(data.entityDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        entityDetails: [],
      }),
    );
  });
  it('getEntities -- limit out of range high', async () => {
    const { data } = await getEntities({ offset: 10, limit: 10000 });
    expect(data.entityDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        entityDetails: [],
      }),
    );
  });
  it('getEntities -- limit out of range low', async () => {
    const { data } = await getEntities({ offset: 10, limit: 0 });
    expect(data.entityDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        entityDetails: [],
      }),
    );
  });

  it('getEntities -- offset:1,limit:2', async () => {
    const { data } = await getEntities({ offset: 1, limit: 2 });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        entityDetails: expect.arrayContaining([
          expect.objectContaining({
            partyId: expect.stringMatching(/^E[0-9]{6,8}$/),
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
    expect(data.entityDetails).toHaveLength(2);
  });
  it('getEntities -- get last entities', async () => {
    const limit = 50;
    let offset = 0;

    const { data } = await getEntities({ offset, limit });
    let entities = data.entityDetails;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) => getEntities({ offset: offset + i * limit, limit })),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      entities = entities.concat(r.data.entityDetails);
    });

    expect(entities).toHaveLength(data.pagination.totalRecords - offset + limit);

    expect(entities).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          partyId: expect.stringMatching(/^E[0-9]{6,8}$/),
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
  it('getEntities -- get last entities w/ deleted', async () => {
    const limit = 50;
    let offset = 0;

    const { data } = await getEntities({ offset, limit, deleted: true });
    let entities = data.entityDetails;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) =>
        getEntities({ offset: offset + i * limit, limit, deleted: true }),
      ),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      entities = entities.concat(r.data.entityDetails);
    });

    expect(entities).toHaveLength(data.pagination.totalRecords - offset + limit);

    expect(entities).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          partyId: createdEntityId,
          partystatus: 'Active',
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        }),
        expect.objectContaining({
          partyId: expect.stringMatching(/^E[0-9]{6,8}$/),
          partystatus: 'Archived',
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        }),
      ]),
    );
  });
  it('getEntities -- POST get last entities w/ deleted', async () => {
    const limit = 50;
    let offset = 0;

    const { data } = await getEntitiesPost({ offset, limit, deleted: true });
    let entities = data.entityDetails;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) =>
        getEntitiesPost({ offset: offset + i * limit, limit, deleted: true }),
      ),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      entities = entities.concat(r.data.entityDetails);
    });

    expect(entities).toHaveLength(data.pagination.totalRecords - offset + limit);

    expect(entities).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          partyId: createdEntityId,
          partystatus: 'Active',
          createdDate: expect.any(String),
          updatedDate: expect.any(String),
        }),
        expect.objectContaining({
          partyId: expect.stringMatching(/^E[0-9]{6,8}$/),
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
