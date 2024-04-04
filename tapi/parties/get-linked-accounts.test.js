const uuid = require('uuid');
const { createLink, createAccountLink, linkAccountIndividual, linkAccountOwner, deleteLink, getLink } = require('../links');
const { createAccount, deleteAccount } = require('../accounts');
const { createParty, deleteParty, getLinkedAccounts } = require('.');

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

describe('tapi/parties/get-linked-accounts', () => {
  let linkId;
  const fakeId = uuid.v4();
  let accountId;
  let partyId;
  beforeAll(async () => {
    accountId = await getAccountId();
    partyId = await getPartyId();
    const { data } = await linkAccountOwner(accountId, partyId);
    [, [{ id: linkId }]] = data.linkDetails;
  });
  afterAll(async () => {
    await deleteAccount(accountId);
    await deleteParty(partyId);
  });
  it('getLinkedAccounts -- no party ID', async () => {
    const { data } = await getLinkedAccounts();
    expect(data).toStrictEqual({
      'Error(s)': 'partyId&nbsp;&nbsp; : Missing',
      statusDesc: 'Data/parameter missing',
      statusCode: '106',
    });
  });
  it('getLinkedAccounts -- invalid party ID', async () => {
    const { data } = await getLinkedAccounts(fakeId);
    expect(data).toStrictEqual({
      statusCode: '198',
      statusDesc: 'Party Account does not exist.',
    });
  });
  it('getLinkedAccounts -- no links', async () => {
    const { data } = await getLinkedAccounts(global.partyId);
    expect(data).toStrictEqual({
      statusDesc: "Couldn't find any Link!",
      statusCode: '404',
    });
  });
  it('getLinkedAccounts -- success', async () => {
    const { data } = await getLinkedAccounts(partyId);
    expect(data).toStrictEqual({
      statusDesc: 'Ok',
      statusCode: '101',
      linkDetails: [
        {
          firstEntry: accountId,
          firstEntryType: 'Account',
          id: linkId,
          linkType: 'owner',
          notes: null,
          relatedEntry: partyId,
          relatedEntryType: 'IndivACParty',
        },
      ],
    });
  });
});
