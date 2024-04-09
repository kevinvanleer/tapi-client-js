const { offerings } = require('..');
const { addSubscriptions, getSubscriptions } = require('.');

jest.setTimeout(10000);

/* NOTE
 *
 * These tests rely on configuration outside the test environment. The client used to execute the tests must be linked to Docusign.
 * The linked docusign account must have templates:
 * - tapi-sandbox-test-subscription-0
 * - tapi-sandbox-test-subscription-1
 * - tapi-sandbox-test-subscription-2
 *
 *   TODO: This test suite needs access to a client account that is not linked to docusign.
 */
describe('offerings/subscriptions', () => {
  let offeringId;

  beforeAll(async () => {
    const { data: offering } = await offerings.createOffering({
      issuerId: process.env.TAPI_TEST_ISSUER_ID,
      issueName: 'Test issue',
      issueType: 'Equity',
      minAmount: '1',
      targetAmount: '5',
      maxAmount: '10',
      remainingShares: '10',
      unitPrice: '1',
      startDate: '01-01-1970',
      endDate: '01-01-1970',
      offeringText: 'n/a',
      stampingText: 'n/a',
    });
    if (offering.statusCode !== '101') throw offering;
    offeringId = offering.offeringDetails[1][0].offeringId;
  });

  afterAll(async () => {
    if (offeringId) await offerings.deleteOffering(offeringId);
  });

  it('getSubscriptions (getSubscriptionsForOffering) -- no offering ID', async () => {
    const { data } = await getSubscriptions();
    expect(data).toStrictEqual({
      'Error(s)': '<br />offeringIdu0026nbsp;u0026nbsp; : Missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getSubscriptions (getSubscriptionsForOffering) -- invalid non-numeric offering ID', async () => {
    const { data } = await getSubscriptions('invalid-offering-id');
    expect(data).toStrictEqual({
      statusCode: '404',
      document_details: 'Template details does not exist.',
      statusDesc: 'Error(s)',
    });
  });
  it('getSubscriptions (getSubscriptionsForOffering) -- invalid numeric offering ID', async () => {
    const { data } = await getSubscriptions(123.123);
    expect(data).toStrictEqual({
      statusCode: '404',
      document_details: 'Template details does not exist.',
      statusDesc: 'Error(s)',
    });
  });
  it('getSubscriptions (getSubscriptionsForOffering) -- empty list', async () => {
    const { data } = await getSubscriptions(offeringId);
    expect(data).toStrictEqual({
      statusCode: '404',
      document_details: 'Template details does not exist.',
      statusDesc: 'Error(s)',
    });
  });
  it('addSubscriptions (addSubscriptionsForOffering) -- template does not exist', async () => {
    const { data } = await addSubscriptions(offeringId, 'tapi-sandbox-test-subscription-does-not-exist');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          offeringId,
          templateName: null,
          templateNameID: expect.any(Number),
        },
      ],
    });
    expect(data.document_details[0].templateNameID.toString()).toStrictEqual(expect.stringMatching(/^[0-9]{6}$/));
  });
  it('addSubscriptions (addSubscriptionsForOffering)', async () => {
    const { data } = await addSubscriptions(offeringId, 'tapi-sandbox-test-subscription-0');
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          offeringId,
          templateName: null,
          templateNameID: expect.any(Number),
        },
      ],
    });
    expect(data.document_details[0].templateNameID.toString()).toStrictEqual(expect.stringMatching(/^[0-9]{6}$/));
  });
  it('getSubscriptions (getSubscriptionsForOffering) -- one item', async () => {
    const { data } = await getSubscriptions(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          createdDate: expect.any(String),
          offeringId,
          templateId: expect.stringMatching(/^[0-9]{6}$/),
          templateKey: 'tapi-sandbox-test-subscription-0',
          templateName: null,
          templateUrl: expect.stringMatching(
            /^https:\/\/api-sandboxdash.norcapsecurities.com\/tapiv3\/uploads\/tapi-sandbox-test-subscription-0[_a-zA-Z0-9]*.pdf$/,
          ),
        },
      ],
    });
  });
  it('getSubscriptions (getSubscriptionsForOffering) -- three items', async () => {
    const { data: doc1 } = await addSubscriptions(offeringId, 'tapi-sandbox-test-subscription-1');
    const { data: doc2 } = await addSubscriptions(offeringId, 'tapi-sandbox-test-subscription-2');
    const { data } = await getSubscriptions(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          createdDate: expect.any(String),
          offeringId,
          templateId: doc2.document_details[0].templateNameID.toString(),
          templateKey: 'tapi-sandbox-test-subscription-2',
          templateName: null,
          templateUrl: expect.stringMatching(
            /^https:\/\/api-sandboxdash.norcapsecurities.com\/tapiv3\/uploads\/tapi-sandbox-test-subscription-2[_a-zA-Z0-9]*.pdf$/,
          ),
        },
        {
          createdDate: expect.any(String),
          offeringId,
          templateId: doc1.document_details[0].templateNameID.toString(),
          templateKey: 'tapi-sandbox-test-subscription-1',
          templateName: null,
          templateUrl: expect.stringMatching(
            /^https:\/\/api-sandboxdash.norcapsecurities.com\/tapiv3\/uploads\/tapi-sandbox-test-subscription-1[_a-zA-Z0-9]*.pdf$/,
          ),
        },
        {
          createdDate: expect.any(String),
          offeringId,
          templateId: expect.stringMatching(/^[0-9]{6}$/),
          templateKey: 'tapi-sandbox-test-subscription-0',
          templateName: null,
          templateUrl: expect.stringMatching(
            /^https:\/\/api-sandboxdash.norcapsecurities.com\/tapiv3\/uploads\/tapi-sandbox-test-subscription-0[_a-zA-Z0-9]*.pdf$/,
          ),
        },
      ],
    });
  });
});
