import React from 'react';
import Map from 'pigeon-maps';
import Marker from 'pigeon-marker';

// import Overlay from 'pigeon-overlay';

export default class HospitalMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: props.zoom || 7
    };
  }

  changePosition = ({ latLng }) => {
    if (!this.props.readOnly) {
      const newPosition = {
        latitude: latLng[0],
        longitude: latLng[1]
      };

      if (this.props.updatePosition) {
        this.props.updatePosition({ ...newPosition, zoom: this.state.zoom });
      }
    }
  }

  zoomChange=(obj) => {
    this.setState({ zoom: obj.zoom });
  }

  render() {
    const { zoom } = this.state;
    const { longitude, latitude } = this.props;
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
