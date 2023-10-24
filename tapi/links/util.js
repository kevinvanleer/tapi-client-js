const filterLinks = (links, query, archived = false) => links.linkDetails
  .filter((link) => Object.entries(query)
    .reduce(
      (pass, [k, v]) => pass
      && link[k] === v
      && (link.linkstatus.toLowerCase() === 'archived') === archived,
      true,
    ));

module.exports = { filterLinks };
