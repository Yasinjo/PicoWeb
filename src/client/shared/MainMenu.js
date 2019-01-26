
import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import SideBar from './SideBar';
import HospitalsTab from '../tabs/hospitals/index';
import AmbumlancesTab from '../tabs/ambulances/index';
import DriversTab from '../tabs/drivers/index';
import { ACTIVE_CLASSNAME } from '../constants.json';
import removeTokenFromStorage from '../helpers/removeTokenFromStorage';


const routes = {
  hospitals: '/',
  ambulances: '/ambulances',
  drivers: '/drivers',
  logout: '/logout',
};

const tabs = [
  {
    link: routes.hospitals,
    className: 'sf-building',
    label: 'Hospitals'
  },
  {
    link: routes.ambulances,
    className: 'sf-dashboard-alt',
    label: 'Ambulances'
  },
  {
    link: routes.drivers,
    className: 'sf-profile-group',
    label: 'Drivers'
  },
  {
    link: routes.logout,
    className: 'sf-lock',
    label: 'Logout'
  },
];

export default class MainMenu extends React.Component {
  constructor(props) {
    super(props);
    props.init();
  }

  render() {
    return (
      <Router>
        <React.Fragment>
          <SideBar
            activeClassName={ACTIVE_CLASSNAME}
            tabs={tabs}
            onTabChange={this.props.init}
          />

          <Route path={routes.hospitals} exact component={HospitalsTab} />
          <Route path={routes.ambulances} exact component={AmbumlancesTab} />
          <Route path={routes.drivers} exact component={DriversTab} />
          <Route
            path={routes.logout}
            render={(props) => {
              console.log('Hello from the other side');
              removeTokenFromStorage();
              this.props.updateConnection(false);
              return <Redirect {...props} to="/" />;
            }}
          />


        </React.Fragment>
      </Router>
    );
  }
}
