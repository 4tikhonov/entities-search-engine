const bulk = require('./bulk')
const buildLine = bulk.buildLine.bind(null, 'delete')
const logger = require('./logger')
const getIdsByTypes = require('../lib/get_ids_by_types')

module.exports = (index, type = '_all', uris) => {
  if (uris.length === 0) return Promise.resolve()

  logger.info('unindexed', [ index, type, uris ])

  return getBatch(index, type, uris.map(unprefixify))
  .then(batch => {
    if (batch.length === 0) { return }
    return bulk.postBatch(batch)
    .then(bulk.logRes(`bulk unindex res (${index}/${type})`))
  })
  .catch(logger.ErrorRethrow('unindex err'))
}

// If it has a URI prefix (like 'wd' or 'inv'), remove it
// as entities are indexed with there sole id, the domain being represented
// by the index
const unprefixify = uri => uri.replace(/^(inv:|wd:)/, '')

const getBatch = (index, type, ids) => {
  if (type != null && type !== '_all') {
    return Promise.resolve(getTypeBatchLines(index, type, ids))
  }

  return getIdsByTypes(index, ids)
  .then(idsByTypes => {
    logger.info('idsByTypes', idsByTypes)
    return Object.keys(idsByTypes)
    .reduce(aggregateBatch(index, idsByTypes), [])
  })
}

const aggregateBatch = (index, idsByTypes) => (batch, type) => {
  const ids = idsByTypes[type]
  batch = batch.concat(getTypeBatchLines(index, type, ids))
  return batch
}

const getTypeBatchLines = (index, type, ids) => ids.map(buildLine.bind(null, index, type))
