#!/usr/bin/env node
const { exec } = require('child_process')
const callOneByOne = require('./lib/call_one_by_one')
const wdsparql = './node_modules/wikidata-cli/bin/wdsparql -s'
const sparqlFolder = './queries/sparql'
const types = require('./lib/types_parser')(sparqlFolder, 'rq')
const fs = require('fs')
const _ = require('../lib/utils')

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

const update = type => `${wdsparql} ${sparqlFolder}/${type}.rq > ./queries/results/${type}.json`

const makeQuery = type => new Promise((resolve, reject) => {
  const updateCmd = `${update(type)}`
  _.info(updateCmd, 'running')
  const cmd = `${archive(type)} ; ${updateCmd}`
  return exec(cmd, (err, res) => {
    if (err) return reject(err)
    else return resolve(res)
  })
})

callOneByOne(types, 'query update', makeQuery)
.then(() => _.success(types, 'query updates done'))
.catch(err => _.error([ types, err ], 'query updates err'))
