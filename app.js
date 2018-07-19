const express = require('express');
const app = express();
const router = require('./routes/index.js');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const config = require('./js/config.js');
const logger = require('morgan')

app.use(logger('dev'));


const port = 3000;
app.listen(port, () => {
  console.log(`Express running on port ${port}.`);
});

// ==== MONGOOSE DB CONFIG ====

mongoose.connect("mongodb://localhost:27017/foodie", {
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));

// === SESSIONS FOR TRACKING LOGINS ===

app.use(session({
  secret: config.sessionsSecret,
  resave: true,
  saveUninitialized: false,
  expires: new Date(Date.now() + (1)),
  store: new mongoStore({
    mongooseConnection: db
  })
}));

// make user ID available in templates
app.use(function(req, res, next) {
  res.locals.currentUser = req.session.userID;
  next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


// === SET VIEW ENGINE TO PUG & SET PUBLIC DIR
app.set('view engine', 'pug');
app.set('views');
app.use(express.static('public'));

//  === INCLUDE ROUTES

app.use(router);

// === ERROR HANDLING ===


// any request that makes it this far will run this function:
app.use((req, res, next) => {
  const err = new Error('Page not found.');
  err.status = 404;
  next(err);
});

// error handling:
app.use((err, req, res, next) => {
  res.locals.error = err;
  res.status(err.status);
  if (err.status == 409) {
    res.render('login.pug', {
      message: err.message,
      backButtonOff: true
    });
  } else {
    res.render('searchapp', {
      message: `${err.status} ${err}`,
    });
  }

});
