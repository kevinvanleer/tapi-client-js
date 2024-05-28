const { get, put, post } = require('../util');

const createEntity = (entity) => put('/createEntity', entity);

const updateEntity = (entity) => post('/updateEntity', entity);

const getEntity = (entityId) => post('/getEntity', { partyId: entityId });
const getEntitiesGet = ({ offset, limit, deleted }) => get('/entities', { offset, limit, deleted });
const getEntitiesPost = ({ offset, limit, deleted }) => post('/getEntities', { offset, limit, deleted });
const deleteEntity = (partyId) => post('/deleteEntity', { partyId });

const upsertEntity = (entity) => (entity.partyId ? updateEntity(entity) : createEntity(entity));

module.exports = {
  createEntity,
  updateEntity,
  upsertEntity,
  getEntity,
  getEntities: getEntitiesGet,
  getEntitiesPost,
  deleteEntity,
};
