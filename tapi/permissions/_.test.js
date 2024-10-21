const uuid = require('uuid');
const { tapi, auth } = require('../util');

describe('permissions', () => {
  const scopeA = uuid.v4();
  const scopeB = uuid.v4();
  const testGrants = [
    { principalId: auth.developerAPIKey, scope: `${scopeA}.read` },
    { principalId: auth.developerAPIKey, scope: `${scopeA}.write` },
    { principalId: auth.developerAPIKey, scope: `${scopeB}.read.pii_high` },
  ];
  const sysAdminAuth = { Authorization: `Bearer ${auth.clientID}:${process.env.TAPI_MASTER_KEY}` };
  const superAdminApiKey = auth.developerAPIKey.replace(/^K/, 'J');
  const superAdminAuth = { Authorization: `Bearer ${auth.clientID}:${superAdminApiKey}` };

  afterAll(async () => {
    await tapi.put(
      '/permissions',
      { newGrants: [{ principalId: auth.developerAPIKey, scope: `permissions.write`, granted: false }] },
      {
        headers: sysAdminAuth,
      },
    );
  });
  it('POST permissions -- not system admin', async () => {
    const response = await tapi.put(
      '/permissions',
      { newGrants: testGrants },
      {
        headers: { Authorization: `Bearer ${auth.clientID}:${auth.developerAPIKey}` },
      },
    );

    expect(response.data).toStrictEqual({
      statusCode: '1401',
      statusDesc: 'Unauthorized: actor cannot execute this command',
    });
    expect(response.status).toStrictEqual(401);
  });
  it('POST permissions -- keys not accessible', async () => {
    const response = await tapi.put(
      '/permissions',
      {
        newGrants: [
          { principalId: 'not-a-valid-api-key', scope: `${scopeA}.read` },
          { principalId: auth.developerAPIKey, scope: `${scopeA}.write` },
          { principalId: auth.developerAPIKey, scope: `${scopeB}.read.pii_high` },
        ],
      },
      {
        headers: superAdminAuth,
      },
    );

    expect(response.data).toStrictEqual({
      statusCode: '1403',
      statusDesc: 'Forbidden: actor does not have permission to modify permissions on one or more requested principals',
    });
    expect(response.status).toStrictEqual(403);
  });
  it('POST permissions', async () => {
    const response = await tapi.put(
      '/permissions',
      { newGrants: testGrants },
      {
        headers: sysAdminAuth,
      },
    );

    expect(response.data.grants).toHaveLength(testGrants.length);
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      grants: expect.arrayContaining(
        testGrants.map((g) => ({ ...g, granted: '1', createdAt: expect.any(String), updatedAt: expect.any(String) })),
      ),
    });
    expect(response.status).toStrictEqual(200);
  });
  it('POST permissions -- after api key permsssions.write scope', async () => {
    await tapi.put(
      '/permissions',
      { newGrants: [{ principalId: auth.developerAPIKey, scope: `permissions.write` }] },
      {
        headers: sysAdminAuth,
      },
    );
    const newGrants = [
      { principalId: auth.developerAPIKey, scope: `${uuid.v4()}.read` },
      { principalId: auth.developerAPIKey, scope: `${uuid.v4()}.write` },
      { principalId: auth.developerAPIKey, scope: `${uuid.v4()}.pii_high` },
    ];
    const response = await tapi.put(
      '/permissions',
      {
        newGrants,
      },
      {
        headers: { Authorization: `Bearer ${auth.clientID}:${auth.developerAPIKey}` },
      },
    );

    expect(response.data.grants).toHaveLength(newGrants.length);
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      grants: expect.arrayContaining(
        newGrants.map((g) => ({ ...g, granted: '1', createdAt: expect.any(String), updatedAt: expect.any(String) })),
      ),
    });
    expect(response.status).toStrictEqual(200);
  });
  it('POST permissions -- update exisiting permissions', async () => {
    const revokeGrants = testGrants.map((g) => ({ ...g, granted: '0' }));
    const response = await tapi.put(
      '/permissions',
      { newGrants: revokeGrants },
      {
        headers: sysAdminAuth,
      },
    );

    expect(response.data.grants).toHaveLength(revokeGrants.length);
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      grants: expect.arrayContaining(
        revokeGrants.map((g) => ({ ...g, createdAt: expect.any(String), updatedAt: expect.any(String) })),
      ),
    });
    expect(response.status).toStrictEqual(200);
  });
  it('POST permissions -- no grants', async () => {
    const response = await tapi.put(
      '/permissions',
      {},
      {
        headers: sysAdminAuth,
      },
    );

    expect(response.data).toStrictEqual({
      statusCode: '1400',
      statusDesc: 'Bad request: no grants specified',
    });
    expect(response.status).toStrictEqual(400);
  });
  it('POST permissions -- empty grants', async () => {
    const response = await tapi.put(
      '/permissions',
      { newGrants: [] },
      {
        headers: sysAdminAuth,
      },
    );

    expect(response.data).toStrictEqual({
      statusCode: '1400',
      statusDesc: 'Bad request: no grants specified',
    });
    expect(response.status).toStrictEqual(400);
  });
  it('POST permissions -- malformed grant', async () => {
    const response = await tapi.put(
      '/permissions',
      {
        newGrants: [
          { principalId: auth.developerAPIKey, scope: `${scopeA}.read` },
          { principalId: auth.developerAPIKey, scope: `${scopeA}.write` },
          { principaId: auth.developerAPIKey, scope: `${scopeB}.read.pii_high` },
        ],
      },
      {
        headers: sysAdminAuth,
      },
    );

    expect(response.data).toStrictEqual({
      statusCode: '1400',
      statusDesc: 'Bad request: malformed grant',
    });
    expect(response.status).toStrictEqual(400);
  });
  it('GET permissions', async () => {
    const response = await tapi.get('/permissions', { headers: sysAdminAuth });
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      grants: expect.any(Array),
      pagination: {
        startIndex: expect.any(Number),
        endIndex: expect.any(Number),
        totalRecords: expect.any(Number),
      },
    });
    expect(response.status).toStrictEqual(200);
  });
  it('GET permissions -- super admin', async () => {
    const response = await tapi.get('/permissions', { headers: superAdminAuth });
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      grants: expect.any(Array),
      pagination: {
        startIndex: expect.any(Number),
        endIndex: expect.any(Number),
        totalRecords: expect.any(Number),
      },
    });
    expect(response.status).toStrictEqual(200);
  });
  it('GET permissions -- unauthorized', async () => {
    const response = await tapi.get('/permissions', { headers: auth });
    expect(response.data).toStrictEqual({
      statusCode: '1401',
      statusDesc: 'Unauthorized: actor cannot execute this command',
    });
    expect(response.status).toStrictEqual(401);
  });
  it('GET permissions -- authorized', async () => {
    const addGrant = await tapi.put(
      '/permissions',
      { newGrants: [{ principalId: auth.developerAPIKey, scope: 'permissions.read' }] },
      { headers: sysAdminAuth },
    );
    expect(addGrant.status).toStrictEqual(200);
    const response = await tapi.get('/permissions', {
      headers: { Authorization: `Bearer ${auth.clientID}:${auth.developerAPIKey}` },
    });
    expect(response.data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      grants: expect.any(Array),
      pagination: {
        startIndex: expect.any(Number),
        endIndex: expect.any(Number),
        totalRecords: expect.any(Number),
      },
    });
    expect(response.status).toStrictEqual(200);
  });
});
