import React from 'react';

import Modal from '../../../shared/Modal';
import { REQUIRED_FIELD, PHONE_NUMBER_ALREADY_EXISTS } from '../../../constants.json';

export default class ModifyDriverModal extends React.Component {
  constructor(props) {
    super(props);
    const { driverData } = this.props;
    this.fileUploadRef = React.createRef();
    this.state = {
      fullName: driverData.full_name,
      phoneNumber: driverData.phone_number,
      errors: {}
    };
  }

  createDivClassName = (fieldId) => {
    let className = 'form-group';
    const { errors } = this.state;
    if (errors[fieldId] && errors[fieldId].length > 0) { className += ' has-error'; }
    return className;
  };

  handleNameChange = e => this.setState({
    fullName: e.currentTarget.value
  });

  handlePhoneNumberChange = e => this.setState({
    phoneNumber: e.currentTarget.value
  });

  onConfirmModal = () => {
    // Phone number already used error
    if (!this.state.fullName || !this.state.fullName.trim().length) {
      return this.setState({ errors: { fullName: REQUIRED_FIELD } });
    }

    if (!this.state.phoneNumber || !this.state.phoneNumber.trim().length) {
      return this.setState({ errors: { phoneNumber: REQUIRED_FIELD } });
    }

    const newData = {
      full_name: this.state.fullName,
      phone_number: this.state.phoneNumber
    };

    const { driverId, onConfirm } = this.props;
    const image = (this.fileUploadRef.current.files) ? this.fileUploadRef.current.files[0] : null;
    onConfirm(driverId, { ...newData, image })
      .catch((error) => {
        if (error === PHONE_NUMBER_ALREADY_EXISTS) {
          this.setState({ errors: { phoneNumber: PHONE_NUMBER_ALREADY_EXISTS } });
        }
      });
  }

  render() {
    const {
      fullName, phoneNumber, errors
    } = this.state;

    const { onClose } = this.props;


    const fields = (
      <React.Fragment>
        <div className={this.createDivClassName('fullName')}>
          <label htmlFor="fullName" className="col-sm-4 control-label">
            Full name
          </label>

          <div className="col-sm-8">
            <input
              id="fullName"
              type="text"
              className="form-control"
              value={fullName}
              onChange={this.handleNameChange}
            />
            {errors.fullName
                  && <span className="help-block">{errors.fullName}</span>}
          </div>
        </div>

        <div className={this.createDivClassName('phoneNumber')}>
          <label htmlFor="phoneNumber" className="col-sm-4 control-label">
            Phone number
          </label>

          <div className="col-sm-8">
            <input
              id="phoneNumber"
              type="text"
              className="form-control"
              value={phoneNumber}
              onChange={this.handlePhoneNumberChange}
            />
            {errors.phoneNumber
                  && <span className="help-block">{errors.phoneNumber}</span>}
          </div>
        </div>


        <div className="form-group">
          <label htmlFor="driver_image" className="col-sm-4 control-label">
            Driver image
          </label>
          <div className="col-sm-8">
            <input className="form-control" type="file" ref={this.fileUploadRef} />
          </div>
        </div>
      </React.Fragment>
    );

    return (
      <Modal title="Modify a driver" onConfirm={this.onConfirmModal} onClose={onClose} cofirmEnabled>
        <form className="form-horizontal">
          {fields}
        </form>
      </Modal>

    );
  }
}
