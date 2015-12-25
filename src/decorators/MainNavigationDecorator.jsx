import React from 'react';
import Reflux from 'reflux';

import HubSessionStore from 'stores/HubSessionStore';
import PrivateChatSessionStore from 'stores/PrivateChatSessionStore';
import 'stores/FilelistSessionStore'; // must be required here for now
import LogStore from 'stores/LogStore';

import LoginStore from 'stores/LoginStore';
import AccessConstants from 'constants/AccessConstants';


const MainNavigationItems = [
	{
		title: 'Home',
		url: '/',
		icon: 'home',
	}, {
		title: 'Favorites',
		url: '/favorite-hubs',
		icon: 'yellow star',
		access: AccessConstants.FAVORITE_HUBS_VIEW,
	}, {
		title: 'Queue',
		url: '/queue',
		icon: 'green download',
		access: AccessConstants.QUEUE_VIEW,
	}, {
		title: 'Search',
		url: '/search',
		icon: 'search',
		access: AccessConstants.SEARCH,
	}, {
		title: 'Settings',
		url: '/settings',
		icon: 'configure',
		access: AccessConstants.SETTINGS_VIEW,
	}
];

const SecondaryMenuItems = [
	{
		title: 'Hubs',
		url: '/hubs',
		icon: 'blue sitemap',
		unreadInfoStore: HubSessionStore,
		access: AccessConstants.HUBS_VIEW,
	}, {
		title: 'Messages',
		url: '/messages',
		icon: 'blue comments',
		unreadInfoStore: PrivateChatSessionStore,
		access: AccessConstants.PRIVATE_CHAT_VIEW,
	}, {
		title: 'Filelists',
		url: '/filelists',
		icon: 'blue browser',
		access: AccessConstants.FILELISTS_VIEW,
	}, {
		title: 'Events',
		url: '/events',
		icon: 'blue history',
		unreadInfoStore: LogStore,
		access: AccessConstants.EVENTS,
	}
];

const filterItem = item => !item.access || LoginStore.hasAccess(item.access);

export default function (Component) {
	const MainNavigationDecorator = React.createClass({
		mixins: [ Reflux.connect(PrivateChatSessionStore, 'chatSessions'), Reflux.connect(HubSessionStore, 'hubSessions'), Reflux.connect(LogStore, 'logMessages') ],
		render() {
			return (
				<Component 
					{...this.props} 
					secondaryMenuItems={ SecondaryMenuItems.filter(filterItem) } 
					mainMenuItems={ MainNavigationItems.filter(filterItem) }
				/>
			);
		}
	});

	return MainNavigationDecorator;
}