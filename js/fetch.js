const fetch = require('node-fetch');

// ==== GET API KEYS FROM CONFIG.JS FILE =====
const config = require('./config.js');
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

// ===== FETCH DATA FROM FOOD2FORK =====

function food2fork(ingredient) {
  const url = `https://community-food2fork.p.mashape.com/search?key=${food2forkApiKey}&q=${ingredient}`
  const params = {
    headers: {
      "X-Mashape-Key": mashApeKey,
    }
  }

  fetchData(url, params)
    .then((data) => {
      console.log(data);
      const recipes = data.recipes;
      for (let recipe in recipes) {
        console.log(recipes[recipe]);
        console.log(recipes[recipe].title);
      }
    });
}

module.exports = food2fork;

// Add this to code:
// const fetch = require('../js/fetch.js');
// fetch ('margarine');
