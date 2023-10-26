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
  {
    ...auth,
    firstEntryType,
    firstEntry,
    relatedEntryType,
    relatedEntry,
    linkType,
    primary_value: primary ? 1 : 0,
  },
);

const createAccountLink = (
  accountId,
  linkedObjectType,
  linkedObjectId,
  linkType,
  primary,
) => createLink(
  'Account',
  accountId,
  linkedObjectType,
  linkedObjectId,
  linkType,
  primary,
);

const linkAccountIndividual = (accountId, partyId, linkType = 'member', primary = false) => createAccountLink(accountId, 'IndivACParty', partyId, linkType, primary);
const linkAccountOwner = (accountId, partyId) => createAccountLink(accountId, 'IndivACParty', partyId, 'owner', true);

const getAllLinks = (accountId) => tapi.post('/getAllLinks', { ...auth, accountId });
const deleteLink = (id) => tapi.post('/deleteLink', { ...auth, id });

module.exports = {
  createLink,
  createAccountLink,
  linkAccountIndividual,
  linkAccountOwner,
  getAllLinks,
  deleteLink,
};
