import React from 'react';
import { Checkbox } from 'react-semantify'

export default React.createClass({
  propTypes: {

    /**
     * Selection state
     */
    checked: React.PropTypes.bool.isRequired,

    /**
     * Handler for state changes (receives bool as argument)
     */
    onChange: React.PropTypes.func.isRequired
  },

  componentDidMount() {
    const settings = {
      fireOnInit: false,
      onChecked: () => this.props.onChange(true),
      onUnchecked: () => this.props.onChange(false)
    };

    let dom = React.findDOMNode(this);
    $(dom).checkbox(settings);
  },

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.checked != this.props.checked) {
      let dom = React.findDOMNode(this);
      if (nextProps.checked) {
        $(dom).checkbox('set checked');
      } else {
        $(dom).checkbox('set unchecked')
      }
    }
  },

  render: function() {
    return (
      <Checkbox className="toggle">
        <input type="checkbox" defaultChecked={ this.props.checked }/>
      </Checkbox>);
  }
});