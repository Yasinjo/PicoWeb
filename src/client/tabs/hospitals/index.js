import React from 'react';
import WrapTabContent from '../../shared/WrapTabContent';

const TabComponent = () => (
  <React.Fragment>
    <div className="anchor" id="a0" />
    <div className="container-fluid cm-container-white">
        hello world !!
    </div>

  </React.Fragment>
);

const TabContent = WrapTabContent(TabComponent, 'Hospitals');
export default TabContent;
