const {
  createParty, updateParty, getAllParties, deleteParty,
} = require('.');
const { hasRequiredPartyFields } = require('../../../../utilities/users');

describe('parties', () => {
  let createdPartyId;
  it('createParty', async () => {
    const user = {
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
    expect(hasRequiredPartyFields(user)).toBe(true);
    const { data } = await createParty(user);
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [partyDetails]] = data.partyDetails;
    expect(partyDetails).toStrictEqual(expect.objectContaining({
      partyId: expect.anything(),
      AMLstatus: null,
      KYCstatus: null,
    }));
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
  it('updateParty', async () => {
    const user = {
      partyId: createdPartyId,
      city: 'Best City',
    };
    const { data } = await updateParty(user);
    expect(data).toStrictEqual(expect.objectContaining({
      statusDesc: 'Ok',
      statusCode: '101',
    }));
    const [, [partyDetails]] = data.partyDetails;
    expect(partyDetails).toStrictEqual(expect.objectContaining({
      partyId: createdPartyId,
      AMLstatus: null,
      KYCstatus: null,
    }));
  });

  it('getAllParties', async () => {
    const { data } = await getAllParties();
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      partyDetails: expect.anything(),
    }));
  });
  it('deleteParty -- does not exist', async () => {
    const { data } = await deleteParty('fake-party-id');
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '198',
    }));
  });
  it('deleteParty -- success', async () => {
    const { data } = await deleteParty(createdPartyId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
    }));
  });
});
