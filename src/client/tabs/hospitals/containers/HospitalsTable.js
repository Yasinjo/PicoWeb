import { connect } from 'react-redux';
import HospitalsTable from '../components/HospitalsTable';

const mapStateToProps = state => ({
  hospitals: state.hospitals
});


export default connect(
  mapStateToProps,
  null
)(HospitalsTable);
