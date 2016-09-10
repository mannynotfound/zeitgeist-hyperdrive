import express from 'express'

function requestPromise(url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http')
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode))
       }
      // temporary data holder
      const body = []
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk))
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')))
    })
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
  })
}

const zeitgeist = {
  tweets: {},
  stories: {},
}

function getZeitgeist(url) {
  return new Promise((resolve, reject) => {
  requestPromise(url)
    .then((r) => resolve(JSON.parse(r)))
    .catch((err) => err)
  })
}

function populateCache() {
  const baseUrl = 'https://zeitgeist-404.firebaseio.com'

  function adaptZeitgiest(target, val) {
    getZeitgeist(`${baseUrl}/${target}/${val}.json?orderBy="$key"&limitToFirst=100`)
      .then((resp) => zeitgeist[target][val] = resp)
      .catch((err) => console.log(`GET ${target} ERROR! >> `, err))
  }

  ['tweets', 'stories'].forEach((type) => {
    getZeitgeist(`${baseUrl}/${type}.json?shallow=true`)
      .then((resp) => Object.keys(resp).forEach(adaptZeitgiest.bind(this, type)))
      .catch((err) => console.log(`GET ALL ${type} ERROR! >> `, err))
  })
}

populateCache()
setInterval(populateCache, 1000 * 60 * 5)

const router = new express.Router()

router.get('/populateZeitgeist', (req, res) => {
  res.send(zeitgeist)
})

export default router
