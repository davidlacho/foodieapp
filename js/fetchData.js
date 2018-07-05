const fetch = require('node-fetch');

function fetchData(url) {

  return fetch(url)
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

module.exports = fetchData; 
