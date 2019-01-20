import React from 'react';
import NoResultLabel from '../../../shared/NoResultLabel';

const NO_IMAGE_AVAILABLE_SRC = '../img/no_image_available.jpg';
const CENTERED_TEXT_STYLE = { textAlign: 'center' };

function onErrorImageLoading(e) {
  e.target.src = NO_IMAGE_AVAILABLE_SRC;
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

  render() {
    const { ambulances } = this.props;

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
      </React.Fragment>
    );
  }
}
