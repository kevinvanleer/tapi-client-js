const { parties } = require('./tapi');

beforeAll(async () => {
  const { data: partyData } = await parties.createParty({
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
  if (partyData.statusCode !== '101') throw partyData;
  const [, [partyDetails]] = partyData.partyDetails;
  global.partyId = partyDetails.partyId;
});

afterAll(() => {
  parties.deleteParty(global.partyId);
});
