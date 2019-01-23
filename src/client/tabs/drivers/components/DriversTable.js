import React from 'react';
import NoResultLabel from '../../../shared/NoResultLabel';
import ModifyDriverModal from './ModifyDriverModal';
import Modal from '../../../shared/Modal';
import { CENTERED_TEXT_STYLE, createDriverImageElement, createAmbulanceImageElement } from '../../ambulances/components/AmbulancesTable';

export default class DriversTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addNewDriver: false,
      removeDriver: false,
      modifyDriver: false,
      targetDriverId: null
    };
  }

  modifyClickHandler = (event) => {
    const driverId = event.currentTarget.getAttribute('uid');
    event.preventDefault();
    if (this.props.drivers[driverId]) {
      this.setState({ modifyDriver: true, targetDriverId: driverId });
    }
  };

  removeClickHandler = (event) => {
    const driverId = event.currentTarget.getAttribute('uid');
    event.preventDefault();
    if (this.props.drivers[driverId]) {
      this.setState({ removeDriver: true, targetDriverId: driverId });
    }
  }

  createDriverRow = (driverId, driverData) => {
    let ambulance;
    if (this.props.ambulances && driverData.ambulance_id) {
      ambulance = this.props.ambulances[driverData.ambulance_id];
    }

    return (
      <tr key={driverId}>
        <td>{driverData.full_name}</td>
        <td>{driverData.phone_number}</td>
        <td style={CENTERED_TEXT_STYLE}>{createDriverImageElement(driverId)}</td>
        <td>{ambulance && ambulance.registration_number}</td>
        <td style={CENTERED_TEXT_STYLE}>
          {ambulance && createAmbulanceImageElement(driverData.ambulance_id)}
        </td>
        <td>
          <a onClick={this.modifyClickHandler} uid={driverId}>
            <span className="glyphicon glyphicon-pencil" />
          </a>
        </td>
        <td>
          <a onClick={this.removeClickHandler} uid={driverId}>
            <span className="glyphicon glyphicon-remove" />
          </a>
        </td>

      </tr>
    );
  };

  onConfirmModifyDriver = (driverId, driverData) => this.props.modifyDriver(driverId, driverData)
    .then(() => this.onCloseModifyDriver())

  onCloseModifyDriver = () => this.setState({ modifyDriver: false });

  onConfirmRemoving = () => {
    this.props.removeDriver(this.state.targetDriverId);
    this.onCloseRemoving();
  };

  onCloseRemoving = () => this.setState({ removeDriver: false, targetDriverId: null });;

  render() {
    const { drivers } = this.props;
    const { targetDriverId, modifyDriver, removeDriver } = this.state;
    let finalContent;
    const driversIds = Object.keys(drivers);
    if (driversIds.length > 0) {
      const rows = driversIds.map(key => this.createDriverRow(key, drivers[key]));

      finalContent = (
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Full name</th>
              <th>Phone number</th>
              <th>Image</th>
              <th>Ambulance registration number</th>
              <th>Ambulance image</th>
              <th>Modify</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      );
    } else {
      finalContent = <NoResultLabel />;
    }

    return (
      <React.Fragment>
        {finalContent}

        {
          modifyDriver
          && (
          <ModifyDriverModal
            onConfirm={this.onConfirmModifyDriver}
            onClose={this.onCloseModifyDriver}
            driverId={targetDriverId}
            driverData={drivers[targetDriverId]}
          />
          )
        }

        {
          removeDriver
          && (
            <Modal
              title="Remove a driver"
              onConfirm={this.onConfirmRemoving}
              onClose={this.onCloseRemoving}
              cofirmEnabled
            >
              Are you sure ?
            </Modal>
          )
        }
      </React.Fragment>
    );
  }
}
