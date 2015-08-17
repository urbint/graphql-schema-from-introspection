require('babel/register')({
  optional: ['runtime']
})

var chai = require('chai')

var chaiSubset = require('chai-subset')
chai.use(chaiSubset)
chai.should()
chai.config.truncateThreshold = 0
