const { createAccount, updateAccount, getAccount, getAllAccounts, deleteAccount } = require('.');

describe('accounts', () => {
  let createdAccountId;
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
        accountDetails: expect.arrayContaining([expect.objectContaining({ accountId: expect.anything() })]),
      }),
    );
    createdAccountId = data.accountDetails[0].accountId;
    expect(createdAccountId.startsWith('A')).toBe(true);
  });
  it('getAccount -- invalid ID', async () => {
    const { data } = await getAccount('invalid-account-id');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '106',
      }),
    );
  });
  it('getAccount -- does not exist', async () => {
    const { data } = await getAccount('A0000000');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '404',
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
