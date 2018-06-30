const express = require('express');
const app = express();
const router = require('./routes/index.js');

app.listen(3000, ()=> {
  console.log("Express running on port 3000.");
});

app.set('view engine', 'pug');
app.use(router);
app.use(express.static('public'));
