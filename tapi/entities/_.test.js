const { createEntity, updateEntity, getEntity, deleteEntity } = require('.');

jest.setTimeout(20000);

describe('entities', () => {
  let createdEntityId;
  it('createEntity', async () => {
    const entity = {
      domicile: 'U.S. citizen',
      entityName: 'Entity Name',
      entityType: 'revocable trust',
      entityDesc: 'Entity Description',
      ein: '152152',
      primCountry: 'USA',
      primAddress1: 'PEACHTREE PLACE',
      primAddress2: 'PEACHTREE PLACE',
      primCity: 'Atlanta',
      primState: 'GA',
      primZip: '30318',
      emailAddress: 'johnsmith@gmail.com',
      emailAddress2: 'johnsmith@norcapsecurities.com',
      phone: '1234567890',
      phone2: '2147483647',
      totalAssets: '3',
      ownersAI: 'no',
      KYCstatus: 'Pending',
      AMLstatus: 'Pending',
      AMLdate: '02-15-2016',
      tags: 'Tags',
      notes: 'Notes Added',
    };
    const { data } = await createEntity(entity);
    expect(data.statusDesc).toEqual('Ok');
    expect(data.statusCode).toEqual('101');
    const [, [entityDetails]] = data.entityDetails;
    expect(entityDetails).toStrictEqual(
      expect.objectContaining({
        partyId: expect.stringMatching(/^E[0-9]{8}$/),
      }),
    );
    createdEntityId = entityDetails.partyId;
  });
  it('createEntity -- missing required field (zip)', async () => {
    const entity = {
      domicile: 'U.S. citizen',
      entityName: 'Entity Name',
      entityType: 'revocable trust',
      entityDesc: 'Entity Description',
      ein: '152152',
      primCountry: 'USA',
      primAddress1: 'PEACHTREE PLACE',
      primAddress2: 'PEACHTREE PLACE',
      primCity: 'Atlanta',
      primState: 'GA',
      emailAddress: 'johnsmith@gmail.com',
      emailAddress2: 'johnsmith@norcapsecurities.com',
      phone: '1234567890',
      phone2: '2147483647',
      totalAssets: '3',
      ownersAI: 'no',
      KYCstatus: 'Pending',
      AMLstatus: 'Pending',
      AMLdate: '02-15-2016',
      tags: 'Tags',
      notes: 'Notes Added',
    };
    const { data } = await createEntity(entity);
    expect(data.statusCode).toEqual('106');
  });
  it('updateEntity', async () => {
    const user = {
      partyId: createdEntityId,
      primCity: 'Best City',
    };
    const { data } = await updateEntity(user);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusDesc: 'Ok',
        statusCode: '101',
      }),
    );
    const [, [entityDetails]] = data.entityDetails;
    expect(entityDetails).toStrictEqual(
      expect.objectContaining({
        partyId: createdEntityId,
        AMLstatus: 'Pending',
        KYCstatus: 'Pending',
      }),
    );
  });

  it('getEntity', async () => {
    const { data } = await getEntity(createdEntityId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        entityDetails: expect.anything(),
      }),
    );
    const { entityDetails } = data;
    expect(entityDetails).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          partyId: createdEntityId,
          AMLstatus: 'Pending',
          KYCstatus: 'Pending',
        }),
      ]),
    );
  });
  it('deleteEntity -- does not exist', async () => {
    const { data } = await deleteEntity('fake-entity-id');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '198',
      }),
    );
  });
  it('deleteEntity -- success', async () => {
    const { data } = await deleteEntity(createdEntityId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
      }),
    );
  });
});
