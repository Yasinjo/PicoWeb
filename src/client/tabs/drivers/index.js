import React from 'react';
import WrapTabContent from '../../shared/WrapTabContent';
import DriversTable from './containers/DriversTable';

const TabComponent = () => (
  <React.Fragment>
    <div className="anchor" id="a0" />
    <div className="container-fluid">
      <div style={{ height: '20px' }} />
      <DriversTable />
    </div>

  </React.Fragment>
);

const TabContent = WrapTabContent(TabComponent, 'Drivers');
export default TabContent;
