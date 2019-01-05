import ActionTypes from '../../actionCreators/ActionTypes';
import { getActionType, getActionData } from '../../helpers/ActionGetters';

export default function loginReducer(state = {}, action) {
  switch (getActionType(action)) {
    case ActionTypes.UPDATE_CONNECTION_STATE:
      return { connected: getActionData(action) };

    default: return state;
  }
}
