'use strict';
import Reflux from 'reflux';

import SocketService from 'services/SocketService';
import ConfirmDialog from 'components/semantic/ConfirmDialog';
import History from 'utils/History';

import OverlayConstants from 'constants/OverlayConstants';
import FavoriteDirectoryConstants from 'constants/FavoriteDirectoryConstants';
import IconConstants from 'constants/IconConstants';
import AccessConstants from 'constants/AccessConstants';

const FavoriteDirectoryActions = Reflux.createActions([
	{ 'create': { 
		displayName: 'Add directory',
		access: AccessConstants.SETTINGS_EDIT, 
		icon: IconConstants.CREATE },
	},
	{ 'edit': { 
		displayName: 'Edit directory',
		access: AccessConstants.SETTINGS_EDIT, 
		icon: IconConstants.EDIT },
	},
	{ 'remove': { 
		asyncResult: true, 
		children: [ 'confirmed' ], 
		displayName: 'Remove directory',
		access: AccessConstants.SETTINGS_EDIT,
		icon: IconConstants.REMOVE },
	},
]);

FavoriteDirectoryActions.create.listen(function (location) {
	History.pushModal(location, location.pathname + '/directory', OverlayConstants.FAVORITE_DIRECTORY_MODAL);
});

FavoriteDirectoryActions.edit.listen(function (directory, location) {
	History.pushModal(location, location.pathname + '/directory', OverlayConstants.FAVORITE_DIRECTORY_MODAL, { directoryEntry: directory });
});

FavoriteDirectoryActions.remove.listen(function (directory) {
	const options = {
		title: this.displayName,
		content: 'Are you sure that you want to remove the favorite directory ' + directory.name + '?',
		icon: this.icon,
		approveCaption: 'Remove directory',
		rejectCaption: "Don't remove",
	};

	ConfirmDialog(options, this.confirmed.bind(this, directory));
});

FavoriteDirectoryActions.remove.confirmed.listen(function (directory) {
	const that = this;
	return SocketService.post(FavoriteDirectoryConstants.DIRECTORY_DELETE_URL, { path: directory.path })
		.then(FavoriteDirectoryActions.remove.completed.bind(that, directory))
		.catch(FavoriteDirectoryActions.remove.failed.bind(that, directory));
});

export default FavoriteDirectoryActions;