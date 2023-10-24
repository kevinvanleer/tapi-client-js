const { tapi, auth } = require('../util');

const createLink = (
  firstEntryType,
  firstEntry,
  relatedEntryType,
  relatedEntry,
  linkType,
  primary,
) => tapi.put(
  '/createLink',
  new URLSearchParams({
    ...auth,
    firstEntryType,
    firstEntry,
    relatedEntryType,
    relatedEntry,
    linkType,
    primary_value: primary ? 1 : 0,
  }),
);

const createAccountLink = (
  accountId,
  linkedObjectType,
  linkedObjectId,
  linkType,
  primary,
) => createLink('Account', accountId, linkedObjectType, linkedObjectId, linkType, primary);

const linkAccountIndividual = (accountId, partyId, linkType = 'member', primary = false) => createAccountLink(accountId, 'IndivACParty', partyId, linkType, primary);
const linkAccountOwner = (accountId, partyId) => createAccountLink(accountId, 'IndivACParty', partyId, 'owner', true);

const getAllLinks = (accountId) => tapi.post('/getAllLinks', new URLSearchParams({ ...auth, accountId }));
const deleteLink = (id) => tapi.post('/deleteLink', new URLSearchParams({ ...auth, id }));

module.exports = {
  createLink,
  createAccountLink,
  linkAccountIndividual,
  linkAccountOwner,
  getAllLinks,
  deleteLink,
};
