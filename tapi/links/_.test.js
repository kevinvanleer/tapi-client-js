const uuid = require('uuid');
const { createLink, createAccountLink, linkAccountIndividual, linkAccountOwner, deleteLink, getLink, getAllLinks } = require('.');
const { createAccount } = require('../accounts');
const { createParty } = require('../parties');

jest.setTimeout(20000);

const getPartyId = async () => {
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

  const { data: partyData } = await createParty(user);
  const [, [partyDetails]] = partyData.partyDetails;
  return partyDetails.partyId;
};

describe('tapi/links', () => {
  let linkId;
  const fakeId = uuid.v4();
  let accountId = '';
  beforeAll(async () => {
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
    const { data: accountData } = await createAccount(user);
    accountId = accountData.accountDetails[0].accountId;
  });
  it('createLink -- first entry not account', async () => {
    const response = await createLink('not_account', 'asdf', 'bogus_type', 'some_string', 'a', false);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '199',
      }),
    );
  });
  it('createLink -- account does not exist', async () => {
    const { data } = await createLink('Account', 'asdf', 'bogus_type', 'some_string', 'a', false);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '199',
      }),
    );
  });
  it('createLink -- success', async () => {
    const { data } = await createLink('Account', accountId, 'bogus_type', fakeId, 'a', false);
    expect(data).toStrictEqual({
      statusDesc: 'Ok',
      statusCode: '101',
      linkDetails: [
        true,
        [
          {
            id: expect.stringMatching(/^[0-9]{6,8}$/),
          },
        ],
      ],
    });
    [, [{ id: linkId }]] = data.linkDetails;
  });
  it('createLink -- link exists', async () => {
    const { data } = await createLink('Account', accountId, 'bogus_type', fakeId, 'a', false);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '206',
      }),
    );
  });
  it('createAccountLink -- link exists', async () => {
    const { data } = await createAccountLink(accountId, 'bogus_type', fakeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '206',
      }),
    );
  });
  it('createAccountLink -- no link type', async () => {
    expect.assertions(1);
    try {
      // NOTE: THIS REQUEST DOES NOT RESULT IN 500 IN PRODUCTION
      // THE NO LINK TYPE ERROR FAILS AND RETURNS 200
      const { data } = await createAccountLink(accountId, 'bogus_type', uuid.v4());
      expect(data).toStrictEqual(
        expect.objectContaining({
          statusCode: '101',
        }),
      );
    } catch (e) {
      // eslint-disable-next-line
      expect(e.response.status).toEqual(500);
    }
  });
  it('createAccountLink -- success', async () => {
    const { data } = await createAccountLink(accountId, 'bogus_type', uuid.v4(), 'owner');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
      }),
    );
  });
  it('linkAccountOwner -- no such party', async () => {
    const { data } = await linkAccountOwner(accountId, fakeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '203',
      }),
    );
  });
  it('linkAccountOwner -- success', async () => {
    const { data } = await linkAccountOwner(accountId, global.partyId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
      }),
    );
  });
  it('linkAccountOwner -- link exists', async () => {
    const { data } = await linkAccountOwner(accountId, global.partyId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '206',
      }),
    );
  });
  it('linkAccountIndividual -- no such party', async () => {
    const { data } = await linkAccountIndividual(accountId, fakeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '203',
      }),
    );
  });
  it('linkAccountIndividual -- link exists', async () => {
    const { data } = await linkAccountIndividual(accountId, global.partyId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '206',
      }),
    );
  });
  it('linkAccountIndividual -- success', async () => {
    const { data } = await linkAccountIndividual(accountId, await getPartyId());
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
      }),
    );
  });
  it('getAllLinks -- no account', async () => {
    const { data } = await getAllLinks();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '106',
      }),
    );
  });
  it('getAllLinks -- account does not exist', async () => {
    const { data } = await getAllLinks(fakeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '148',
      }),
    );
  });
  it('getLink -- invalid ID', async () => {
    const { data } = await getLink('invalid-link-id');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '106',
      }),
    );
  });
  it('getLink -- does not exist', async () => {
    const { data } = await getLink(linkId + 1);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '404',
      }),
    );
  });
  it('getLink -- success', async () => {
    const { data } = await getLink(linkId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        linkDetails: expect.anything(),
      }),
    );
  });
  it('getAllLinks -- success', async () => {
    const { data } = await getAllLinks(accountId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        linkDetails: expect.anything(),
      }),
    );
  });
  it('deleteLink -- null id', async () => {
    const { data } = await deleteLink();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '106',
      }),
    );
  });
  it('deleteLink -- invalid id', async () => {
    const { data } = await deleteLink(fakeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '106',
      }),
    );
  });
  it('deleteLink -- does not exist', async () => {
    const { data } = await deleteLink(linkId + 1);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '404',
      }),
    );
  });
  it('deleteLink -- success', async () => {
    const { data } = await deleteLink(linkId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
      }),
    );
  });
});
