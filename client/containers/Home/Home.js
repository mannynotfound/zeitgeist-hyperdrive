import React, {PropTypes} from 'react'
// import Loading from 'react-loading'

class Home extends React.Component {
  static displayName = "Home"

  static propTypes = {
    'app': PropTypes.object
  }

  render() {
    const {app} = this.props

    return (
      <div id="Home">
        <div className="container">
          {JSON.stringify(app, 0, 2)}
        </div>
      </div>
    )
  }
}

export default Home
