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
  console.log('POPULATING DA CACHE')

  function getTrendTweets(trend) {
    getZeitgeist(`https://zeitgeist-404.firebaseio.com/tweets/${trend}.json?orderBy="$key"&limitToFirst=100`)
      .then((trendResp) => zeitgeist.tweets[trend] = trendResp)
      .catch((err) => console.log('GET TREND TWEETS ERROR! >> ', err))
  }

  getZeitgeist('https://zeitgeist-404.firebaseio.com/tweets.json?shallow=true')
    .then((resp) => Object.keys(resp).forEach(getTrendTweets))
    .catch((err) => console.log('GET ALL TRENDS ERROR! >> ', err))
}

populateCache()
setInterval(populateCache, 1000 * 60 * 5)

const router = new express.Router()

router.get('/populateZeitgeist', (req, res) => {
  res.send(zeitgeist)
})

export default router
