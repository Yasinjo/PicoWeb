import ActionTypes from '../../actionCreators/ActionTypes';
import { getActionType, getActionData } from '../../helpers/ActionGetters';

export default function hospitalsReducer(state = {}, action) {
  const data = getActionData(action);
  let newState;
  let ambulanceInfo;
  switch (getActionType(action)) {
    case ActionTypes.FETCH_DRIVERS:
      newState = {};
      data.forEach((driver) => {
        newState[driver._id] = {
          full_name: driver.full_name,
          phone_number: driver.phone_number,
          ambulance_id: driver.ambulance_id,
        };
      });

      return newState;

    case ActionTypes.MODIFY_AMBULANCE:
      newState = { ...state };
      ambulanceInfo = data.ambulanceData;
      Object.keys(newState).forEach((driverId) => {
        if (newState[driverId].ambulance_id === data.ambulanceId) {
          delete newState[driverId].ambulance_id;
        }

        if (driverId === ambulanceInfo.driver_id) {
          newState[driverId].ambulance_id = data.ambulanceId;
        }
      });

      return newState;

    case ActionTypes.REMOVE_AMBULANCE:
      newState = { ...state };
      Object.keys(newState).forEach((driverId) => {
        if (newState[driverId].ambulance_id === data.ambulanceId) {
          delete newState[driverId].ambulance_id;
        }
      });

      return newState;

    case ActionTypes.ADD_AMBULANCE:
      newState = { ...state };
      ambulanceInfo = data.ambulanceData;
      newState[ambulanceInfo.driver_id] = data.ambulanceId;

      return newState;
    default: return state;
  }
}
