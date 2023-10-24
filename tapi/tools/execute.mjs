import { execute } from '../util.js';

let command;
let payload = {};
process.argv.forEach((val, index, array) => {
  console.log(val);
  if (val.endsWith('execute.mjs')) {
    command = array[index + 1];
    payload = JSON.parse(array[index + 2]);
  }
});

if (command == null) {
  console.error('No command specified');
  process.exit();
}

const { data } = await execute(command, payload);

console.log(JSON.stringify(data,null,2));
