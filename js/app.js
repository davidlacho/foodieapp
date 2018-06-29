// ==== GET API KEYS FROM CONFIG.JS FILE =====
const config = require('./config.js');
const food2forkApiKey = config.food2forkApiKey;
const mashApeKey = config.mashApeKey;
const fetch = require('node-fetch');

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

let ingredient = "cream+cheese";

const url = `https://community-food2fork.p.mashape.com/search?key=${food2forkApiKey}&q=${ingredient}`
const params = {
  headers: {
    "X-Mashape-Key": mashApeKey,
  }
}

// Set to true to actually perform fetch:
const doFetch = false;

if (doFetch){
  fetchData(url, params)
  .then((data) => {
    const recipes = data.recipes;
    for (let recipe in recipes) {
      console.log(recipes[recipe].title);
   }
  });
}
