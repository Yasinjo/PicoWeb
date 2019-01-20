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

    default: return state;
  }
}
