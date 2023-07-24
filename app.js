var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('https');
var fs = require('fs');
var app = express();

// io connect
const port = process.env.PORT || 8080;
var server = http.createServer({
  key: fs.readFileSync('./public/sslca/key.pem'),
  cert: fs.readFileSync('./public/sslca/cert.pem')
}, app);
server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
const io = require('socket.io')(server, {
  cors:{
    origin : 'https://localhost:8080',
    methods: ['GET', 'POST']
  }
});
const socketController = require('./controllers/socketController')(io);
// io.on('connection', function(socket) {
//   console.log('A user connected');

//   socket.on('disconnect', function() {
//       console.log('A user disconnected');
//   });

//   socket.on('chat message', function(msg) {
//       io.emit('chat message', msg);
//   });
// });

// Load MVC routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
