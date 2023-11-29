const { put, post } = require('../util');

const createLink = (firstEntryType, firstEntry, relatedEntryType, relatedEntry, linkType, primary) =>
  put('/createLink', {
    firstEntryType,
    firstEntry,
    relatedEntryType,
    relatedEntry,
    linkType,
    primary_value: primary ? 1 : 0,
  });

const createAccountLink = (accountId, linkedObjectType, linkedObjectId, linkType, primary) =>
  createLink('Account', accountId, linkedObjectType, linkedObjectId, linkType, primary);

const linkAccountIndividual = (accountId, partyId, linkType = 'member', primary = false) =>
  createAccountLink(accountId, 'IndivACParty', partyId, linkType, primary);
const linkAccountOwner = (accountId, partyId) => createAccountLink(accountId, 'IndivACParty', partyId, 'owner', true);

const getAllLinks = (accountId) => post('/getAllLinks', { accountId });
const deleteLink = (id) => post('/deleteLink', { id });

module.exports = {
  createLink,
  createAccountLink,
  linkAccountIndividual,
  linkAccountOwner,
  getAllLinks,
  deleteLink,
};
