import { combineReducers } from 'redux';
import alert from './alert';
import register from './auth';
const rootReducer = combineReducers({
  alert,
  register,
});

export default rootReducer;
