'use strict';

import React from 'react';
import LoginActions from 'actions/LoginActions'

import { Link } from 'react-router';
import { Lifecycle } from 'react-router'

import '../style.css'

export default function(Component, semanticModuleName, semanticModuleSettings) {
  const OverlayDecorator = React.createClass({
    displayName: "OverlayDecorator",
    mixins: [ Lifecycle ],

    changeHistoryState: true,
    routerWillLeave(nextLocation) {
      this.changeHistoryState = false;

      let dom = React.findDOMNode(this);
      $(dom)[semanticModuleName]('hide');
    },

    propTypes: {
      /**
       * Removes portal from DOM
       */
      onHidden: React.PropTypes.func.isRequired,

      /**
       * Returns to the location that was active before opening the overlay
       */
      onHide: React.PropTypes.func.isRequired
    },

    componentDidMount() {
      const settings = Object.assign({
        onHidden: this.onHidden,
        onHide: this.onHide,
      }, semanticModuleSettings(this.props));



      let dom = React.findDOMNode(this);
      $(dom)[semanticModuleName](settings)[semanticModuleName]('show');
    },

    onHide() {
      this.props.onHide();
      //if (this.changeHistoryState) {
      //  this.props.restoreState();
      //}
    },

    onHidden() {
      this.props.onHidden(this.changeHistoryState);
    },

    render() {
      return <Component {...this.props} {...this.state}/>
    }
  });

  return OverlayDecorator;
}