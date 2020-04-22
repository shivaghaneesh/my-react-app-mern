import { SET_ALERT, REMOVE_ALERT } from './Types';
import uuid from 'react-uuid';
const SetAlert = (msg, alertType) => (dispatch) => {
  const id = uuid();

  dispatch({
    type: SET_ALERT,
    payload: { id, msg, alertType },
  });

  setTimeout(
    () =>
      dispatch({
        type: REMOVE_ALERT,
        payload: { id },
      }),
    3000
  );
};

export default SetAlert;
