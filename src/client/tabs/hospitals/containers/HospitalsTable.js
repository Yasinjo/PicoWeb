import { connect } from 'react-redux';
import HospitalsTable from '../components/HospitalsTable';
import { modifyHospitalHelper, removeHospitalHelper } from '../../../actionCreators/Hospitals';

const mapStateToProps = state => ({
  hospitals: state.hospitals
});

const mapDispatchToProps = dispatch => ({
  modifyHospital: (hospitalId, hospitalData) => modifyHospitalHelper(dispatch,
    hospitalId, hospitalData),
  removeHospital: hospitalId => removeHospitalHelper(hospitalId, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HospitalsTable);
