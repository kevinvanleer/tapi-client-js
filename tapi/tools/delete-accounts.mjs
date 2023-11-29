import { getAllAccounts, deleteAccount } from '../accounts/index.js';
import { filterAccounts } from '../accounts/util.js';

let query;
process.argv.forEach((val, index, array) => {
  console.log(val);
  if (val.endsWith('delete-accounts.mjs')) {
    query = JSON.parse(array[index + 1]);
  }
});

if (query == null) {
  console.error('No query specified');
  process.exit();
}

const { data: accounts } = await getAllAccounts();
const matches = filterAccounts(accounts, query);

const results = await Promise.all(matches.map((match) => deleteAccount(match.accountId)));
console.log(`Found ${matches.length}, deleted: ${results.filter((result) => result.data.statusCode === '101').length}`);
