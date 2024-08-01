const { createAccount, updateAccount, getAccount, getAccounts, getAccountsPost, getAllAccounts, deleteAccount } = require('.');
const { makeIndividualAccount } = require('./util');

describe('accounts', () => {
  let createdAccountId;

  const validUser = {
    email: 'testuser@test.test',
    first_name: 'Test',
    last_name: 'User',
    address1: '123 Main St',
    city: 'Test City',
    state: 'Alabama',
    zip_code: 500,
    date_of_birth: new Date(1970, 0, 1),
    country_iso_3: 'USA',
    social_security_number: '123-45-6789',
    usa_citizenship_status: 'citizen',
  };

  const validAccount = makeIndividualAccount(validUser);

  beforeAll(async () => {
    const { data } = await getAccounts({});
    if (data.pagination.totalRecords < 100) {
      await Promise.all(Array.from([...Array(100)], (x) => x + 1).map(() => createAccount(validUser)));
    }
  });
  it('createAccount -- invalid', async () => {
    const user = {
      email: 'testuser@test.test',
      first_name: 'Test',
      last_name: 'User',
      address1: '123 Main St',
      city: 'Test City',
      state: 'asdf',
      zip_code: 500,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
    };
    const { data } = await createAccount(user);
    expect(data.statusDesc).not.toEqual('Ok');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '106',
      }),
    );
  });
  it('createAccount -- valid', async () => {
    const user = {
      email: 'testuser@test.test',
      first_name: 'Test',
      last_name: 'User',
      address1: '123 Main St',
      city: 'Test City',
      state: 'Alabama',
      zip_code: 500,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      social_security_number: '123-45-6789',
      usa_citizenship_status: 'citizen',
    };
    const { data } = await createAccount(user);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        accountDetails: expect.arrayContaining([expect.objectContaining({ accountId: expect.stringMatching(/^A[0-9]{7,8}$/) })]),
      }),
    );
    createdAccountId = data.accountDetails[0].accountId;
    expect(createdAccountId.startsWith('A')).toBe(true);
  });
  it('getAccount -- invalid ID', async () => {
    const { data } = await getAccount('invalid-account-id');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '148',
        statusDesc: 'Account is not exist/active.',
      }),
    );
  });
  it('getAccount -- does not exist', async () => {
    const { data } = await getAccount('A0000000');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '148',
        statusDesc: 'Account is not exist/active.',
      }),
    );
  });
  it('getAccount', async () => {
    const account = {
      accountId: createdAccountId,
      email: 'testuser@test.test',
      accountName: 'Test User',
      address1: '123 Main St',
      city: 'Test City',
      state: 'AL',
      zip: '00500',
      country: 'USA',
      taxID: '123-45-6789',
      residentType: 'domestic_account',
      type: 'individual',
    };
    const { data } = await getAccount(createdAccountId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        accountDetails: expect.objectContaining(account),
      }),
    );
  });
  it('updateAccount -- valid', async () => {
    expect(createdAccountId.startsWith('A')).toBe(true);
    const user = {
      accountId: createdAccountId,
      email: 'testuser@test.test',
      first_name: 'Test',
      last_name: 'User',
      address1: '124 Main St',
      city: 'Test City',
      state: 'Alabama',
      zip_code: 501,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
    };
    const { data } = await updateAccount(user);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
      }),
    );
  });

  it('getAccounts -- default', async () => {
    const { data } = await getAccounts({});
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        accountDetails: expect.arrayContaining([
          expect.objectContaining({
            accountId: expect.stringMatching(/^A[0-9]{7,8}$/),
          }),
        ]),
      }),
    );
    expect(data.accountDetails).toHaveLength(10);
  });

  it('getAccounts -- offset NaN', async () => {
    const { data } = await getAccounts({ offset: 'start', limit: 10 });
    expect(data.accountDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1422',
        accountDetails: [],
      }),
    );
  });
  it('getAccounts -- limit NaN', async () => {
    const { data } = await getAccounts({ offset: 0, limit: 'none' });
    expect(data.accountDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1422',
        accountDetails: [],
      }),
    );
  });
  it('getAccounts -- offset out of range high', async () => {
    const { data } = await getAccounts({ offset: 1e7, limit: 10 });
    expect(data.accountDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        accountDetails: [],
      }),
    );
  });
  it('getAccounts -- offset out of range low', async () => {
    const { data } = await getAccounts({ offset: -1, limit: 10 });
    expect(data.accountDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        accountDetails: [],
      }),
    );
  });
  it('getAccounts -- limit out of range high', async () => {
    const { data } = await getAccounts({ offset: 10, limit: 10000 });
    expect(data.accountDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        accountDetails: [],
      }),
    );
  });
  it('getAccounts -- limit out of range low', async () => {
    const { data } = await getAccounts({ offset: 10, limit: 0 });
    expect(data.accountDetails).toHaveLength(0);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '239',
        accountDetails: [],
      }),
    );
  });
  it('getAccounts -- offset:1,limit:2', async () => {
    const { data } = await getAccounts({ offset: 1, limit: 2 });
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        accountDetails: expect.arrayContaining([
          expect.objectContaining({
            accountId: expect.stringMatching(/^A[0-9]{7,8}$/),
          }),
        ]),
        pagination: expect.objectContaining({
          totalRecords: expect.any(Number),
          startIndex: 1,
          endIndex: 3,
        }),
      }),
    );
    expect(data.accountDetails).toHaveLength(2);
  });
  it('getAccounts -- get last accounts', async () => {
    const limit = 50;
    let offset = 0;

    const newAccount = (await createAccount(validUser)).data.accountDetails[0];

    const { data } = await getAccounts({ offset, limit });
    let accounts = data.accountDetails;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) => getAccounts({ offset: offset + i * limit, limit })),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      accounts = accounts.concat(r.data.accountDetails);
    });

    expect(accounts).toHaveLength(data.pagination.totalRecords - offset + limit);
    expect(accounts.every((p) => p.emailAddress !== 'otheruser@test.com')).toBe(true);

    expect(accounts).toStrictEqual(expect.arrayContaining([expect.objectContaining(newAccount)]));
  });
  it('getAccounts -- get last accounts w/ deleted', async () => {
    const limit = 50;
    let offset = 0;

    const { data } = await getAccounts({ offset, limit, deleted: true });
    let accounts = data.accountDetails;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) =>
        getAccounts({ offset: offset + i * limit, limit, deleted: true }),
      ),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      accounts = accounts.concat(r.data.accountDetails);
    });

    expect(accounts).toHaveLength(data.pagination.totalRecords - offset + limit);
    expect(accounts.every((p) => p.emailAddress !== 'otheruser@test.com')).toBe(true);

    expect(accounts).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          accountId: expect.stringMatching(/^A[0-9]{7,8}$/),
          accountstatus: 'Active',
        }),
        expect.objectContaining({
          accountId: expect.stringMatching(/^A[0-9]{7,8}$/),
          accountstatus: 'Archived',
        }),
      ]),
    );
  });
  it('getAccounts -- POST get last accounts w/ deleted', async () => {
    const limit = 50;
    let offset = 0;

    const { data } = await getAccountsPost({ offset, limit, deleted: true });
    let accounts = data.accountDetails;

    expect(data.pagination.totalRecords).toBeGreaterThan(limit);

    offset = Math.max(data.pagination.totalRecords - 100, limit);
    const pages = Math.ceil((data.pagination.totalRecords - offset) / limit);

    const responses = await Promise.all(
      Array.from([...Array(pages)], (x) => x + 1).map((_, i) =>
        getAccountsPost({ offset: offset + i * limit, limit, deleted: true }),
      ),
    );

    responses.forEach((r) => {
      expect(r.data.statusCode).toStrictEqual('101');
      accounts = accounts.concat(r.data.accountDetails);
    });

    expect(accounts).toHaveLength(data.pagination.totalRecords - offset + limit);
    expect(accounts.every((p) => p.emailAddress !== 'otheruser@test.com')).toBe(true);

    expect(accounts).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          accountId: expect.stringMatching(/^A[0-9]{7,8}$/),
          accountstatus: 'Active',
        }),
        expect.objectContaining({
          accountId: expect.stringMatching(/^A[0-9]{7,8}$/),
          accountstatus: 'Archived',
        }),
      ]),
    );
  });
  it('getAllAccounts', async () => {
    const { data } = await getAllAccounts();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        accountDetails: expect.arrayContaining([
          expect.objectContaining({
            accountId: expect.anything(),
          }),
        ]),
      }),
    );
  });
  it('deleteAccount -- success', async () => {
    const { data } = await deleteAccount(createdAccountId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
      }),
    );
  });
});
