import axios from 'axios';
import { Readable } from 'stream';
import FormData from 'form-data';

const apiHost = process.env.TAPI_HOST || 'https://api-sandboxdash.norcapsecurities.com';
const tapiUriSegment = 'tapiv3/index.php/v3';
const tapiUri = `${apiHost}/${tapiUriSegment}`;
const mimeType = 'application/json';

const tapi = axios.create({
  baseURL: tapiUri,
  timeout: 10000,
  headers: { accept: mimeType, 'content-type': mimeType },
});

const auth = {
  clientID: process.env.TAPI_CLIENT_ID,
  developerAPIKey: process.env.TAPI_API_KEY,
};

const uploadPartyDocument = (partyId, file) => {
  const data = new FormData();
  data.append('clientID', auth.clientID);
  data.append('developerAPIKey', auth.developerAPIKey);
  data.append('partyId', partyId);
  data.append('file_name', `filename0="${file.originalname}"`);
  data.append('documentTitle', `documentTitle0="${file.originalname}"`);
  data.append('userfile0', Readable.from(file.buffer), { filename: file.originalname });
  return tapi.post('/uploadPartyDocument', data, {
    timeout: 60000,
    headers: { ...data.getHeaders() },
  });
};

const partyId = process.env.TAPI_PARTY_ID;
const fakeFile = {
  buffer: Buffer.from('a'.repeat(1e3)),
  originalname: 'test-party-file.pdf',
};

const response = await uploadPartyDocument(partyId, fakeFile);

// eslint-disable-next-line no-console
console.log(response);
