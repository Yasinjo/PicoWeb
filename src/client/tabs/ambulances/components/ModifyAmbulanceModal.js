import React from 'react';
import uuid4 from 'uuid/v4';

import Modal from '../../../shared/Modal';
import { REQUIRED_FIELD } from '../../../constants.json';

export default class ModifyAmbulanceModal extends React.Component {
  constructor(props) {
    super(props);
    const { ambulanceData } = this.props;
    this.fileUploadRef = React.createRef();
    this.state = {
      registrationNumber: ambulanceData.registration_number,
      currentDriver: ambulanceData.driver_id || '',
      handledHospitals: ambulanceData.hospital_ids,
      errors: {}
    };
  }

  createDivClassName = (fieldId) => {
    let className = 'form-group';
    const { errors } = this.state;
    if (errors[fieldId] && errors[fieldId].length > 0) { className += ' has-error'; }
    return className;
  };

  createDriversOptions = () => {
    const { drivers } = this.props;
    const driverIds = Object.keys(drivers);
    const options = driverIds.map(driverId => (
      <option key={driverId} value={driverId}>
        {drivers[driverId].full_name}
      </option>
    ));

    return options;
  }

  createHospitalsOptions = () => {
    const { hospitals } = this.props;
    const hospitalIds = Object.keys(hospitals);
    const options = hospitalIds.map(hospitalId => (
      <option key={hospitalId} value={hospitalId}>
        {hospitals[hospitalId].name}
      </option>
    ));

    return options;
  }

  handleRegistrationNumberChange = e => this.setState({
    registrationNumber: e.currentTarget.value
  });

  handleDriverChange = e => this.setState({ currentDriver: e.currentTarget.value });

  handleHospitalChange = (e) => {
    const { options } = e.currentTarget;
    const handledHospitals = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        handledHospitals.push(options[i].value);
      }
    }
    this.setState({ handledHospitals });
  };

  onConfirmModal = () => {
    if (!this.state.registrationNumber || !this.state.registrationNumber.trim().length) {
      return this.setState({ errors: { name: REQUIRED_FIELD } });
    }

    const newData = {
      registration_number: this.state.registrationNumber,
      driver_id: this.state.currentDriver,
      hospital_ids: this.state.handledHospitals
    };
    const { ambulanceId, onConfirm } = this.props;
    const image = (this.fileUploadRef.current.files) ? this.fileUploadRef.current.files[0] : null;
    return onConfirm(ambulanceId, { ...newData, image });
  }

  render() {
    const {
      registrationNumber, currentDriver, handledHospitals, errors
    } = this.state;

    const { onClose } = this.props;
    let handledHospitalsArray;
    if (handledHospitals) {
      handledHospitalsArray = [...handledHospitals];
    } else {
      handledHospitalsArray = [];
    }

    const fields = (
      <React.Fragment>
        <div className={this.createDivClassName('registrationNumber')}>
          <label htmlFor="registrationNumber" className="col-sm-4 control-label">
            Registration number
          </label>
          <div className="col-sm-8">
            <input
              id="registrationNumber"
              type="text"
              className="form-control"
              value={registrationNumber}
              onChange={this.handleRegistrationNumberChange}
            />
            {errors.registrationNumber
                  && <span className="help-block">{errors.registrationNumber}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="driver" className="col-sm-4 control-label">
            Ambulance driver
          </label>
          <div className="col-sm-8">
            <select defaultValue={currentDriver} className="form-control" onChange={this.handleDriverChange}>
              <option key={uuid4()}>No driver is selected</option>
              {this.createDriversOptions()}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="hospitals" className="col-sm-4 control-label">
            Handled hospitals
          </label>
          <div className="col-sm-8">
            <select defaultValue={handledHospitalsArray} className="form-control" onChange={this.handleHospitalChange} multiple>
              {this.createHospitalsOptions()}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="ambulance_image" className="col-sm-4 control-label">
            Ambulance image
          </label>
          <div className="col-sm-8">
            <input className="form-control" type="file" ref={this.fileUploadRef} />
          </div>
        </div>
      </React.Fragment>
    );

    return (
      <Modal title="Modify an ambulance" onConfirm={this.onConfirmModal} onClose={onClose} cofirmEnabled>
        <form className="form-horizontal">
          {fields}
        </form>
      </Modal>

    );
  }
}
