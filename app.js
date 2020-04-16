const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const routes = require('./routes/index')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', routes)

// error handler
app.use((err, req, res, next) => {
  // render the error page
  res.status(err.status || 500)
  res.render('books/errors')
  console.log('500 handler called')
})

app.use((req, res, next) => {
  res.render('books/page_not_found')
  console.log('404 handler called')
})
module.exports = app
