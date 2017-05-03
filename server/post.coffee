# POST { type, ids }
# => fetch entities
# => index entities in ElasticSearch Wikidata index

fetchAndPutEntitiesFromIds = require '../lib/fetch_and_put_entities_from_ids'
_ = require '../lib/utils'

module.exports = (req, res)->
  idsPerType = req.body
  _.log idsPerType, 'idsPerType'

  getTypesPromises(idsPerType)
  .then -> res.json { ok: true }
  .catch sendError(res)

getTypesPromises = (idsPerType)->
  promises = []
  for type, ids of idsPerType
    unless ids instanceof Array
      return Promise.reject new Error("invalid ids array (#{type})")

    if ids.length > 0
      promises.push fetchAndPutEntitiesFromIds(type, ids).catch passNonWhitelisted

  return Promise.all promises

passNonWhitelisted = (err)->
  if err.message is 'non whitelisted type' then return
  else throw err

sendError = (res)-> (err)->
  statusCode = err.statusCode or 500
  color = if statusCode < 500 then 'yellow' else 'red'
  _.log err, 'post err', color
  { message, context } = err
  res.status(statusCode).send { status_verbose: message, context }
