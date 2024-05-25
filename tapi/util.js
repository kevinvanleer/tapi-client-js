const camelize = require('camelize');
const axios = require('axios');
const usStateAbbr = require('@stdlib/datasets-us-states-abbr');
const usStateNames = require('@stdlib/datasets-us-states-names');

const apiHost = process.env.TAPI_HOST || 'https://api-sandboxdash.norcapsecurities.com';
const serverlessHost = apiHost.replace('api', 'tapi');
const tapiUriSegment = 'tapiv3/index.php/v3';
const tapiUri = `${apiHost}/${tapiUriSegment}`;
// const mimeType = 'application/x-www-form-urlencoded';
const mimeType = 'application/json';

const auth = {
  clientID: process.env.TAPI_CLIENT_ID,
  developerAPIKey: process.env.TAPI_API_KEY,
};

const tapi = axios.create({
  baseURL: tapiUri,
  timeout: 60000,
  headers: { accept: mimeType, 'content-type': mimeType, Authorization: `Bearer ${auth.clientID}:${auth.developerAPIKey}` },
  validateStatus(status) {
    return status >= 200 && status < 500; // default
  },
});

/* Extra debug information
tapi.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    console.log(config);
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);
*/
tapi.interceptors.response.use((response) => {
  if (response.data.developerAPIKey) console.log('CONTAINS API KEY');
  // console.log(response);
  return response;
});
if (process.env.TAPI_CLIENT_ID == null)
  console.warn('WARNING: TAPI client is not defined. Check your environment configuration.');
if (process.env.TAPI_API_KEY == null) console.warn('WARNING: TAPI API key is not defined. Check your environment configuration.');

const put = (command, payload, config) => tapi.put(command, { ...auth, ...payload }, config);
const post = (command, payload, config) => tapi.post(command, { ...auth, ...payload }, config);
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
  serverlessHost,
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
