const camelize = require('camelize');
const axios = require('axios');
const usStateAbbr = require('@stdlib/datasets-us-states-abbr');
const usStateNames = require('@stdlib/datasets-us-states-names');

const apiHost = process.env.TAPI_HOST || 'https://api-sandboxdash.norcapsecurities.com';
const tapiUriSegment = 'tapiv3/index.php/v3';
const tapiUri = `${apiHost}/${tapiUriSegment}`;
// const mimeType = 'application/x-www-form-urlencoded';
const mimeType = 'application/json';

const tapi = axios.create({
  baseURL: tapiUri,
  timeout: 60000,
  headers: { accept: mimeType, 'content-type': mimeType },
  validateStatus(status) {
    return status >= 200 && status < 500; // default
  },
});

tapi.interceptors.response.use((response) => {
  if (response.data.developerAPIKey) console.log('CONTAINS API KEY');
  return response;
});
if (process.env.TAPI_CLIENT_ID == null)
  console.warn('WARNING: TAPI client is not defined. Check your environment configuration.');
if (process.env.TAPI_API_KEY == null) console.warn('WARNING: TAPI API key is not defined. Check your environment configuration.');

const auth = {
  clientID: process.env.TAPI_CLIENT_ID,
  developerAPIKey: process.env.TAPI_API_KEY,
};

const put = (command, payload) => tapi.put(command, { ...auth, ...payload });
const post = (command, payload) => tapi.post(command, { ...auth, ...payload });
const execute = (command, payload) => (command.startsWith('create') ? put(command, payload) : post(command, payload));

const getFormattedDate = (date) =>
  `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;

const stateNameToAbbr = (name) => (usStateAbbr().includes(name) ? name : usStateAbbr()[usStateNames().indexOf(name)]);

const hasRequiredFields = (fields, mapping) =>
  mapping.map((m) => m[0]).reduce((acc, param) => acc && fields[param] != null, true);

const norcap = (key, mapping) => mapping.find((m) => m[0] === key)[1];

const convert = (requestBody, mapping) =>
  Object.fromEntries(
    Object.entries(camelize(requestBody))
      .map(([k, v]) => [norcap(k, mapping), v])
      .filter(([, v]) => v != null),
  );

module.exports = {
  tapi,
  tapiUri,
  auth,
  getFormattedDate,
  stateNameToAbbr,
  put,
  post,
  execute,
  hasRequiredFields,
  convert,
  norcap,
};
