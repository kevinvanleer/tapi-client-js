import curlirize from 'axios-curlirize';
import { tapi, execute } from '../util.js';

curlirize(tapi);

let payload = {};
let command;

process.argv.forEach((val, index, array) => {
  if (val.endsWith('execute.mjs')) {
    command = array[index + 1];
    payload = JSON.parse(array[index + 2]);
  }
});

if (command == null) {
  console.error('No command specified');
  process.exit();
}

try {
  const response = await execute(command, payload);
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
