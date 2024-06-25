const uuid = require('uuid');
const { createLink, createAccountLink, linkAccountIndividual, linkAccountOwner, deleteLink, getLink, getAllLinks } = require('.');
const { createAccount } = require('../accounts');
const { createParty } = require('../parties');
const { createEntity } = require('../entities');

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

const getEntityId = async () => {
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
  const [, [entityDetails]] = data.entityDetails;
  return entityDetails.partyId;
};

const getAccountId = async () => {
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
  return accountData.accountDetails[0].accountId;
};

describe('tapi/links', () => {
  let linkId;
  const fakeId = uuid.v4();
  let accountId = '';
  let entityId = '';
  beforeAll(async () => {
    accountId = await getAccountId();
    entityId = await getEntityId();
  });
  it('createLink -- no link type', async () => {
    const response = await createLink('not_account', 'asdf', 'bogus_type', 'some_string');
    expect(response.status).toBe(400);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1400',
        statusDesc: `Bad request: missing parameter 'linkType'`,
      }),
    );
  });
  it('createLink -- first entry not account', async () => {
    const response = await createLink('not_account', 'asdf', 'IndivACParty', 'some_string', 'owner', false);
    expect(response.status).toBe(422);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1422',
        statusDesc: `Invalid request semantics: 'not_account' is not a recognized first entry type`,
      }),
    );
  });
  it('createLink -- account does not exist', async () => {
    const response = await createLink('Account', 'asdf', 'IndivACParty', 'some_string', 'owner', false);
    expect(response.status).toBe(404);
    expect(response.data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1404',
        statusDesc: `Resource not found: first entry asdf of type 'Account' does not exist`,
      }),
    );
  });
  it('createLink -- bogus_type', async () => {
    const response = await createLink('Account', accountId, 'bogus_type', fakeId, 'owner', false);
    expect(response.status).toBe(422);
    expect(response.data).toStrictEqual({
      statusDesc: "Invalid request semantics: 'bogus_type' is not a recognized related entry type",
      statusCode: '1422',
    });
  });
  it('createLink -- fakeId', async () => {
    const { data } = await createLink('Account', accountId, 'IndivACParty', fakeId, 'owner', false);
    expect(data).toStrictEqual({
      statusCode: '1404',
      statusDesc: `Resource not found: related entry ${fakeId} of type 'IndivACParty' does not exist`,
    });
  });
  it('createLink -- bogus link type', async () => {
    // RESPONDS 101
    const { data } = await createLink('Account', accountId, 'IndivACParty', await getPartyId(), 'bogus_link_type', false);
    expect(data).toStrictEqual({
      statusDesc: "Invalid request semantics: 'bogus_link_type' is not a valid link type",
      statusCode: '1422',
    });
  });
  it('createLink -- entity not party', async () => {
    const { data } = await createLink('Account', accountId, 'IndivACParty', entityId, 'owner', false);
    expect(data).toStrictEqual({
      statusCode: '1404',
      statusDesc: `Resource not found: related entry ${entityId} of type 'IndivACParty' does not exist`,
    });
  });
  it('createLink -- party not entity', async () => {
    const partyId = await getPartyId();
    const { data } = await createLink('Account', accountId, 'EntityACParty', partyId, 'owner', false);
    expect(data).toStrictEqual({
      statusCode: '1404',
      statusDesc: `Resource not found: related entry ${partyId} of type 'EntityACParty' does not exist`,
    });
  });
  it('createLink -- party not account', async () => {
    const partyId = await getPartyId();
    const { data } = await createLink('Account', accountId, 'Account', partyId, 'owner', false);
    expect(data).toStrictEqual({
      statusCode: '1404',
      statusDesc: `Resource not found: related entry ${partyId} of type 'Account' does not exist`,
    });
  });
  it('createLink -- success (IndivACParty)', async () => {
    const { data } = await createLink('Account', accountId, 'IndivACParty', global.partyId, 'owner', false);
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
  it('createLink -- success (IndivAcParty)', async () => {
    const { data } = await createLink('Account', accountId, 'IndivAcParty', await getPartyId(), 'owner', false);
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
  });
  it('createLink -- success (indivacparty)', async () => {
    const { data } = await createLink('Account', accountId, 'indivacparty', await getPartyId(), 'owner', false);
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
  });
  it('createLink -- success (INDIVACPARTY/OWNER)', async () => {
    const { data } = await createLink('Account', accountId, 'INDIVACPARTY', await getPartyId(), 'OWNER', false);
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
  });
  it('createLink -- success (EntityAcParty)', async () => {
    const { data } = await createLink('Account', accountId, 'EntityAcParty', await getEntityId(), 'owner', false);
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
  });
  it('createLink -- success (Account to Account)', async () => {
    const { data } = await createLink('Account', accountId, 'Account', await getAccountId(), 'owner', false);
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
  });
  it('createLink -- cannot self link', async () => {
    const { data } = await createLink('account', accountId, 'account', accountId, 'owner', false);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1400',
        statusDesc: 'Bad request: cannot link resource to itself',
      }),
    );
  });
  it('createLink -- success (account to account)', async () => {
    const { data } = await createLink('account', accountId, 'account', await getAccountId(), 'owner', false);
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
  });
  it('createLink -- link exists', async () => {
    const { data } = await createLink('Account', accountId, 'IndivACParty', global.partyId, 'owner', false);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1400',
        statusDesc: 'Bad request: link already exists',
      }),
    );
  });
  it('createAccountLink -- link exists', async () => {
    const { data } = await createAccountLink(accountId, 'IndivACParty', global.partyId, 'owner');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1400',
        statusDesc: 'Bad request: link already exists',
      }),
    );
  });
  it('createAccountLink -- no link type', async () => {
    const { data } = await createAccountLink(accountId, 'bogus_type', uuid.v4());
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1400',
        statusDesc: `Bad request: missing parameter 'linkType'`,
      }),
    );
  });
  it('createAccountLink -- bogus party ID', async () => {
    const bogusId = uuid.v4();
    const { data } = await createAccountLink(accountId, 'IndivACParty', bogusId, 'owner');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1404',
        statusDesc: `Resource not found: related entry ${bogusId} of type 'IndivACParty' does not exist`,
      }),
    );
  });
  it('createAccountLink -- success', async () => {
    const { data } = await createAccountLink(accountId, 'IndivACParty', await getPartyId(), 'owner');
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
        statusCode: '1404',
        statusDesc: `Resource not found: related entry ${fakeId} of type 'IndivACParty' does not exist`,
      }),
    );
  });
  it('linkAccountOwner -- account has primary party', async () => {
    const { data } = await linkAccountOwner(accountId, await getPartyId());
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
      }),
    );
  });
  it('linkAccountOwner -- success', async () => {
    const { data } = await linkAccountOwner(await getAccountId(), await getPartyId());
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
        statusCode: '1400',
        statusDesc: 'Bad request: link already exists',
      }),
    );
  });
  it('linkAccountIndividual -- no such party', async () => {
    const { data } = await linkAccountIndividual(accountId, fakeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1404',
        statusDesc: `Resource not found: related entry ${fakeId} of type 'IndivACParty' does not exist`,
      }),
    );
  });
  it('linkAccountIndividual -- link exists', async () => {
    const { data } = await linkAccountIndividual(accountId, global.partyId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '1400',
        statusDesc: 'Bad request: link already exists',
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
