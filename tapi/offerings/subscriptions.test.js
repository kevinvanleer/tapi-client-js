const { offerings, accounts, links, trades } = require('..');
const {
  addSubscriptions,
  updateSubscriptions,
  getSubscriptions,
  sendSubscriptionDocument,
  sendSubscriptionDocumentClient,
  resendSubscriptionDocuments,
  fetchSubscriptionDocuments,
} = require('.');

jest.setTimeout(60000);

/* NOTE
 *
 * These tests rely on configuration outside the test environment. The client used to execute the tests must be linked to Docusign.
 * The linked docusign account must have templates defined in templates object
 *
 *   TODO: This test suite needs access to a client account that is not linked to docusign.
 */
describe('offerings/subscriptions', () => {
  let offeringId;
  let accountId;
  let tradeId;
  const host = process.env.TAPI_HOST.replace('http://', 'https://');
  const templates = [
    {
      id: process.env.TEMPLATE_0_ID,
      name: process.env.TEMPLATE_0_NAME,
    },
    {
      id: process.env.TEMPLATE_1_ID,
      name: process.env.TEMPLATE_1_NAME,
    },
    {
      id: process.env.TEMPLATE_2_ID,
      name: process.env.TEMPLATE_2_NAME,
    },
  ];
  const templateId = templates[0].id;
  const templateName = templates[0].name;

  const getTemplateIdName = ({ id, name }) => `${id}--${name}`;

  beforeAll(async () => {
    const { data: offering } = await offerings.createOffering({
      issuerId: global.issuerId,
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
    const { data: account } = await accounts.createAccount({
      email: 'testuser@test.com',
      first_name: 'Test',
      last_name: 'User',
      address1: '123 Main St',
      city: 'Test City',
      state: 'Alabama',
      zip_code: 500,
      date_of_birth: new Date(1970, 0, 1),
      country_iso_3: 'USA',
      usa_citizenship_status: 'citizen',
    });
    if (account.statusCode !== '101') throw account;
    accountId = account.accountDetails[0].accountId;
    await links.linkAccountOwner(accountId, global.partyId);
    const { data } = await trades.createTrade({
      transactionType: 'WIRE',
      transactionUnits: '1',
      offeringId,
      accountId,
    });
    tradeId = data.purchaseDetails[1][0].tradeId;
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
  it.skip('addSubscriptions (addSubscriptionsForOffering) -- template does not exist', async () => {
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
    expect(data.document_details[0].templateNameID.toString()).toStrictEqual(expect.stringMatching(/^[0-9]+$/));
  });
  it('addSubscriptions (addSubscriptionsForOffering)', async () => {
    const { data } = await addSubscriptions(offeringId, `${templateId}--${templateName}`);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          offeringId,
          templateName,
          templateNameID: expect.any(Number),
        },
      ],
    });
    expect(data.document_details[0].templateNameID.toString()).toStrictEqual(expect.stringMatching(/^[0-9]+$/));
  });
  it('sendSubscriptionDocument (sendSubscriptionDocument)', async () => {
    const { data } = await sendSubscriptionDocument(offeringId, accountId, tradeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
      }),
    );
  });
  it('sendSubscriptionDocumentClient (sendSubscriptionDocumentClient)', async () => {
    const { data } = await sendSubscriptionDocumentClient(offeringId, accountId, tradeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
      }),
    );
  });
  it('resendSubscriptionDocuments (resendSubscriptionDocuments)', async () => {
    const { data } = await resendSubscriptionDocuments(offeringId, accountId, tradeId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
      }),
    );
  });
  it('fetchSubscriptionDocuments', async () => {
    const { data } = await fetchSubscriptionDocuments();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
      }),
    );
  });
  it.skip('updateSubscriptions (updateSubscriptionsForOffering)', async () => {
    const { data } = await updateSubscriptions(offeringId, templateId, getTemplateIdName(templates[0]));
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          offeringId,
          templateName,
          templateNameID: expect.any(Number),
        },
      ],
    });
    expect(data.document_details[0].templateNameID.toString()).toStrictEqual(expect.stringMatching(/^[0-9]+$/));
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
          templateId: expect.stringMatching(/^[0-9]+$/),
          templateKey: templateId,
          templateName,
          templateUrl: expect.stringMatching(new RegExp(`^${host}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`)),
        },
      ],
    });
  });
  it('getSubscriptions (getSubscriptionsForOffering) -- three items', async () => {
    const { data: doc1 } = await addSubscriptions(offeringId, getTemplateIdName(templates[1]));
    const { data: doc2 } = await addSubscriptions(offeringId, getTemplateIdName(templates[2]));
    const { data } = await getSubscriptions(offeringId);
    expect(data).toStrictEqual({
      statusCode: '101',
      statusDesc: 'Ok',
      document_details: [
        {
          createdDate: expect.any(String),
          offeringId,
          templateId: doc2.document_details[0].templateNameID.toString(),
          templateKey: templates[2].id,
          templateName: templates[2].name,
          templateUrl: expect.stringMatching(new RegExp(`^${host}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`)),
        },
        {
          createdDate: expect.any(String),
          offeringId,
          templateId: doc1.document_details[0].templateNameID.toString(),
          templateKey: templates[1].id,
          templateName: templates[1].name,
          templateUrl: expect.stringMatching(new RegExp(`^${host}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`)),
        },
        {
          createdDate: expect.any(String),
          offeringId,
          templateId: expect.stringMatching(/^[0-9]+$/),
          templateKey: templates[0].id,
          templateName: templates[0].name,
          templateUrl: expect.stringMatching(new RegExp(`^${host}/admin_v3/Upload_documentation/uploadDocument/[a-zA-Z0-9=]*$`)),
        },
      ],
    });
  });
});
