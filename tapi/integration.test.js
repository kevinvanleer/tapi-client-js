const tapi = require('.');
const testData = require('./kyc-test-data.json');

jest.setTimeout(20000);
describe('integration test', () => {
  describe('onboard a new individual', () => {
    let partyId;
    let accountId;
    let linkId;

    const testIdx = 1;
    const testRecord = { ...testData[0], ...testData[testIdx] };
    const user = {
      ...testRecord,
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
      date_of_birth: new Date(`${testRecord.date_of_birth}`),
      email: 'john.smith@tapi-test.io',
    };

    const getPartyInfo = (index) => {
      const tr = { ...testData[0], ...testData[index] };
      return {
        ...tr,
        country_iso_3: 'USA',
        usa_citizenship_status: 'citizen',
        date_of_birth: new Date(`${tr.date_of_birth}`),
        email: 'john.smith@tapi-test.io',
      };
    };

    it('create party', async () => {
      const { data: party } = await tapi.parties.createParty(getPartyInfo(1));
      expect(party).toStrictEqual(expect.objectContaining({
        statusCode: '101',
      }));
      const [, [partyDetails]] = party.partyDetails;
      expect(partyDetails).toStrictEqual(expect.objectContaining({ partyId: expect.stringMatching('P[0-9]*') }));
      partyId = partyDetails.partyId;
    });
    it('perform kyc/aml -- fails', async () => {
      const { data: kyc } = await tapi.kycAml.performKycAml(partyId);
      expect(kyc).toStrictEqual(expect.objectContaining({
        statusCode: '101',
        kyc: expect.objectContaining({
          amlstatus: 'Auto Approved',
          kycstatus: 'Disapproved',
        }),
      }));
    });
    it('update party', async () => {
      const { data: party } = await tapi.parties.updateParty({ ...getPartyInfo(0), partyId });
      expect(party).toStrictEqual(expect.objectContaining({
        statusCode: '101',
      }));
      const [, [partyDetails]] = party.partyDetails;
      expect(partyDetails).toStrictEqual(expect.objectContaining({ partyId: expect.stringMatching('P[0-9]*') }));
      partyId = partyDetails.partyId;
    });
    it('perform kyc/aml - pass', async () => {
      const { data: kyc } = await tapi.kycAml.performKycAml(partyId);
      expect(kyc).toStrictEqual(expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        kyc: expect.objectContaining({
          amlstatus: 'Auto Approved',
          kycstatus: 'Auto Approved',
        }),
      }));
    });
    it('get kyc/aml - pass', async () => {
      const { data: kyc } = await tapi.kycAml.getKycAml(partyId);
      expect(kyc.kycamlDetails).toStrictEqual(expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        kyc: expect.objectContaining({
          amlstatus: 'Auto Approved',
          kycstatus: 'Auto Approved',
        }),
      }));
    });
    it('create account', async () => {
      const { data: account } = await tapi.accounts.createAccount(user);
      expect(account).toStrictEqual(expect.objectContaining({
        statusCode: '101',
      }));
      const { accountDetails } = account;
      expect(accountDetails).toStrictEqual(expect.arrayContaining([
        expect.objectContaining({
          accountId: expect.stringMatching('A[0-9]*'),
        })]));
      accountId = accountDetails[0].accountId;
    });
    it('create link', async () => {
      const { data: link } = await tapi.links.linkAccountOwner(
        accountId,
        partyId,
      );
      expect(link).toStrictEqual(expect.objectContaining({
        statusCode: '101',
      }));
      const [, [linkDetails]] = link.linkDetails;
      expect(linkDetails).toStrictEqual(
        expect.objectContaining({
          id: expect.stringMatching('[0-9]*'),
        }),
      );
      linkId = linkDetails.id;
    });
    it('delete resources', async () => {
      const { data: deleteLink } = await tapi.links.deleteLink(linkId);
      const { data: deleteAccount } = await tapi.accounts.deleteAccount(accountId);
      const { data: deleteParty } = await tapi.parties.deleteParty(partyId);
      expect(deleteLink).toStrictEqual(expect.objectContaining({
        statusCode: '101',
      }));
      expect(deleteAccount).toStrictEqual(expect.objectContaining({
        statusCode: '101',
      }));
      expect(deleteParty).toStrictEqual(expect.objectContaining({
        statusCode: '101',
      }));
    });
  });
});
