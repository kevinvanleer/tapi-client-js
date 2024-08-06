const { getExports, getExport, getExportContent } = require('.');

describe('exports', () => {
  it('getExports', async () => {
    const { data } = await getExports();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        exports: [],
      }),
    );
  });
  it('getExport', async () => {
    const { data } = await getExport('bogus-uuid');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        export: { id: 'bogus-uuid' },
      }),
    );
  });
  it('getExportContent', async () => {
    const { data } = await getExportContent('bogus-uuid');
    expect(data).toStrictEqual('bogus-uuid content');
  });
});
