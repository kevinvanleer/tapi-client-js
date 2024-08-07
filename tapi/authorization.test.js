const axios = require('axios');
const { auth } = require('./util');

jest.setTimeout(20000);
describe('authorization', () => {
  const apiHost = process.env.TAPI_HOST;
  const tapiUriSegment = 'tapiv3/index.php/v3';
  const tapiUri = `${apiHost}/${tapiUriSegment}`;
  const jsonType = 'application/json';
  const urlEncodedType = 'application/x-www-form-urlencoded';
  const tapi = axios.create({
    baseURL: tapiUri,
    timeout: 60000,
    validateStatus(status) {
      return status >= 200 && status < 500; // default
    },
  });
  it('header authorization json', async () => {
    const res = await tapi.get('/parties', {
      headers: {
        accept: jsonType,
        'content-type': jsonType,
        Authorization: `Bearer ${auth.clientID}:${auth.developerAPIKey}`,
      },
    });
    expect(res.status).toStrictEqual(200);
  });
  it('header authorization url-encoded', async () => {
    const res = await tapi.post(
      '/getParties',
      { ...auth },
      {
        headers: {
          accept: urlEncodedType,
          'content-type': urlEncodedType,
          Authorization: `Bearer ${auth.clientID}:${auth.developerAPIKey}`,
        },
      },
    );
    expect(res.status).toStrictEqual(200);
  });
  it('body authorization json', async () => {
    const res = await tapi.post(
      '/getParties',
      { ...auth },
      {
        headers: {
          accept: jsonType,
          'content-type': jsonType,
        },
      },
    );
    expect(res.status).toStrictEqual(200);
  });
  it('body authorization url-encoded', async () => {
    const res = await tapi.post(
      '/getParties',
      { ...auth },
      {
        headers: {
          accept: urlEncodedType,
          'content-type': urlEncodedType,
        },
      },
    );
    expect(res.status).toStrictEqual(200);
  });
});
