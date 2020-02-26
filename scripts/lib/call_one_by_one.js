const logger = require('../../lib/utils')

module.exports = (types, label, fn) => {
  // Cloning types to keep the initial object intact
  types = types.slice()
  const executeNext = function () {
    const type = types.shift()
    if (!type) return

    logger.info(`${label} starting`, type)

    return fn(type)
    .then(executeNext)
  }

  return executeNext()
}
