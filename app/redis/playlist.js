'use strict'

const redis = require('../models/redis')
const Promise = require('bluebird')
var REDIS_PLAYLIST = function () {}

REDIS_PLAYLIST.prototype.add = function (key, video) {
  let ret
  return redis.getAsync(key)
  .then(function (list) {
    if (list) {
      list = JSON.parse(list)
    }
    else {
      list = []
    }
    list.push(video)
    ret = list
    return redis.setAsync(key, JSON.stringify(list))
  })
  .then(function () {
    return Promise.resolve(ret)
  })
}

REDIS_PLAYLIST.prototype.set = function (key, list) {
  return redis.setAsync(key, JSON.stringify(list))
  .then(function () {
    return Promise.resolve(list)
  })
}

REDIS_PLAYLIST.prototype.list = function (key) {
  return redis.getAsync(key)
  .then(function (list) {
    list = list || '[]'
    return Promise.resolve(JSON.parse(list))
  })
}

module.exports = new REDIS_PLAYLIST()
