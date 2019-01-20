import React from 'react';
import Map from 'pigeon-maps';
import Marker from 'pigeon-marker';

// import Overlay from 'pigeon-overlay';

export default class HospitalMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: props.latitude,
      longitude: props.longitude,
      zoom: props.zoom || 12
    };
  }

  changePosition = ({ latLng }) => {
    if (!this.props.readOnly) {
      const newPosition = {
        latitude: latLng[0],
        longitude: latLng[1]
      };
      this.setState(newPosition);

      if (this.props.updatePosition) {
        this.props.updatePosition({ ...newPosition, zoom: this.state.zoom });
      }
    }
  }

  getCurrentPosition = () => ({ latitude: this.state.latitude, longitude: this.state.longitude });

  zoomChange=(obj) => {
    this.setState({ zoom: obj.zoom });
  }

  render() {
    const {
      longitude, latitude, zoom
    } = this.state;
    const position = [latitude, longitude];
    return (
      <div>
        <Map
          center={position}
          zoom={zoom}
          height={400}
          onClick={this.changePosition}
          onBoundsChanged={this.zoomChange}
        >
          {
          longitude && latitude && <Marker anchor={position} payload={1} />
        }
        </Map>
      </div>

    );
  }
}
