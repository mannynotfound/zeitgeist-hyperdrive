import React, {PropTypes} from 'react'
import Scene from '../Scene/Scene'
import {map, uniq, sampleSize, shuffle} from 'lodash'
// import Loading from 'react-loading'

class Home extends React.Component {
  static displayName = "Home"

  static propTypes = {
    'app': PropTypes.object
  }

  /* Given a structure like
   * {
   *   "trend1": [tweets],
   *   "trend2": [tweets],
   * }
   *
   * this will go through each trend, sort by best (unique) tweets,
   * return the top 5, and finally flatten all to one array,
   *
   * same is true for stories but no sorting is done as there is no statistics
   * to compare
   */
  getBestElements(app) {
    const {tweets, stories} = app.zeitgeist
    if (!tweets || !stories) return []

    // get best tweets
    const bestTweets = map(
      tweets, (val, key) => uniq(val).sort((a, b) => {
        /* eslint-disable no-param-reassign */
        b.source = key
        /* temp until zeitgeist tweets support indices */
        delete a.entities
        delete b.entities

        const aRts = a.retweet_count
        const aFavs = a.favorite_count

        const bRts = b.retweet_count
        const bFavs = b.favorite_count

        const aCurve = (aRts * 4) + aFavs
        const bCurve = (bRts * 4) + bFavs

        return bCurve - aCurve
      }, {}).slice(0, 5)
    ).reduce((a, b) => a.concat(b), [])

    // get best stories
    const bestStories = map(
      stories, (val) => sampleSize(uniq(val), 15)
    ).reduce((a, b) => a.concat(b), [])

    // return 150 of each in a shuffled array
    return shuffle(sampleSize(bestTweets, 150).concat(sampleSize(bestStories, 150)))
  }

  render() {
    const {app} = this.props
    const bestElements = this.getBestElements(app)
    console.dir(bestElements)

    return (
      <div id="Home">
        <div className="container">
          <Scene elements={bestElements} />
        </div>
      </div>
    )
  }
}

export default Home
