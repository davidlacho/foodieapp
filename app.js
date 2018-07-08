const express = require('express');
const app = express();
const router = require('./routes/index.js');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const port = 3000;
app.listen(port, ()=> {
  console.log(`Express running on port ${port}.`);
});

app.set('view engine', 'pug');
app.use(router);
app.use(express.static('public'));

// ==== MONGOOSE DB CONFIG ====

mongoose.connect("mongodb://localhost:27017/foodie", {
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));

// any request that makes it this far will run this function:
app.use((req, res, next) => {
  const err = new Error('Page not found.');
  err.status = 404;
  next(err);
});

// error handling:
app.use((err, req, res, next) =>{
  res.locals.error = err;
  res.status(err.status);
  res.render('template', {
    message: `${err.status} ${err}`
  });
});
