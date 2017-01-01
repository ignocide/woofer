var express = require('express')
var glob = require('glob')

var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var compress = require('compression')
var methodOverride = require('method-override')
// var exphbs = require('express-handlebars')

var engine = require('ejs-locals')
module.exports = function (app, config) {
  var env = process.env.NODE_ENV || 'development'
  app.locals.ENV = env
  app.locals.ENV_DEVELOPMENT = env == 'development'

  app.use(express.static(config.root + '/public'))

  // app.engine('handlebars', exphbs({ }))
  app.set('views', config.root + '/app/views')
  // app.set('view engine', 'handlebars')
  app.engine('ejs', engine)
  app.set('view engine', 'ejs')

  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(cookieParser())
  app.use(compress())
  app.use(methodOverride())

  var controllers = glob.sync(config.root + '/app/controllers/*.js')
  controllers.forEach(function (controller) {
    require(controller)(app)
  })

  app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500)
      console.log(err)
      res.error('error', {
        message: err.message,
        error: err,
        title: 'error'
      })
    })
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error'
    })
  })
}
