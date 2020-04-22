import {
  REGISTRATION_FAIL,
  REGISTRATION_SUCCESS,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
} from '../actions/Types';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  user: null,
  isLoading: true,
};

const register = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case REGISTRATION_SUCCESS:
    case LOGIN_SUCCESS:
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        ...payload,
        user: null,
        isAuthenticated: true,
        isLoading: false,
      };

    case REGISTRATION_FAIL:
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        isLoading: false,
        user: null,
      };

    case USER_LOADED:
      return {
        ...state,
        user: payload,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
};

export default register;
