const { auth, stateNameToAbbr } = require('../util');

const makeIndividualAccount = (user) => Object.fromEntries(Object.entries({
  ...auth,
  type: 'individual',
  accountId: user.accountId,
  accountRegistration: `${user.first_name} ${user.last_name}`,
  domesticYN: user.usa_citizenship_status === 'none' ? 'international_account' : 'domestic_account',
  streetAddress1: user.address1,
  streetAddress2: user.address2,
  city: user.city,
  state: user.state ? stateNameToAbbr(user.state) : null,
  zip: user.zip_code?.toString().padStart(5, '0'),
  country: user.country_iso_3,
  email: user.email,
  phone: user.phone_number,
  taxID: user.social_security_number,
}).filter(([, v]) => v != null));

const filterAccounts = (accounts, query, archived = false) => accounts.accountDetails
  .filter((account) => Object.entries(query)
    .reduce(
      (pass, [k, v]) => pass
      && account[k] === v
      && (parseInt(account.archive_status, 10) === 1) === archived,
      true,
    ));

module.exports = {
  makeIndividualAccount,
  filterAccounts,
};
