// store.js

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import loginReducer from './recucers';

const rootReducer = combineReducers({
  login: loginReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
