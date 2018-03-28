require 'should'
{ reset: resetFixtures, getById } = require './fixtures'
unindex = require '../lib/unindex'
{ undesiredRes, undesiredErr } = require './utils'
_ = require '../lib/utils'

describe 'unindex', ->
  beforeEach resetFixtures

  it 'should unindex a doc with a type', (done)->
    unindex 'fixtures', 'foo', [ '1' ]
    .then -> getById '1'
    .then undesiredRes(done)
    .catch (err)->
      err.body._id.should.equal '1'
      err.statusCode.should.equal 404
      done()
    .catch done

    return

  it 'should unindex a doc without a type', (done)->
    unindex 'fixtures', null, [ '3' ]
    .catch undesiredErr(done)
    .then -> getById '3'
    .then undesiredRes(done)
    .catch (err)->
      err.body._id.should.equal '3'
      err.statusCode.should.equal 404
      done()
    .catch done

    return

  it 'should unindex a doc with a type _all', (done)->
    unindex 'fixtures', '_all', [ '1', '2' ]
    .catch undesiredErr(done)
    .then -> getById '2'
    .then undesiredRes(done)
    .catch (err)->
      err.body._id.should.equal '2'
      err.statusCode.should.equal 404
      done()
    .catch done

    return
