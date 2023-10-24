import { getAllAccounts } from '../accounts/index.js';
import { filterAccounts } from '../accounts/util.js';

let query;
process.argv.forEach((val, index, array) => {
  console.log(val);
  if (val.endsWith('get-account-details.mjs')) {
    query = JSON.parse(array[index + 1]);
  }
});

if (query == null) {
  console.error('No query specified');
  process.exit();
}

const { data: accounts } = await getAllAccounts();
const matches = filterAccounts(accounts, query);

console.log(matches);
