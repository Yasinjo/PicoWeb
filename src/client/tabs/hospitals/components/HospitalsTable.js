import React from 'react';
import HospitalMap from './HospitalMap';
import ModifyHospitalModal from './ModifyHospitalModal';
import NoResultLabel from '../../../shared/NoResultLabel';
// import Button from '../../../shared/Button';


export default class HospitalsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addNewHospital: false,
      removeHospital: false,
      modifyHospital: false,
      targetHospitalId: null
    };
  }

    modifyClickHandler = (event) => {
      const hospitalId = event.currentTarget.getAttribute('uid');
      event.preventDefault();
      if (this.props.hospitals[hospitalId]) { this.setState({ modifyHospital: true, targetHospitalId: hospitalId }); }
    };

    removeClickHandler = (event) => {
      const hospitalId = event.currentTarget.getAttribute('uid');
      event.preventDefault();
    };

    createHosiptalRow = (hospitalId, hospitalData) => (
      <tr key={hospitalId}>
        <td>{hospitalData.name}</td>
        <td>
          <div className="map">
            <HospitalMap
              latitude={hospitalData.latitude}
              longitude={hospitalData.longitude}
              readOnly
            />
          </div>
        </td>

        <td>{hospitalData.number_of_ambulances}</td>

        <td>
          <a onClick={this.modifyClickHandler} uid={hospitalId}>
            <span className="glyphicon glyphicon-pencil" />
          </a>
        </td>
        <td>
          <a onClick={this.removeClickHandler} uid={hospitalId}>
            <span className="glyphicon glyphicon-remove" />
          </a>
        </td>

      </tr>
    );

    modifyHospitalCallback = (hospitalId, hospitalData) => {
      console.log(`hospitalId ${hospitalId}`);
      console.log('hospitalData :');
      console.log(hospitalData);
    }

    render() {
      const { hospitals } = this.props;
      const { targetHospitalId, modifyHospital } = this.state;
      const hospitalsIds = Object.keys(hospitals);
      let finalContent;
      if (hospitalsIds.length > 0) {
        const rows = hospitalsIds.map(key => this.createHosiptalRow(key, hospitals[key]));

        finalContent = (
          <table className="table table-bordered table-hover table-striped codes-table">
            <thead>
              <tr>
                <th>Hospital name</th>
                <th>Hospital position</th>
                <th>Number of ambulances</th>
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
            modifyHospital
            && (
            <ModifyHospitalModal
              onConfirm={this.modifyHospitalCallback}
              hospitalId={targetHospitalId}
              hospitalData={hospitals[targetHospitalId]}
            />
            )
          }
        </React.Fragment>
      );
    }
}
