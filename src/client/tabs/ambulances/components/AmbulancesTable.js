import React from 'react';
import NoResultLabel from '../../../shared/NoResultLabel';
import ModifyAmbulanceModal from './ModifyAmbulanceModal';
import AddAmbulanceModal from './AddAmbulanceModal';
import Modal from '../../../shared/Modal';
import AddItemButton from '../../../shared/AddItemButton';

const NO_IMAGE_AVAILABLE_SRC = '../img/no_image_available.jpg';
const CENTERED_TEXT_STYLE = { textAlign: 'center' };

function onErrorImageLoading(e) {
  e.preventDefault();
  e.currentTarget.src = NO_IMAGE_AVAILABLE_SRC;
}

function createImageElement(imageSrc) {
  return (
    <img src={imageSrc} alt="ambulance" width="150" height="150" onError={onErrorImageLoading} />
  );
}

function createAmbulanceImageElement(ambulanceId) {
  const imageSrc = (ambulanceId) ? `http://${window.location.host}/api/ambulances/image/${ambulanceId}.jpg` : '';
  return createImageElement(imageSrc);
}

function createDriverImageElement(driverId) {
  const imageSrc = (driverId) ? `http://${window.location.host}/api/drivers/image/${driverId}.jpg` : '';
  return createImageElement(imageSrc);
}


export default class AmbulancesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addNewAmbulance: false,
      removeAmbulance: false,
      modifyAmbulance: false,
      targetAmbulanceId: null
    };
  }

  modifyClickHandler = (event) => {
    const ambulanceId = event.currentTarget.getAttribute('uid');
    event.preventDefault();
    if (this.props.ambulances[ambulanceId]) {
      this.setState({ modifyAmbulance: true, targetAmbulanceId: ambulanceId });
    }
  };

  removeClickHandler = (event) => {
    const ambulanceId = event.currentTarget.getAttribute('uid');
    event.preventDefault();
    if (this.props.ambulances[ambulanceId]) {
      this.setState({ removeAmbulance: true, targetAmbulanceId: ambulanceId });
    }
  }

  addNewAmbulanceClickHandler = () => {
    this.setState({ addNewAmbulance: true });
  }

  createAmbulanceRow = (ambulanceId, ambulanceData) => {
    let driver = null;
    if (this.props.drivers && ambulanceData.driver_id) {
      driver = this.props.drivers[ambulanceData.driver_id];
    }

    return (
      <tr key={ambulanceId}>
        <td style={CENTERED_TEXT_STYLE}>{createAmbulanceImageElement(ambulanceId)} </td>

        <td>{ambulanceData.registration_number}</td>

        <td style={CENTERED_TEXT_STYLE}>{createDriverImageElement(ambulanceData.driver_id)}</td>

        <td>{driver && driver.full_name}</td>
        <td>{driver && driver.phone_number}</td>
        <td>{ambulanceData.hospital_ids.length}</td>

        <td>
          <a onClick={this.modifyClickHandler} uid={ambulanceId}>
            <span className="glyphicon glyphicon-pencil" />
          </a>
        </td>
        <td>
          <a onClick={this.removeClickHandler} uid={ambulanceId}>
            <span className="glyphicon glyphicon-remove" />
          </a>
        </td>

      </tr>
    );
  };

  onConfirmModifyAmbulance = (ambulanceId, ambulanceData) => {
    this.props.modifyAmbulance(ambulanceId, ambulanceData);
    this.onCloseModifyAmbulance();
  }

  onCloseModifyAmbulance = () => {
    this.setState({ modifyAmbulance: false, targetAmbulanceId: null });
  }

  onConfirmRemoving = () => {
    this.props.removeAmbulance(this.state.targetAmbulanceId);
    this.onCloseRemoving();
  }

  onCloseRemoving = () => this.setState({ removeAmbulance: false, targetAmbulanceId: null });

  addAmbulanceOnConfirm = (ambulanceData) => {
    this.props.addAmbulance(ambulanceData);
    this.addAmbulanceOnClose();
  }

  addAmbulanceOnClose = () => {
    this.setState({ addNewAmbulance: false });
  }

  render() {
    const { ambulances, drivers, hospitals } = this.props;
    const {
      modifyAmbulance, removeAmbulance, addNewAmbulance, targetAmbulanceId
    } = this.state;

    const ambulancesIds = Object.keys(ambulances);
    let finalContent;
    if (ambulancesIds.length > 0) {
      const rows = ambulancesIds.map(key => this.createAmbulanceRow(key, ambulances[key]));

      finalContent = (
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Ambulance image</th>
              <th>Registration number</th>
              <th>Driver image</th>
              <th>Driver full name</th>
              <th>Driver phone number</th>
              <th>Handled hospitals</th>
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
        <AddItemButton onClick={this.addNewAmbulanceClickHandler}>
            Add new Ambulance
        </AddItemButton>

        {
          modifyAmbulance
          && (
          <ModifyAmbulanceModal
            onConfirm={this.onConfirmModifyAmbulance}
            onClose={this.onCloseModifyAmbulance}
            ambulanceId={targetAmbulanceId}
            ambulanceData={ambulances[targetAmbulanceId]}
            drivers={drivers}
            hospitals={hospitals}
          />
          )
        }

        {
          removeAmbulance
          && (
            <Modal
              title="Remove an ambulance"
              onConfirm={this.onConfirmRemoving}
              onClose={this.onCloseRemoving}
              cofirmEnabled
            >
              Are you sure ?
            </Modal>
          )
        }

        {
          addNewAmbulance
          && (
          <AddAmbulanceModal
            onConfirm={this.addAmbulanceOnConfirm}
            onClose={this.addAmbulanceOnClose}
            drivers={drivers}
            hospitals={hospitals}
          />
          )
        }
      </React.Fragment>
    );
  }
}
