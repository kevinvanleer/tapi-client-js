import { getAllOfferings } from '../offerings/index.js';
// import { filterOfferings } from '../offerings/util.js';

let query;
process.argv.forEach((val, index, array) => {
  console.log(val);
  if (val.endsWith('get-offerings.mjs')) {
    query = JSON.parse(array[index + 1]);
  }
});

if (query == null) {
  console.error('No query specified');
  process.exit();
}

const { data: offerings } = await getAllOfferings();
// const matches = filterOfferings(offerings, query);
const matches = offerings;

console.log(matches);
