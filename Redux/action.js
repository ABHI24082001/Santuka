// actions.js

import axios from 'axios';
import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE } from './actionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = (username, password) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    try {
      const response = await axios.post(
        'http://mis.santukatransport.in/API/Test/APILogin',
        { username, Password: password },
        { timeout: 10000 }
      );

      dispatch({ type: LOGIN_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: LOGIN_FAILURE, payload: error.message });
    }
  };
};









