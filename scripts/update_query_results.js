#!/usr/bin/env node
const { exec } = require('child_process')
const callOneByOne = require('./lib/call_one_by_one')
const wdCommand = './node_modules/.bin/wd'
const sparqlFolder = './queries/sparql'
const types = require('./lib/types_parser')(sparqlFolder, 'rq')
const fs = require('fs')
const logger = require('../lib/logger')

const filePath = type => `./queries/results/${type}.json`

const archive = type => {
  const file = filePath(type)
  try {
    const { mtime } = fs.statSync(file)
    const timestamp = mtime.toISOString().replace(':', '-').split(':')[0]
    const renamed = file.replace('.json', `.${timestamp}.json`)
    return `mv ${file} ${renamed}`
  } catch (err) {
    if (err.code === 'ENOENT') return "echo 'no file to archive'"
    else throw err
  }
}

const update = type => `${wdCommand} sparql ${sparqlFolder}/${type}.rq --json > ./queries/results/${type}.json`

const makeQuery = type => new Promise((resolve, reject) => {
  const updateCmd = `${update(type)}`
  logger.info('running', updateCmd)
  const cmd = `${archive(type)} ; ${updateCmd}`
  return exec(cmd, (err, res) => {
    if (err) return reject(err)
    else return resolve(res)
  })
})

callOneByOne(types, 'query update', makeQuery)
.then(() => logger.success('query updates done', types))
.catch(logger.ErrorRethrow(`query updates err (type: ${types})`))
