const food2forkApiKey = config.food2forkApiKey;
const mashApeKey = config.mashApeKey;

function fetchData(url, params) {
  return fetch(url, params)
    .then(res => checkStatus(res))
    .catch(error => console.log('Looks like there was a problem: ', error));
}


function checkStatus(res) {
  if (res.ok) {
    return Promise.resolve(res)
  } else {
    return Promise.reject(new Error(res.statusText));
  }
}


const url = `https://community-food2fork.p.mashape.com/search?key=${food2forkApiKey}&q=cream+cheese`
const params = {
  headers: {
    "X-Mashape-Key": "mashApeKey",
    "Accept": "application/json"
  }
}

fetchData(url, params)
.then(data => console.log(data));
