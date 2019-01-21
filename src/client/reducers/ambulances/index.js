import ActionTypes from '../../actionCreators/ActionTypes';
import { getActionType, getActionData } from '../../helpers/ActionGetters';

export default function ambulancesReducer(state = {}, action) {
  const data = getActionData(action);
  let newState;
  switch (getActionType(action)) {
    case ActionTypes.FETCH_AMBULANCES:
      newState = {};
      data.forEach((ambulance) => {
        newState[ambulance._id] = {
          registration_number: ambulance.registration_number,
          hospital_ids: ambulance.hospital_ids,
          driver_id: null
        };
      });

      return newState;

    case ActionTypes.MODIFY_AMBULANCE:
      newState = { ...state };
      const { ambulanceData } = data;
      newState[data.ambulanceId] = {
        registration_number: ambulanceData.registration_number,
        hospital_ids: ambulanceData.hospital_ids,
        driver_id: ambulanceData.driver_id
      };

      return newState;

    case ActionTypes.REMOVE_AMBULANCE:
      newState = { ...state };
      delete newState[data.ambulanceId];
      return newState;

    default: return state;
  }
}
