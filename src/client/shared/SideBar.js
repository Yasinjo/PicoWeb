import React from 'react';
import { NavLink } from 'react-router-dom';
import uuid4 from 'uuid/v4';

function SideBar({ tabs, activeClassName, onTabChange }) {
  const links = tabs.map(tab => (
    <li key={uuid4()}>
      <NavLink
        to={tab.link}
        exact
        className={tab.className}
        activeClassName={activeClassName}
        onClick={onTabChange}
      >
        {tab.label}
      </NavLink>
    </li>
  ));

  return (
    <div id="cm-menu">
      <nav className="cm-navbar cm-navbar-primary">
        <div className="cm-flex">
          <div className="cm-logo" />
        </div>
        <div className="btn btn-primary md-menu-white" data-toggle="cm-menu" />
      </nav>
      <div id="cm-menu-content">
        <div id="cm-menu-items-wrapper">
          <div id="cm-menu-scroller">
            <ul className="cm-menu-items">{links}</ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
