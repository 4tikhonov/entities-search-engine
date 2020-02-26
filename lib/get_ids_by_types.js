const { host: elasticHost } = require('config').elastic
const { postJson } = require('./request')

module.exports = (index, ids) => {
  // See https://www.elastic.co/guide/en/elasticsearch/reference/2.1/docs-multi-get.html
  if (typeof index !== 'string') {
    throw new Error(`invalid index: ${index}`)
  }

  if (!(ids instanceof Array)) {
    throw new Error(`invalid ids: ${ids}`)
  }

  return postJson(`${elasticHost}/${index}/_mget?_source=false`, { ids })
  .then(res => res.json())
  .then(data => data.docs.reduce(aggregateIdsByType, {}))
}

var aggregateIdsByType = (index, doc) => {
  if (!doc.found) return index
  const { _type, _id } = doc
  if (!index[_type]) { index[_type] = [] }
  index[_type].push(_id)
  return index
}
