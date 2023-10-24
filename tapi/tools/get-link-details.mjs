import { getAllLinks } from '../links/index.js';
import { filterLinks } from '../links/util.js';

let accountId;
let query;
process.argv.forEach((val, index, array) => {
  console.log(val);
  if (val.endsWith('get-link-details.mjs')) {
    accountId = JSON.parse(array[index + 1]);
    query = JSON.parse(array[index + 2]);
  }
});

if (query == null) {
  console.error('No query specified');
  process.exit();
}

const { data: links } = await getAllLinks(accountId);
console.log(links);
const matches = filterLinks(links, query);

console.log(matches);
