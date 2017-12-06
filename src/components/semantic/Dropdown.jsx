import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import invariant from 'invariant';

import classNames from 'classnames';

import DropdownCaption from './DropdownCaption';
import Icon from './Icon';

import 'semantic-ui/components/button.min.css'; // for button style
import 'semantic-ui/components/dropdown';
import 'semantic-ui/components/dropdown.min.css';


class Dropdown extends React.PureComponent {
  static propTypes = {
    /**
		 * Node to render as caption
		 */
    caption: PropTypes.node,

    /**
		 * Dropdown icon to display
		 * If caption isn't specified, the icon will be used as main trigger
		 */ 
    triggerIcon: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node,
    ]),

    /**
		 * Show trigger icon on the left side of the caption instead of after it
		 */
    leftIcon: PropTypes.bool,

    /**
		 * Direction to render
		 */
    direction: PropTypes.string,

    /**
		 * Returns DOM node used for checking whether the dropdown can fit on screen
		 */
    contextElement: PropTypes.string,

    /**
		 * Render as button
		 */
    button: PropTypes.bool,

    settings: PropTypes.object,
  };

  static defaultProps = {
    triggerIcon: 'angle down',
    direction: 'auto',
  };

  state = {
    visible: false,
  };

  componentDidMount() {
    // Use timeout to allow all parents finish mounting (otherwise we get no context)
    setTimeout(this.init);
  }

  componentWillUnmount() {
    if (this.c) {
      $(this.c).dropdown('destroy');
    }
  }

  onShow = () => {
    this.setState({
      visible: true,
    });
  };

  onHide = () => {
    this.setState({
      visible: false,
    });
  };

  hide = () => {
    // Don't hide before the click event is processed by React
    setTimeout(_ => 
      $(this.c).dropdown('hide')
    );
  };

  init = () => {
    const settings = {
      direction: this.props.direction,
      action: this.hide,
      showOnFocus: false, // It can become focused when opening a modal
      onShow: this.onShow,
      onHide: this.onHide,
      ...this.props.settings,
      //debug: true,
      //verbose: true,
    };

    if (this.props.contextElement) {
      settings['context'] = this.props.contextElement;
      invariant(settings['context'], 'Context missing from dropdown');
    }

    $(this.c).dropdown(settings);
  };

  getMenuItems = () => {
    if (!this.state.visible) {
      // The menu wouldn't load otherwise
      return <div className="item"/>;
    }

    const { children } = this.props;

    return React.Children.map(children, (child, index) => {
      return child.type.name !== 'DropdownSection' ? child : (
        <Fragment key={ index }>
          { child }
          { (children.length && index !== children.length - 1) && <div className="ui divider"/> }
        </Fragment>
      );
    });
  };

  render() {
    const { leftIcon, caption, button, triggerIcon, captionIcon } = this.props;
    const className = classNames(
      'ui',
      'dropdown',
      'item',
      this.props.className,
      { 'icon button': button },
      { 'labeled': button && caption },
      { 'left-icon': leftIcon },
    );

    let icon = <Icon icon={ triggerIcon } className="trigger"/>;
    return (
      <div 
        ref={ c => this.c = c } 
        className={ className }
      >
        { (leftIcon && caption) && icon }
        <DropdownCaption icon={ captionIcon }>
          { !!caption ? caption : icon }
        </DropdownCaption>
        { leftIcon || !caption ? null : icon }

        <div className="menu">
          { this.getMenuItems() }
        </div>
      </div>
    );
  }
}

export default Dropdown;
