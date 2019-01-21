import { connect } from 'react-redux';
import AmbulancesTable from '../components/AmbulancesTable';
import { modifyAmbulanceHelper, removeAmbulanceHelper } from '../../../actionCreators/Ambulances';

const mapDispatchToProps = dispatch => ({
  modifyAmbulance: (ambulanceId, ambulanceData) => modifyAmbulanceHelper(dispatch,
    ambulanceId, ambulanceData),
  removeAmbulance: ambulanceId => removeAmbulanceHelper(dispatch, ambulanceId)
});

const mapStateToProps = state => ({
  ambulances: state.ambulances,
  hospitals: state.hospitals,
  drivers: {}
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AmbulancesTable);
