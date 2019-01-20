import { connect } from 'react-redux';
import AmbulancesTable from '../components/AmbulancesTable';

const mapStateToProps = state => ({
  ambulances: state.ambulances,
  drivers: {}
});

export default connect(
  mapStateToProps,
  null
)(AmbulancesTable);
