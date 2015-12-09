import React from 'react';

import TableActions from 'actions/TableActions';

import FilterBox from './FilterBox';
import TableContainer from './TableContainer';
import RowDataLoader from './RowDataLoader';

import './style.css';
import 'fixed-data-table/dist/fixed-data-table.css';


const VirtualTable = React.createClass({
	propTypes: {
		/**
		 * Elements to append to the table footer
		 */
		footerData: React.PropTypes.node,

		/**
		 * Returns a node to render if there are no rows to display
		 */
		emptyRowsNodeGetter: React.PropTypes.func,

		/**
		 * Possible ID of the current view (items will be cleared when the ID changes)
		 */
		viewId: React.PropTypes.any,
	},

	componentWillMount() {
		this._dataLoader = new RowDataLoader(this.props.store, () => this.forceUpdate() );
		TableActions.start(this.props.store.viewUrl, this.props.entityId);
	},

	componentDidMount() {
		this.unsubscribe = this.props.store.listen(this.onItemsUpdated);
	},

	componentWillUnmount() {
		TableActions.close(this.props.store.viewUrl);

		this.unsubscribe();
	},

	componentWillReceiveProps(nextProps) {
		const { viewUrl } = this.props.store;
		if (nextProps.entityId !== this.props.entityId) {
			TableActions.close(viewUrl);
			TableActions.start(viewUrl, nextProps.entityId);
		}

		if (nextProps.viewId != this.props.viewId) {
			TableActions.clear(viewUrl);
		}
	},

	onItemsUpdated(items, rangeOffset) {
		this._dataLoader.onItemsUpdated(items, rangeOffset);
		this._dataLoader.items = items;
		//this.rangeOffset = rangeOffset;
	},

	render: function () {
		const { footerData, emptyRowsNodeGetter, ...other } = this.props;

		// We can't render this here because the table must be kept mounted and receiving updates
		let emptyRowsNode;
		if (this.props.emptyRowsNodeGetter && this.props.store.rowCount === 0) {
			emptyRowsNode = this.props.emptyRowsNodeGetter();

			// null won't work because we must be able to get the dimensions
			if (emptyRowsNode === null) {
				emptyRowsNode = (<div></div>);
			}
		}

		//console.log('Render virtual table');
		return (
			<div className="virtual-table">
				<TableContainer { ...other } emptyRowsNode={emptyRowsNode} dataLoader={this._dataLoader}/>
				{ emptyRowsNode === undefined ? (
					<div className="table-footer">
						{ footerData }
						<div className="filter">
							<FilterBox viewUrl={ this.props.store.viewUrl }/>
							{ this.props.filter ? React.cloneElement(this.props.filter, { viewUrl: this.props.store.viewUrl }) : null }
						</div>
					</div>
				) : null }
			</div>
		);
	}
});

export default VirtualTable;
