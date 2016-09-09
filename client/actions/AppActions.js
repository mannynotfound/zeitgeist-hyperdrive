import * as types from '../constants/ActionTypes'
import fetch from 'isomorphic-fetch'

const API = process.env.API || 'http://localhost:3000/api'

export function setClient(client) {
  return (dispatch) => (
     dispatch({
      type: types.SET_CLIENT,
      client,
    })
  )
}

export function populateZeitgeistSuccess(data) {
   return {
    type: types.POPULATE_ZEITGEIST_SUCCESS,
    data,
  }
}

export function populateZeitgeist() {
  console.log('POPULATING DATA!')

  return (dispatch) => (
    fetch(`${API}/populateZeitgeist`)
      .then((response) => response.json())
      .then((json) => dispatch(populateZeitgeistSuccess(json)))
      .catch((error) => console.log(error))
  )
}
