import update from 'react-addons-update';

import { createHistory } from 'history';
import { useRouterHistory } from 'react-router';

import OverlayConstants from 'constants/OverlayConstants';


const History = (useRouterHistory(createHistory))();


const mergeOverlayData = (locationState, overlayId, data) => {
	return update(locationState, { 
		[overlayId]: { 
			data: { $merge: data } 
		} 
	});
};

const getOverlayState = (currentLocation, overlayId, data) => {
	console.assert(currentLocation, 'Current location not supplied for overlay creation');
	console.assert(currentLocation.query, 'Invalid location object supplied for overlay creation');

	const state = currentLocation.state ? Object.assign({}, currentLocation.state) : {};
	if (!state[overlayId]) {
		// Creating the overlay
		state[overlayId] = {
			returnTo: currentLocation.pathname,
			data: data || {}
		};

		return state;
	}

	// Merge the new data
	return mergeOverlayData(state, overlayId, data || {});
};

const OverlayHelpers = {
	pushModal: function (currentLocation, pathname, overlayId, data) {
		const state = getOverlayState(currentLocation, 'modal_' + overlayId, data);
		History.push({ 
			state, 
			pathname
		});
	},

	replaceSidebar: function (currentLocation, pathname, data) {
		const state = getOverlayState(currentLocation, OverlayConstants.SIDEBAR_ID, data);
		History.replace({
			state, 
			pathname,
		});
	},

	pushSidebar: function (currentLocation, pathname, data) {
		// replaceState is invoked automatically if the path hasn't changed
		const state = getOverlayState(currentLocation, OverlayConstants.SIDEBAR_ID, data);
		History.push({
			state, 
			pathname,
		});
	},

	// Append new location data when in sidebar layout and create a new history entry
	pushSidebarData: function (currentLocation, data) {
		const state = mergeOverlayData(currentLocation.state, OverlayConstants.SIDEBAR_ID, data);
		History.push({
			state, 
			pathname: currentLocation.pathname,
		});
	},

	// Append new location data when in sidebar layout without creating a new history entry
	replaceSidebarData: function (currentLocation, data) {
		const state = mergeOverlayData(currentLocation.state, OverlayConstants.SIDEBAR_ID, data);
		History.replace({ 
			state, 
			pathname: currentLocation.pathname,
		});
	},

	// Shorthand function for receiving the data
	// Data for modals is converted to regular props by the parent decorator but it won't work well with a nested sidebar structure
	getSidebarData: function (currentLocation) {
		return currentLocation.state[OverlayConstants.SIDEBAR_ID].data;
	},
};

export default Object.assign(History, OverlayHelpers);
