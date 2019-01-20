import React from 'react';
import WrapTabContent from '../../shared/WrapTabContent';
import HospitalsTable from './containers/HospitalsTable';

const TabComponent = () => (
  <React.Fragment>
    <div className="anchor" id="a0" />
    <div className="container-fluid">
      <div style={{ height: '20px' }} />
      <HospitalsTable />
    </div>

  </React.Fragment>
);

const TabContent = WrapTabContent(TabComponent, 'Hospitals');
export default TabContent;
