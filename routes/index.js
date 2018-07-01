const express = require('express');
const router = express.Router();
  const fetch = require('../js/fetch.js');

router.get('/', (req, res, next) => {
  fetch ('margarine');
  res.render('index');
});


module.exports = router;
