import React from 'react';
import WrapTabContent from '../../shared/WrapTabContent';
import AmbulancesTable from './containers/AmbulancesTable';

const TabComponent = () => (
  <React.Fragment>
    <div className="anchor" id="a0" />
    <div className="container-fluid">
      <div style={{ height: '20px' }} />
      <AmbulancesTable />
    </div>

  </React.Fragment>
);

const TabContent = WrapTabContent(TabComponent, 'Ambulances');
export default TabContent;
