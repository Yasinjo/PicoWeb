import ActionTypes from '../../actionCreators/ActionTypes';
import { getActionType, getActionData } from '../../helpers/ActionGetters';

export default function loginReducer(state = {}, action) {
  const data = getActionData(action);
  let newState;
  switch (getActionType(action)) {
    case ActionTypes.FETCH_HOSPITALS:
      newState = {};
      data.forEach((hospital) => {
        newState[hospital._id] = {
          name: hospital.name,
          number_of_ambulances: hospital.number_of_ambulances,
          longitude: hospital.longitude,
          latitude: hospital.latitude
        };
      });

      return newState;

    default: return state;
  }
}
