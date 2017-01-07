const redis = require('redis')
const bluebird = require('bluebird')
const config = require('../config/config')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
var client = redis.createClient(config.redis)

client.on('connect', function (err) {
  console.log('redis connect')
})

module.exports = client
