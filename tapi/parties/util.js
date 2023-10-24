const { auth, getFormattedDate, stateNameToAbbr } = require('../util');

const citizenshipStatusToDomicile = (status) => {
  switch (status) {
    case 'citizen':
      return 'U.S. citizen';
    case 'resident':
      return 'U.S. resident';
    default:
      return 'non-resident';
  }
};

const userToParty = (user) => Object.fromEntries(Object.entries({
  ...auth,
  partyId: user.partyId,
  domicile: user.usa_citizenship_status
    ? citizenshipStatusToDomicile(user.usa_citizenship_status) : null,
  firstName: user.first_name,
  lastName: user.last_name,
  socialSecurityNumber: user.social_security_number,
  dob: user.date_of_birth ? getFormattedDate(user.date_of_birth) : null,
  primAddress1: user.address1,
  primAddress2: user.address2,
  primCity: user.city,
  primState: user.state ? stateNameToAbbr(user.state) : null,
  primZip: user.zip_code?.toString().padStart(5, '0'),
  primCountry: user.country_iso_3,
  emailAddress: user.email,
  phone: user.phone_number,
  occupation: user.occupation,
  associatedPerson: user.broker_dealer_association,
  currentAnnIncome: user.current_income ? user.current_income / 100 : null,
  avgAnnIncome: user.current_income && user.prior_income
    ? (user.current_income + user.prior_income) / 200 : null,
  currentHouseholdIncome: user.household_income ? user.household_income / 100 : null,
  avgHouseholdIncome: user.household_current_income && user.household_prior_income
    ? (user.household_current_income + user.household_prior_income) / 200 : null,
  householdNetworth: user.household_net_worth ? user.household_net_worth / 100 : null,
}).filter(([, v]) => v != null));

const filterParties = (parties, query, archived = false) => parties.partyDetails
  .filter((party) => Object.entries(query)
    .reduce(
      (pass, [k, v]) => pass
      && party[k] === v
      && (party.partystatus.toLowerCase() === 'archived') === archived,
      true,
    ));

module.exports = {
  userToParty,
  filterParties,
};
