const uuid = require('uuid');
const {
  createLink, createAccountLink,
  linkAccountIndividual, linkAccountOwner,
  deleteLink,
  getAllLinks,
} = require('.');

describe('tapi/links', () => {
  let linkId;
  const fakeId = uuid.v4();
  const accountId = 'A1695748';
  const partyId = 'P1612869';
  it('createLink -- first entry not account', async () => {
    const response = await createLink('not_account', 'asdf', 'bogus_type', 'some_string', 'a', false);
    expect(response.data).toStrictEqual(expect.objectContaining({
      statusCode: '199',
    }));
  });
  it('createLink -- account does not exist', async () => {
    const { data } = await createLink('Account', 'asdf', 'bogus_type', 'some_string', 'a', false);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '199',
    }));
  });
  it('createLink -- success', async () => {
    const { data } = await createLink('Account', accountId, 'bogus_type', fakeId, 'a', false);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
    }));
    const [, [linkDetails]] = data.linkDetails;
    linkId = linkDetails.id;
  });
  it('createLink -- link exists', async () => {
    const { data } = await createLink('Account', accountId, 'bogus_type', fakeId, 'a', false);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '206',
    }));
  });
  it('createAccountLink -- link exists', async () => {
    const { data } = await createAccountLink(accountId, 'bogus_type', fakeId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '206',
    }));
  });
  it('createAccountLink -- success', async () => {
    const { data } = await createAccountLink(accountId, 'bogus_type', uuid.v4());
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
    }));
  });
  it('linkAccountIndividual -- no such party', async () => {
    const { data } = await linkAccountIndividual(accountId, fakeId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '203',
    }));
  });
  it('linkAccountIndividual -- link exists', async () => {
    const { data } = await linkAccountIndividual(accountId, partyId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '206',
    }));
  });
  it('linkAccountOwner -- no such party', async () => {
    const { data } = await linkAccountOwner(accountId, fakeId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '203',
    }));
  });
  it('linkAccountOwner -- link exists', async () => {
    const { data } = await linkAccountOwner(accountId, partyId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '206',
    }));
  });
  it('getAllLinks -- no account', async () => {
    const { data } = await getAllLinks();
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '148',
    }));
  });
  it('getAllLinks -- account does not exist', async () => {
    const { data } = await getAllLinks(fakeId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '148',
    }));
  });
  it('getAllLinks -- success', async () => {
    const { data } = await getAllLinks(accountId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      linkDetails: expect.anything(),
    }));
  });
  it('deleteLink -- null id', async () => {
    const { data } = await deleteLink();
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '106',
    }));
  });
  it('deleteLink -- invalid id', async () => {
    const { data } = await deleteLink(fakeId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '106',
    }));
  });
  it('deleteLink -- does not exist', async () => {
    const { data } = await deleteLink(1);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '404',
    }));
  });
  it('deleteLink -- success', async () => {
    const { data } = await deleteLink(linkId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
    }));
  });
});
