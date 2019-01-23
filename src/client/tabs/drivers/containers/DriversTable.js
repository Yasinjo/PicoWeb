import { connect } from 'react-redux';
import DriversTable from '../components/DriversTable';
import { modifyDriverHelper } from '../../../actionCreators/Drivers';

const mapDispatchToProps = dispatch => ({
  modifyDriver: (driverId, driverData) => modifyDriverHelper(dispatch,
    driverId, driverData)
});

const mapStateToProps = state => ({
  ambulances: state.ambulances,
  drivers: state.drivers
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DriversTable);
