import React, {PropTypes} from 'react'
import {findDOMNode, render} from 'react-dom'
import Tweet from 'react-tweet'
import {isEqual} from 'lodash'

class Story extends React.Component {
  static displayName = 'Story'

  static propTypes = {
    data: PropTypes.object
  }

  render() {
    const {data} = this.props
    return (
      <div className="Story">
        <a className="Story-link" href={data.link} target="_blank">
          <i className="Story-source">{data.source}</i>
          <h1 className="Story-headline">{data.headline}</h1>
        </a>
      </div>
    )
  }
}

class ZeitgeistTweet extends React.Component {
  static displayName = 'ZeitgeistTweet'

  static propTypes = {
    data: PropTypes.object
  }

  render() {
    const {data} = this.props

    return (
      <div className="ZeitgeistTweet">
        <i className="ZeitgeistTweet-source">{data.source}</i>
        <Tweet data={data} />
      </div>
    )
  }
}

class Scene extends React.Component {
  static displayName = 'Scene'

  static propTypes = {
    elements: PropTypes.array
  }

  constructor(props) {
    super(props)
    this.cycle = true
  }

  shouldComponentUpdate() {
    return false
  }

  componentWillReceiveProps(props) {
    if (!isEqual(props.elements, this.props.elements)) {
      this.resetScene()
    }
  }

  componentDidMount() {
    this.createNewScene()
  }

  resetScene() {
    this.cycle = false
    this.scene.removeAll(() => {
      this.cycle = true
      this.createNewScene()
    })
  }

  createNewScene() {
    const container = findDOMNode(this.refs.scene)
    /* eslint-disable no-param-reassign */
    const elements = this.props.elements.map((el, i) => {
      const newEl = {...el}
      newEl.index = i
      return newEl
    })

    const limit = 50
    this.visibleElements = elements.slice(0, limit)

    const htmlElms = this.createHTML(this.visibleElements)
    const cfg = {
      mountCb: this.mountObj.bind(this)
    }

    const HTMLHyperdrive = require('html-hyperdrive')
    this.scene = new HTMLHyperdrive(container, htmlElms, cfg)
    this.scene.startScene()

    if (elements.length <= limit) {
      return
    }

    this.invisibleElements = elements.slice(limit)

    clearInterval(this.timer)
    this.timer = setInterval(() => {
      if (!this.cycle) return

      const next = this.invisibleElements.shift()
      const remove = this.visibleElements.shift()
      this.invisibleElements.push(remove)
      this.visibleElements.push(next)

      const opts = this.createHTML(next)
      this.scene.removeObject(remove.index)
      this.scene.addObject(opts, next.index)
    }, 15000)
  }

  mountObj(obj) {
    const idx = parseInt(obj.name.replace('stream_element_', ''), 10)
    const el = this.props.elements[idx]
    const CptToRender = el.headline ? Story : ZeitgeistTweet

    render(<CptToRender data={this.props.elements[idx]} />, obj.element)
  }

  createHTML(elements) {
    const elHtml = {
      style: {
        width: '590px',
        height: 'auto',
      },
      html: '<div></div>'
    }

    if (Array.isArray(elements)) {
      return elements.map(() => ({...elHtml}))
    }

    return {...elHtml}
  }

  render() {
    return (
      <div ref="scene" className="full-width" />
    )
  }
}

export default Scene
