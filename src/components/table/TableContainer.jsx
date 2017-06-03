import PropTypes from 'prop-types';
import React from 'react';

import { Table } from 'fixed-data-table-2';

import TableActions from 'actions/TableActions';
import BrowserUtils from 'utils/BrowserUtils';

import Measure from 'react-measure';
import RowWrapperCell from './RowWrapperCell';
import { TextCell, HeaderCell } from './Cell';

const TABLE_ROW_HEIGHT = 50;

function convertStartToRows(pixels) {
	return Math.max(Math.floor(pixels / TABLE_ROW_HEIGHT), 0);
}

function convertEndToRows(pixels) {
	return Math.ceil(pixels / TABLE_ROW_HEIGHT);
}

const TableContainer = React.createClass({
	propTypes: {

		/**
		 * Store implementing ViewStoreMixin that contains the items
		 */
		store: PropTypes.object.isRequired,

		/**
		 * Append class names to row (takes row data as param)
		 */
		rowClassNameGetter: PropTypes.func,

		/**
		 * ID of the current entity for non-singleton sources
		 */
		entityId: PropTypes.any,

		
		dataLoader: PropTypes.any.isRequired,
	},

	getInitialState() {
		return {
			width: 0,
			height: 0,
		};
	},

	getInitialProps() {
		return {
			rowClassNameGetter: null,
			entityId: null
		};
	},

	componentWillMount() {
		this._columnWidths = { };
		this._isColumnResizing = false;
		this._scrollPosition = 0;
	},

	// This will also be used for setting the initial rows
	componentDidUpdate(prevProps, prevState) {
		if (prevState.height !== this.state.height) {
			this.updateRowRange();
		} else if (prevProps.entityId !== this.props.entityId) {
			this.updateRowRange();
		}
	},

	componentWillUnmount() {
		clearTimeout(this._scrollTimer);
	},

	updateRowRange() {
		const startRows = convertStartToRows(this._scrollPosition);
		const maxRows = convertEndToRows(this.state.height, true);

		//console.log('Settings changed, start: ' + startRows + ', end: ' + maxRows, ', height: ' + this.state.height, this.props.store.viewName);

		console.assert(this.props.store.active, 'Posting data for an inactive view');
		TableActions.setRange(this.props.store.viewUrl, startRows, maxRows);
	},

	_onScrollStart(horizontal, vertical) {
		//console.log('Scrolling started: ' + vertical, this.props.store.viewUrl);
		console.assert(this.props.store.active, 'Sending pause for an inactive view');
		TableActions.pause(this.props.store.viewUrl, true);
	},

	_onScrollEnd(horizontal, vertical) {
		this._scrollPosition = vertical;
		console.assert(this.props.store.active, 'Sending pause for an inactive view');
		TableActions.pause(this.props.store.viewUrl, false);

		clearTimeout(this._scrollTimer);
		this._scrollTimer = setTimeout(this.updateRowRange, 500);
		//console.log('Scrolling ended: ' + vertical, this.props.store.viewUrl);
	},

	_sortRowsBy(sortProperty) {
		const { store } = this.props;

		let sortAscending = true;
		if (sortProperty === store.sortProperty && store.sortAscending) {
			sortAscending = false;
		}

		TableActions.setSort(this.props.store.viewUrl, sortProperty, sortAscending);
	},

	_onColumnResizeEndCallback(newColumnWidth, dataKey) {
		this._columnWidths[dataKey] = newColumnWidth;
		this._isColumnResizing = false;
		this.forceUpdate(); // don't do this, use a store and put into this.state!
	},

	convertColumn(column) {
		if (column.props.hideWidth > this.state.width) {
			return null;
		}

		let { name, flexGrow, width, cell, columnKey, renderCondition } = column.props;
		const { store, rowClassNameGetter } = this.props;

		// Convert name
		const sortDirArrow = store.sortAscending ? ' ↑' : ' ↓';
		name += ((store.sortProperty === columnKey) ? sortDirArrow : '');

		const mobileView = BrowserUtils.useMobileLayout();
		if (!mobileView) {
			// Get column width
			if (this._columnWidths[columnKey] != undefined) {
				width = this._columnWidths[columnKey];
				flexGrow = null;
			}
		}

		return React.cloneElement(column, {
			header: (
				<HeaderCell 
					onClick={ this._sortRowsBy.bind(null, columnKey) } 
					label={ name }
				/>
			),
			flexGrow: flexGrow,
			width: width,
			isResizable: !mobileView,
			allowCellsRecycling: true,
			cell: (			
				<RowWrapperCell 
					dataLoader={ this.props.dataLoader } 
					renderCondition={ renderCondition } 
					rowClassNameGetter={ rowClassNameGetter }
				>
					{ cell ? cell : <TextCell/> }
				</RowWrapperCell>
			),
		});
	},

	onResize(contentRect) {
		const { width, height } = contentRect.entry;
		this.setState({
			width,
			height,
		});
	},
	
	render: function () {
		// Update and insert generic columns props
		const children = React.Children.map(this.props.children, this.convertColumn);

		return (
			<Measure 
				bounds={ true }
				onResize={ this.onResize }
			>
				{ ({ measureRef }) => (
					<div ref={ measureRef } className="table-container-wrapper">
						<Table
							width={ this.state.width }
							height={ this.state.height } 

							rowHeight={ 50 }
							rowsCount={ this.props.store.rowCount }
							headerHeight={ 50 }
							isColumnResizing={ this.isColumnResizing }
							onColumnResizeEndCallback={ this._onColumnResizeEndCallback }

							touchScrollEnabled={ true }

							onScrollStart={ this._onScrollStart }
							onScrollEnd={ this._onScrollEnd }
						>
							{ children }
						</Table>
					</div>
				) }
			</Measure>
		);
	}
});

export default TableContainer;