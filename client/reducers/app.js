import * as types from '../constants/ActionTypes'

export default function app(state = {}, action) {
  const newState = {...state}

  switch (action.type) {
    case types.POPULATE_ZEITGEIST_SUCCESS:
      console.log('POPULATE_ZEITGEIST_SUCCESS!!!')
      newState.zeitgeist = action.data
      return newState
    default:
      return newState
  }
}
