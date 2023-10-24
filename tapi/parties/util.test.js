const { userToParty } = require('./util');
const { auth } = require('../util');

describe('parties/util', () => {
  it('userToParty', () => {
    expect(userToParty({
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
    })).toStrictEqual({
      ...auth,
      dob: '01-01-1970',
      domicile: 'U.S. citizen',
      emailAddress: 'testuser@test.com',
      firstName: 'Test',
      lastName: 'User',
      primAddress1: '123 Main St',
      primCity: 'Test City',
      primCountry: 'USA',
      primState: 'AL',
      primZip: '00500',
    });

    expect(userToParty({
      email: 'testuser@test.com',
      first_name: 'Test',
      last_name: 'User',
      address1: '123 Main St',
      address2: undefined,
      social_security_number: null,
      city: 'Test City',
      state: 'Alabama',
      zip_code: 500,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
    })).toStrictEqual({
      ...auth,
      dob: '01-01-1970',
      domicile: 'U.S. citizen',
      emailAddress: 'testuser@test.com',
      firstName: 'Test',
      lastName: 'User',
      primAddress1: '123 Main St',
      primCity: 'Test City',
      primCountry: 'USA',
      primState: 'AL',
      primZip: '00500',
    });

    expect(userToParty({
    })).toStrictEqual(auth);
  });
});
