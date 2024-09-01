import curlirize from 'axios-curlirize';
import { tapi, execute } from '../util.js';

curlirize(tapi);

let payload = {};
let command;
let method;

const methods = ['get', 'post', 'put', 'patch', 'delete'];

process.argv.forEach((val, index, array) => {
  if (val.endsWith('execute.mjs')) {
    if (methods.includes(array[index + 1])) {
      method = array[index + 1];
      command = array[index + 2];
      payload = array[index + 3] ? JSON.parse(array[index + 3]) : {};
    } else {
      command = array[index + 1];
      payload = array[index + 2] ? JSON.parse(array[index + 2]) : {};
    }
  }
});

if (command == null) {
  console.error('No command specified');
  process.exit();
}

try {
  const response = await execute(command, payload, method);
  console.log(JSON.stringify(response.data, null, 2));
  if (response.status >= 400) {
    console.log('');
    console.error(`ERROR: ${response.status}`);
    console.error(response.statusText);
  }
} catch (e) {
  console.error(`ERROR: ${e.response.status}`);
  console.error(e.response.statusText);
}
