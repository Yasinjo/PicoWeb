import { connect } from 'react-redux';
import AmbulancesTable from '../components/AmbulancesTable';
import { modifyAmbulanceHelper, removeAmbulanceHelper, addAmbulanceHelper } from '../../../actionCreators/Ambulances';

const mapDispatchToProps = dispatch => ({
  modifyAmbulance: (ambulanceId, ambulanceData) => modifyAmbulanceHelper(dispatch,
    ambulanceId, ambulanceData),
  removeAmbulance: ambulanceId => removeAmbulanceHelper(dispatch, ambulanceId),
  addAmbulance: ambulanceData => addAmbulanceHelper(dispatch, ambulanceData)
});

const mapStateToProps = state => ({
  ambulances: state.ambulances,
  hospitals: state.allHospitals,
  drivers: state.drivers
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AmbulancesTable);
