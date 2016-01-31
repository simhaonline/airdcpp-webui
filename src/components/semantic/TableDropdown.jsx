import React from 'react';
import Popup from './Popup';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import invariant from 'invariant';
import DropdownCaption from './DropdownCaption';


// A popup-based class for handling dropdowns in Fixed Data Table
// The normal styled dropdown won"t work there because the table cell won"t allow overflow
// https://github.com/facebook/fixed-data-table/issues/180

const TableDropdown = React.createClass({
	mixins: [ PureRenderMixin ],
	propTypes: {
		/**
		 * Cell content to render
		 */
		caption: React.PropTypes.node.isRequired,

		/**
		 * Trigger the dropdown when clicking on the caption
		 */
		linkCaption: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			linkCaption: true,
			className: '',
		};
	},

	addCloseHandler(elem) {
		if (elem.type === 'div') {
			// Divider
			return elem;
		}

		invariant(elem.props.onClick, 'Invalid item for table dropdown (click handler missing)');
		return React.cloneElement(elem, {
			onClick: () => {
				this.refs.dropdownMenu.hide();
				
				elem.props.onClick();
			} 
		});
	},

	render: function () {
		let caption = (
			<DropdownCaption>
				{ this.props.caption }
			</DropdownCaption>
		);

		// Caption
		const trigger = (
			<div className="trigger">
				<i className="large angle down icon"></i>
				{ this.props.linkCaption ? caption : null }
			</div>);

		// Settings
		const settings = {
			lastResort:true
		};

		return (
			<div className={ 'table dropdown ' + this.props.className }>
				<Popup 
					className="basic" 
					trigger={ trigger } 
					settings={ settings } 
					ref="dropdownMenu"
					position="bottom left"
				>
					<div className="ui text menu vertical">
						<div className="ui dropdown item table-items">
							{ this.props.children.map(this.addCloseHandler) }
						</div>
					</div>
				</Popup>
				{ this.props.linkCaption ? null : caption }
			</div>);
	}
});

export default TableDropdown;