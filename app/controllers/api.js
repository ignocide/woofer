'use strict'
const express = require('express')
const router = express.Router()
const db = require('../models/redis')

module.exports = function (app) {
  app.use('/api', router)
}

router.post('/music', function (req, res, next) {
  let item = req.body.item
  let key = req.body.key
  db.lpush(key, item.toString())
  .then(function (res) {
    console.log(res)
    res.json(res)
  })
  .catch(function (err) {
    res.error(err)
  })
})
