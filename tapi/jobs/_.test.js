const { createJob, getJobs, getJob } = require('.');

const testJob = {
  type: 'export',
  instructions: {
    filter: {
      createDateRange: ['2024-01-01T12:00:00.000Z', '2024-02-01T23:55:55.000Z'],
      settledDateRange: ['2024-01-01T12:00:00.000Z', '2024-02-01T23:55:55.000Z'],
      offerings: ['offering-id-1', 'offering-id-2', 'offering-id-3'],
      tradeStatus: ['CREATED', 'FUNDED', 'SETTLED'],
      amountRange: [0, 1000000],
      keyword: 'my keyword',
      rrStatus: ['PENDING', 'APPROVED'],
      principleStatus: ['PENDING', 'APPROVED'],
      closeId: 'the-close-id',
    },
    name: 'My report name',
    template: 'trade-review-report',
    format: 'json',
  },
};

describe('jobs', () => {
  it('createJob', async () => {
    const { data } = await createJob(testJob);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        job: { id: 'new-uuid' },
      }),
    );
  });

  it('getJobs', async () => {
    const { data } = await getJobs();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        jobs: [],
      }),
    );
  });
  it('getJob', async () => {
    const { data } = await getJob('bogus-job-uuid');
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        job: { id: 'bogus-job-uuid' },
      }),
    );
  });
});
