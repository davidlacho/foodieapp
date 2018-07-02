const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// ==== GET API KEYS FROM CONFIG.JS FILE =====
const config = require('../js/config.js');
const food2forkApiKey = config.food2forkApiKey;
const mashApeKey = config.mashApeKey;

// ===== FETCH HANDLERS =====

function fetchData(url, params) {
  return fetch(url, params)
    .then(res => checkStatus(res))
    .then(res => res.json())
    .catch(error => console.log('Looks like there was a problem: ', error));
}

function checkStatus(res) {
  if (res.ok) {
    return Promise.resolve(res)
  } else {
    return Promise.reject(new Error(res.statusText));
  }
}

router.get('/', (req, res, next) => {

  let {
    ingredient
  } = req.query;
  if (ingredient != undefined) {
    let recipes = fetch(ingredient);
    const url = `https://community-food2fork.p.mashape.com/search?key=${food2forkApiKey}&q=${ingredient}`
    const params = {
      headers: {
        "X-Mashape-Key": mashApeKey,
      }
    }

    fetchData(url, params).
    then((data) => {
      res.render('template', data);
    });
  } else {
    res.render('template');
  }
});


module.exports = router;
