import ActionTypes from '../../actionCreators/ActionTypes';
import { getActionType, getActionData } from '../../helpers/ActionGetters';

export default function ambulancesReducer(state = {}, action) {
  const data = getActionData(action);
  let newState;
  let ambulanceInfo;
  switch (getActionType(action)) {
    case ActionTypes.FETCH_AMBULANCES:
      newState = {};
      data.forEach((ambulance) => {
        newState[ambulance._id] = {
          registration_number: ambulance.registration_number,
          hospital_ids: ambulance.hospital_ids,
          driver_id: ambulance.driver_id
        };
      });

      return newState;

    case ActionTypes.FETCH_DRIVERS:
      newState = { ...state };
      data.forEach((driver) => {
        if (newState[driver.ambulance_id]) { newState[driver.ambulance_id].driver_id = driver._id; }
      });

      return newState;

    case ActionTypes.MODIFY_AMBULANCE:
      newState = { ...state };
      ambulanceInfo = data.ambulanceData;
      newState[data.ambulanceId] = {
        registration_number: ambulanceInfo.registration_number,
        hospital_ids: ambulanceInfo.hospital_ids,
        driver_id: ambulanceInfo.driver_id
      };

      return newState;

    case ActionTypes.REMOVE_AMBULANCE:
      newState = { ...state };
      delete newState[data.ambulanceId];
      return newState;

    case ActionTypes.ADD_AMBULANCE:
      newState = { ...state };
      ambulanceInfo = data.ambulanceData;
      newState[data.ambulanceId] = {
        registration_number: ambulanceInfo.registration_number,
        hospital_ids: ambulanceInfo.hospital_ids,
        driver_id: ambulanceInfo.driver_id
      };
      return newState;

    default: return state;
  }
}
