var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const session = require('express-session');
const schedule = require('node-schedule');

var session = require('express-session');
var FileStore = require('session-file-store')(session);



var mainRouter = require('./routes/main');
var registerRouter = require('./routes/register');
var freeboardRouter = require('./routes/freeboard');
var reservation = require('./routes/reserve');
var regionboardRouter = require('./routes/regionboard');
var mypageRouter = require('./routes/mypage');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// const mysql      = require('mysql');
// const dbconfig   = require('./routes/database.js');
// const connection = mysql.createConnection(dbconfig);


// app.get('/users', (req, res) => {
//   connection.query('SELECT * from client', (error, rows) => {
//     if (error) throw error;
//     console.log('User info is: ', rows);
//     res.send(rows);
//   });
// });

// app.listen(app.get('port'), () => {
//   console.log('Express server listening on port ' + app.get('port'));
// });



app.engine('html', require('ejs').renderFile);

app.use(session({
  secret: 'asadlfkj!@#!@#dfgasdg',
  resave: false,
  saveUninitialized: true,
  store:new FileStore()
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', mainRouter);
app.use('/register', registerRouter);
app.use('/freeboard', freeboardRouter);
app.use('/regionboard', regionboardRouter);
app.use('/mypage', mypageRouter);
app.use('/reserve', reservation);



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
