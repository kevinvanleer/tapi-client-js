const { post, get } = require('../util');

const createJob = (newJob) => post('/jobs', newJob);
const getJobs = () => get('/jobs');
const getJob = (id) => get(`/jobs/${id}`);

module.exports = {
  createJob,
  getJobs,
  getJob,
};
