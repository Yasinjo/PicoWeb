
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import SideBar from './SideBar';
import HospitalsTab from '../tabs/hospitals/index';
import AmbumlancesTab from '../tabs/ambulances/index';
import { ACTIVE_CLASSNAME } from '../constants.json';


const routes = {
  hospitals: '/',
  ambulances: '/ambulances',
};

const tabs = [
  {
    link: routes.hospitals,
    className: 'sf-house',
    label: 'Hospitals'
  },
  {
    link: routes.ambulances,
    className: 'sf-house',
    label: 'Ambulances'
  }
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

        </React.Fragment>
      </Router>
    );
  }
}
