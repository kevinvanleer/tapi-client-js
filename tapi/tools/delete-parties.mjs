import { getAllParties, deleteParty } from '../parties/index.js';
import { filterParties } from '../parties/util.js';

let query;
process.argv.forEach((val, index, array) => {
  console.log(val);
  if (val.endsWith('delete-parties.mjs')) {
    query = JSON.parse(array[index + 1]);
  }
});

if (query == null) {
  console.error('No query specified');
  process.exit();
}

const { data: parties } = await getAllParties();
const matches = filterParties(parties, query);

const results = await Promise.all(matches.map((match) => deleteParty(match.partyId)));
console.log(`Found ${matches.length}, deleted: ${results.filter((result) => result.data.statusCode === '101').length}`);
