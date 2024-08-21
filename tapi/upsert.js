/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

const { createParty, updateParty } = require('./parties');
const { createAccount, updateAccount } = require('./accounts');
const { linkAccountOwner } = require('./links');
const { hasRequiredPartyFields } = require('./parties/util');

const createTapiResources = async (user, db) => {
  const { data: party } = await createParty(user);
  if (party.statusCode !== '101') {
    console.error('TAPI party creation failed');
    console.error(JSON.stringify(party, null, 2));
    return;
  }
  const [, [partyDetails]] = party.partyDetails;

  const { data: account } = await createAccount(user);
  if (account.statusCode !== '101') {
    console.error('TAPI account creation failed');
    console.error(JSON.stringify(account.accountDetails, null, 2));
    return;
  }

  const { data: link } = await linkAccountOwner(account.accountDetails[0].accountId, partyDetails.partyId);
  if (link.statusCode !== '101') {
    console.error('TAPI account/party link failed');
    console.error({
      accountId: account.accountDetails[0].accountId,
      partyId: partyDetails.partyId,
    });
    console.error(JSON.stringify(link, null, 2));
    return;
  }

  const [, [linkDetails]] = link.linkDetails;
  await db('nc_tapi_resources').insert([
    {
      creator: user.id,
      resource_type: 'individual_party',
      resource_id: partyDetails.partyId,
    },
    {
      creator: user.id,
      resource_type: 'account',
      resource_id: account.accountDetails[0].accountId,
    },
    {
      creator: user.id,
      resource_type: 'link',
      resource_id: linkDetails.id,
    },
  ]);
};

const upsertTapiResources = async (user, db) => {
  if (hasRequiredPartyFields(user)) {
    const parties = await db
      .select(['resource_type', 'resource_id'])
      .from('nc_tapi_resources')
      .where({ creator: user.id, resource_type: 'individual_party' });
    const accounts = await db
      .select(['resource_type', 'resource_id'])
      .from('nc_tapi_resources')
      .where({ creator: user.id, resource_type: 'account' });
    if (parties.length === 0) {
      try {
        await createTapiResources(user, db);
      } catch (e) {
        console.error('TAPI resource creation failed');
        console.error(e);
      }
    } else {
      try {
        if (parties.length === 1) {
          const { data: result } = await updateParty({ ...user, partyId: parties[0].resource_id });
          if (result.statusCode === '101') {
            await db('nc_tapi_resources')
              .update({
                updated_at: db.fn.now(),
              })
              .where({ resource_id: parties[0].resource_id });
          } else {
            throw new Error(`Failed to update party: ${result.statusDesc}`);
          }
        } else {
          // TODO: something
        }
        if (accounts.length === 1) {
          const { data: result } = await updateAccount({
            ...user,
            accountId: accounts[0].resource_id,
          });
          if (result.statusCode === '101') {
            await db('nc_tapi_resources')
              .update({
                updated_at: db.fn.now(),
              })
              .where({ resource_id: accounts[0].resource_id });
          } else {
            throw new Error(`Failed to update account: ${result.statusDesc}`);
          }
        } else {
          // TODO: something
        }
      } catch (e) {
        console.error('Failed to update TAPI resources');
        console.error(e);
      }
    }
  } else {
    console.warn('Could not create tapi resources. Required fields are not avaiable.');
  }
};

module.exports = {
  createTapiResources,
  upsertTapiResources,
};
