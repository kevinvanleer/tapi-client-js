const { issuers } = require('./tapi');

beforeAll(async () => {
  const { data: issuerData } = await issuers.createIssuer({
    issuerName: 'Test issuer',
    phoneNumber: '1234567890',
    firstName: 'Firstname',
    lastName: 'Lastname',
    email: 'firstnamelastname@test.com',
  });
  if (issuerData.statusCode !== '101') throw issuerData;
  const [, [issuerDetails]] = issuerData.issuerDetails;
  global.issuerId = issuerDetails.issuerId;
  await issuers.updateIssuer({
    issuerId: issuerDetails.issuerId,
    issuerStatus: 'Approved',
  });
});

afterAll(async () => {
  await issuers.deleteIssuer(global.issuerId);
});
