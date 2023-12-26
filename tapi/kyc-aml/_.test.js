const { performKycAml, getKycAml } = require('.');

describe('kyc-aml', () => {
  it('performKycAml - invalid party', async () => {
    const { data } = await performKycAml('random-string');
    expect(data.statusDesc).not.toEqual('Ok');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '198',
      }),
    );
  });
  it('performKycAml -- valid party', async () => {
    console.log(global.partyId);
    const { data } = await performKycAml(global.partyId);
    expect(data.statusDesc).toEqual('Ok');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        kyc: expect.objectContaining({
          amlstatus: expect.anything(),
          kycstatus: expect.anything(),
        }),
      }),
    );
  });
  it('getKycAml - invalid party', async () => {
    const { data } = await getKycAml('random-string');
    expect(data.statusCode).toEqual('198');
  });
  it('getKycAml - valid party', async () => {
    const { data } = await getKycAml(global.partyId);
    expect(data.statusDesc).toEqual('Ok');
    expect(data.kycamlDetails).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        kyc: expect.objectContaining({
          amlstatus: expect.anything(),
          kycstatus: expect.anything(),
        }),
      }),
    );
  });
});
