const { getExports, getExport, getExportContent } = require('.');

describe.skip('exports', () => {
  it('getExports', async () => {
    const { data } = await getExports();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        exports: expect.any(Array),
      }),
    );
  });
  it.skip('getExport', async () => {
    const { data } = await getExport('bogus-uuid');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        export: expect.objectContaining({ id: expect.any(String) }),
      }),
    );
  });
  it.skip('getExportContent', async () => {
    const { data } = await getExportContent('bogus-uuid');
    expect(data).toStrictEqual('bogus-uuid content');
  });
});
