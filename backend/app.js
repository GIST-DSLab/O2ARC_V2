var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var marioRouter = require('./routes/mario')
var IQtestRouter = require('./routes/IQtest')
var problemsSetRouter = require('./routes/problemset')
var dataRouter = require('./routes/data')

var arcRouter = require('./routes/arc_competition')
var miniRouter = require('./routes/mini_competition')

var evalRouter = require('./routes/eval')

var app = express();

 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/task', problemsSetRouter)
app.use('/mario', marioRouter)
app.use('/IQtest', IQtestRouter);
app.use('/data', dataRouter)

app.use('/arc_competition', arcRouter)
app.use('/mini_competition', miniRouter)

app.use('/eval', evalRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
