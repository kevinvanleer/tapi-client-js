const { createOffering, updateOffering, getAllOfferings, getOffering, deleteOffering } = require('.');

describe('offerings', () => {
  const issuerId = '9923624';
  const offering = {
    issuerId,
    issueName: 'Test issue',
    issueType: 'Test type',
    targetAmount: '0',
    minAmount: '0',
    maxAmount: '0',
    unitPrice: '0',
    startDate: 'unknown',
    endDate: 'unknown',
    offeringText: 'n/a',
    stampingText: 'n/a',
  };
  const validOffering = {
    ...offering,
    issueType: 'Equity',
    targetAmount: '5',
    maxAmount: '10',
    unitPrice: '1',
    startDate: '01-01-1970',
    endDate: '01-01-1970',
  };
  let createdOfferingId;
  it('createOffering -- invalid', async () => {
    const { data } = await createOffering(offering);
    expect(data.statusDesc).not.toEqual('Ok');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '106',
      }),
    );
  });
  it('createOffering -- valid', async () => {
    const { data } = await createOffering(validOffering);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        offeringDetails: expect.arrayContaining([
          true,
          expect.arrayContaining([
            expect.objectContaining({
              offeringId: expect.anything(),
              offeringStatus: 'Pending',
            }),
          ]),
        ]),
      }),
    );
    createdOfferingId = data.offeringDetails[1][0].offeringId;
    expect(createdOfferingId).toMatch(/[0-9]+/);
  });
  it('updateOffering -- valid', async () => {
    expect(createdOfferingId).toMatch(/[0-9]+/);
    const updatedOffering = {
      offeringId: createdOfferingId,
      offeringStatus: 'Approved',
      field1: 'open',
    };
    const { data } = await updateOffering(updatedOffering);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        offeringDetails: expect.arrayContaining([
          true,
          expect.arrayContaining([
            {
              offeringId: expect.anything(),
              offeringStatus: 'Approved',
            },
          ]),
        ]),
      }),
    );
  });
  it('getOffering -- success', async () => {
    expect(createdOfferingId).toMatch(/[0-9]+/);
    const { data } = await getOffering(createdOfferingId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        offeringDetails: expect.arrayContaining([
          expect.objectContaining({
            offeringId: createdOfferingId,
            issueName: validOffering.issueName,
            offeringStatus: 'Approved',
            field1: 'open',
            issuerId,
          }),
        ]),
      }),
    );
  });
  it('deleteOffering -- success', async () => {
    expect(createdOfferingId).toMatch(/[0-9]+/);
    const { data } = await deleteOffering(createdOfferingId);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
      }),
    );
  });
  it('getAllOfferings', async () => {
    const { data } = await getAllOfferings();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        statusDesc: 'Ok',
        offeringDetails: expect.arrayContaining([
          expect.objectContaining({
            offeringId: expect.anything(),
          }),
        ]),
      }),
    );
  });
});
