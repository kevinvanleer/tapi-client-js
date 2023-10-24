const {
  createAccount, updateAccount, getAllAccounts, deleteAccount,
} = require('.');

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
    const { data } = await (createAccount(user));
    expect(data.statusDesc).not.toEqual('Ok');
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '106',
    }));
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
      usa_citizenship_status: 'citizen',
    };
    const { data } = await (createAccount(user));
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
    }));
    createdAccountId = data.accountDetails[0].accountId;
    expect(createdAccountId.startsWith('A')).toBe(true);
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
    const { data } = await (updateAccount(user));
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
    }));
  });
  it('getAllAccounts', async () => {
    const { data } = await getAllAccounts();
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
      accountDetails: expect.arrayContaining([
        expect.objectContaining({
          accountId: expect.anything(),
        })]),
    }));
  });
  it('deleteAccount -- success', async () => {
    const { data } = await deleteAccount(createdAccountId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
    }));
  });
});
