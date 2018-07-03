const express = require('express');
const app = express();
const router = require('./routes/index.js');

app.listen(3000, ()=> {
  console.log("Express running on port 3000.");
});

app.set('view engine', 'pug');
app.use(router);
app.use(express.static('public'));

// any request that makes it this far will run this function:
app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});

// error handling:
app.use((err, req, res, next) =>{
  res.locals.error = err;
  res.status(err.status);
  res.render('template', {
    message: err
  });
});
