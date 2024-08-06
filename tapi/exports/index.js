const { get } = require('../util');

const getExports = () => get('/exports');
const getExport = (id) => get(`/exports/${id}`);
const getExportContent = (id) => get(`/exports/${id}/content`);

module.exports = {
  getExports,
  getExport,
  getExportContent,
};
