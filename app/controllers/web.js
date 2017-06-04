var express = require('express'),
  router = express.Router()

module.exports = function (app) {
  app.use('/', router)
}

router.get('/play', function (req, res) {
  console.log('!!')
  res.render('play')
})

router.get('/awesome', function (req, res) {
  res.render('awesome')
})

router.get('/recent', function (req, res) {
  res.render('recent')
})

router.get('/', function (req, res, next) {
  res.render('index')
})
