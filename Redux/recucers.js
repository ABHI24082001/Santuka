// reducers.js

import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE } from './ActionType';

const initialState = {
  loading: false,
  errorMessage: '',
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, errorMessage: '' };
    case LOGIN_SUCCESS:
      return { ...state, loading: false, errorMessage: '' };
    case LOGIN_FAILURE:
      return { ...state, loading: false, errorMessage: action.payload };
    default:
      return state;
  }
};

export default loginReducer;
