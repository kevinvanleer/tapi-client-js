const { createJob, getJobs, getJob } = require('.');

const testJob = {
  newJob: {
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
  },
};

describe('jobs', () => {
  let createdJob;
  it('createJob', async () => {
    const { data } = await createJob(testJob);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        job: expect.objectContaining({
          id: expect.any(String),
          type: 'export',
          progress: '0',
          status: 'submitted',
          outputId: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      }),
    );
    createdJob = data.job;
  });

  it('getJobs', async () => {
    const { data } = await getJobs();
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        jobs: expect.arrayContaining([createdJob]),
      }),
    );
  });
  it('getJob', async () => {
    const { data } = await getJob(createdJob.id);
    expect(data).toStrictEqual(
      expect.objectContaining({
        statusCode: '101',
        job: createdJob,
      }),
    );
  });
});
