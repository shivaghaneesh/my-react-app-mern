import {
  REGISTRATION_FAIL,
  REGISTRATION_SUCCESS,
  AUTH_ERROR,
  USER_LOADED,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
} from '../actions/Types';
import axios from 'axios';
import SetAlert from './alert';
import SetAuthToken from '../utils/SetAuthToken';

//Register
export const register = ({ name, email, password }) => async (dispatch) => {
  //console.log({ name, email, password });
  const config = {
    headers: {
      'Context-Type': 'application/json',
    },
  };
  try {
    const requestBody = { name, email, password };
    //  console.log(body);
    let response = await axios.post('/api/users', requestBody, config);

    dispatch({
      type: REGISTRATION_SUCCESS,
      payload: response.data,
    });
    dispatch(loadUser());
  } catch (err) {
    //  console.log(err);
    const errors =
      err && err.response && err.response.data && err.response.data.errors;
    console.log(err);
    if (errors && errors.length > 0) {
      errors.forEach((e) => {
        dispatch(SetAlert(e.message, 'danger'));
        console.log(e);
      });
    }

    dispatch({
      type: REGISTRATION_FAIL,
    });
  }
};

export const loadUser = () => async (dispatch) => {
  const token = localStorage.token;

  try {
    if (token) {
      SetAuthToken(token);
      const response = await axios.get('/api/auth');
      dispatch({
        type: USER_LOADED,
        payload: response.data,
      });
    } else {
      dispatch({
        type: AUTH_ERROR,
      });
    }
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

//Login
export const login = ({ email, password }) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.post('/api/auth', { email, password }, config);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: response.data,
    });

    dispatch(loadUser());
  } catch (err) {
    const errors =
      err && err.response && err.response.data && err.response.data.errors;
    console.log(err);
    if (errors && errors.length > 0) {
      errors.forEach((e) => {
        dispatch(SetAlert(e.message, 'danger'));
        console.log(e);
      });
    }
    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

//Logout
export const logout = () => (dispatch) => {
  dispatch({
    type: LOGOUT,
  });
};
