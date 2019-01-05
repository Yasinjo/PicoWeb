import React from 'react';

const TabHeader = ({ label }) => (
  <header id="cm-header">
    <nav className="cm-navbar cm-navbar-primary">
      <div className="cm-flex">
        <h1>{label}</h1>
      </div>
    </nav>
  </header>
);

function WrapTabContent(WrappedComponent, label) {
  const HOC = props => (
    <React.Fragment>
      <TabHeader label={label} />
      <div id="global">
        <WrappedComponent {...props} />
      </div>
    </React.Fragment>
  );

  return HOC;
}

export default WrapTabContent;
