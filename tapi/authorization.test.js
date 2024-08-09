const axios = require('axios');
const FormData = require('form-data');
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
    expect(res.data.statusCode).toStrictEqual('101');
  });
  it('header authorization post url-encoded', async () => {
    const res = await tapi.post(
      '/getParties',
      {},
      {
        headers: {
          accept: urlEncodedType,
          'content-type': urlEncodedType,
          Authorization: `Bearer ${auth.clientID}:${auth.developerAPIKey}`,
        },
      },
    );
    expect(res.status).toStrictEqual(200);
    expect(res.data.statusCode).toStrictEqual('101');
  });
  it('header authorization post url-encoded with body auth', async () => {
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
    expect(res.data.statusCode).toStrictEqual('101');
  });
  it('header authorization post json', async () => {
    const res = await tapi.post(
      '/getParties',
      {},
      {
        headers: {
          accept: jsonType,
          'content-type': jsonType,
          Authorization: `Bearer ${auth.clientID}:${auth.developerAPIKey}`,
        },
      },
    );
    expect(res.status).toStrictEqual(200);
    expect(res.data.statusCode).toStrictEqual('101');
  });
  it('header authorization post json with body auth', async () => {
    const res = await tapi.post(
      '/getParties',
      { ...auth },
      {
        headers: {
          accept: jsonType,
          'content-type': jsonType,
          Authorization: `Bearer ${auth.clientID}:${auth.developerAPIKey}`,
        },
      },
    );
    expect(res.status).toStrictEqual(200);
    expect(res.data.statusCode).toStrictEqual('101');
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
    expect(res.data.statusCode).toStrictEqual('101');
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
    expect(res.data.statusCode).toStrictEqual('101');
  });
  it('body authorization form-data', async () => {
    const body = new FormData();
    body.append('clientID', auth.clientID);
    body.append('developerAPIKey', auth.developerAPIKey);
    const res = await tapi.post('/getParties', body, {
      headers: {
        ...body.getHeaders(),
      },
    });
    expect(res.status).toStrictEqual(200);
    expect(res.data.statusCode).toStrictEqual('101');
  });
  it('body authorization form-data put fails', async () => {
    const body = new FormData();
    body.append('clientID', auth.clientID);
    body.append('developerAPIKey', auth.developerAPIKey);
    const res = await tapi.put('/getParties', body, {
      headers: {
        ...body.getHeaders(),
      },
    });
    expect(res.status).toStrictEqual(401);
    expect(res.data.statusCode).toStrictEqual('103');
  });
});
