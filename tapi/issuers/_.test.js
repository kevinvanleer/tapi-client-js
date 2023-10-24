const {
  createIssuer,
  updateIssuer,
  getAllIssuers,
  getIssuer,
  deleteIssuer,
} = require('.');

describe('issuers', () => {
  const issuer = {
    issuerName: 'Test issuer',
    phoneNumber: '1234567890',
  };
  const validIssuer = {
    ...issuer,
    firstName: 'Firstname',
    lastName: 'Lastname',
    email: 'firstnamelastname@test.com',
  };
  let createdIssuerId;
  it('createIssuer -- invalid', async () => {
    const { data } = await createIssuer(issuer);
    expect(data.statusDesc).not.toEqual('Ok');
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '106',
    }));
  });
  it('createIssuer -- valid', async () => {
    const { data } = await createIssuer(validIssuer);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
      issuerDetails: expect.arrayContaining([
        true,
        expect.arrayContaining([
          expect.objectContaining({
            issuerId: expect.anything(),
            issuerStatus: 'Pending',
          })])]),
    }));
    createdIssuerId = data.issuerDetails[1][0].issuerId;
    expect(createdIssuerId).toMatch(/[0-9]+/);
  });
  it('updateIssuer -- valid', async () => {
    expect(createdIssuerId).toMatch(/[0-9]+/);
    const updatedIssuer = {
      issuerId: createdIssuerId,
      issuerStatus: 'Approved',
      field1: 'open',
    };
    const { data } = await updateIssuer(updatedIssuer);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
      issuerDetails: expect.arrayContaining([
        true,
        expect.arrayContaining([{
          issuerId: expect.anything(),
          issuerStatus: 'Approved',
        }])]),
    }));
  });
  it('getIssuer -- success', async () => {
    const { data } = await getIssuer(createdIssuerId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
      issuerDetails: expect.arrayContaining([
        expect.objectContaining({
          issuerId: createdIssuerId,
          issuerName: validIssuer.issuerName,
        })]),
    }));
  });
  it('deleteIssuer -- success', async () => {
    const { data } = await deleteIssuer(createdIssuerId);
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Issuer deleted successfully!',
    }));
  });
  it('getAllIssuers', async () => {
    const { data } = await getAllIssuers();
    expect(data).toStrictEqual(expect.objectContaining({
      statusCode: '101',
      statusDesc: 'Ok',
      issuerDetails: expect.arrayContaining([
        expect.objectContaining({
          issuerId: expect.anything(),
        })]),
    }));
  });
});
