const { createIssuer, updateIssuer, getAllIssuers, getIssuer, deleteIssuer } = require('.');

jest.setTimeout(120000);

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
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '106',
      }),
    );
  });
  it('createIssuer -- valid', async () => {
    const { data } = await createIssuer(validIssuer);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        issuerDetails: expect.arrayContaining([
          true,
          expect.arrayContaining([
            expect.objectContaining({
              issuerId: expect.anything(),
              issuerStatus: 'Pending',
            }),
          ]),
        ]),
      }),
    );
    createdIssuerId = data.issuerDetails[1][0].issuerId;
    expect(createdIssuerId).toMatch(/[0-9]+/);
  });
  it('updateIssuer -- invalid issuer ID', async () => {
    const { data } = await updateIssuer({
      issuerId: 'invalid-issuer-id',
      issuerStatus: 'Approved',
      field1: 'open',
    });
    expect(data).toStrictEqual({
      statusCode: '136',
      statusDesc: 'Issuer Account does not exist.',
    });
  });
  it('updateIssuer -- arbitrary value', async () => {
    expect(createdIssuerId).toMatch(/[0-9]+/);
    const updatedIssuer = {
      issuerId: createdIssuerId,
      issuerStatus: 'ArbitraryValue',
      field1: 'open',
    };
    const { data } = await updateIssuer(updatedIssuer);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        issuerDetails: expect.arrayContaining([
          true,
          expect.arrayContaining([
            {
              issuerId: createdIssuerId,
              issuerStatus: 'ArbitraryValue',
            },
          ]),
        ]),
      }),
    );
  });
  it('updateIssuer -- approved', async () => {
    expect(createdIssuerId).toMatch(/[0-9]+/);
    const updatedIssuer = {
      issuerId: createdIssuerId,
      issuerStatus: 'Approved',
      field1: 'open',
    };
    const { data } = await updateIssuer(updatedIssuer);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        issuerDetails: expect.arrayContaining([
          true,
          expect.arrayContaining([
            {
              issuerId: createdIssuerId,
              issuerStatus: 'Approved',
            },
          ]),
        ]),
      }),
    );
  });
  it('getIssuer -- no ID', async () => {
    const { data } = await getIssuer();
    expect(data).toStrictEqual({
      'Error(s)': 'issuerId parameter missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getIssuer -- invalid ID nonnumeric', async () => {
    const { data } = await getIssuer('invalid-issuer-id');
    expect(data).toStrictEqual({
      'Error(s)': 'issuerId : u0026nbsp;Numeric values only',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('getIssuer -- invalid ID numeric', async () => {
    const { data } = await getIssuer(123.4123);
    expect(data).toStrictEqual({
      statusCode: '136',
      statusDesc: 'Issuer Account does not exist.',
    });
  });
  it('getIssuer -- success', async () => {
    expect(createdIssuerId).toMatch(/[0-9]+/);
    const { data } = await getIssuer(createdIssuerId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        issuerDetails: expect.arrayContaining([
          expect.objectContaining({
            issuerId: createdIssuerId,
            issuerName: validIssuer.issuerName,
          }),
        ]),
      }),
    );
  });
  it('getAllIssuers', async () => {
    const { data } = await getAllIssuers();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        issuerDetails: expect.arrayContaining([
          expect.objectContaining({
            issuerId: expect.anything(),
          }),
        ]),
      }),
    );
  });
  it('deleteIssuer -- no ID', async () => {
    const { data } = await deleteIssuer();
    expect(data).toStrictEqual({
      'Error(s)': 'issuerId parameter missing',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('deleteIssuer -- invalid ID nonnumeric', async () => {
    const { data } = await deleteIssuer('invalid-issuer-id');
    expect(data).toStrictEqual({
      'Error(s)': 'issuerId : u0026nbsp;Numeric values only',
      statusCode: '106',
      statusDesc: 'Data/parameter missing',
    });
  });
  it('deleteIssuer -- invalid ID numeric', async () => {
    const { data } = await deleteIssuer(123.4123);
    expect(data).toStrictEqual({
      statusCode: '136',
      statusDesc: 'Issuer Account does not exist.',
    });
  });
  it('deleteIssuer -- success', async () => {
    expect(createdIssuerId).toMatch(/[0-9]+/);
    const { data } = await deleteIssuer(createdIssuerId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Issuer deleted successfully!',
      }),
    );
  });
});
