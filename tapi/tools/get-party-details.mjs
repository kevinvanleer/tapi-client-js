import { getAllParties } from '../parties/index.js';
import { filterParties } from '../parties/util.js';

let query;
process.argv.forEach((val, index, array) => {
  console.log(val);
  if (val.endsWith('get-party-details.mjs')) {
    query = JSON.parse(array[index + 1]);
  }
});

if (query == null) {
  console.error('No query specified');
  process.exit();
}

const { data: parties } = await getAllParties();
const matches = filterParties(parties, query);

console.log(matches);
